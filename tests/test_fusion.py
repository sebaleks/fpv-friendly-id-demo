"""Coverage for the 5 fusion states + HMAC marker happy/stale/tampered paths."""
import time

from bluemark.fusion import fuse_signals
from bluemark.marker import make_marker, verify_marker, corrupt_marker
from bluemark.schemas import FusionSignal, FusionState


SECRET = b"hackathon-demo-secret-not-real"
MISSION = "MISSION-2026-05-02-A"


def _signals_from_marker(marker_evidence: dict, *, fresh: bool, mission_ok: bool, visual=None, rc=None):
    signals = [
        FusionSignal(name="marker", score=1.0 if marker_evidence.get("hmac_valid") else 0.0, evidence=marker_evidence),
        FusionSignal(name="time_window", score=1.0 if fresh else 0.0, fresh=fresh),
        FusionSignal(name="mission_match", score=1.0 if mission_ok else 0.0),
    ]
    if visual is not None:
        signals.append(FusionSignal(name="visual_profile", score=visual["score"], evidence={"label": visual["label"]}))
    if rc is not None:
        signals.append(FusionSignal(name="rc_session", score=rc))
    return signals


# Marker tests

def test_make_and_verify_marker_happy():
    now = int(time.time())
    m = make_marker(SECRET, MISSION, ts=now)
    ev = verify_marker(SECRET, m, now=now)
    assert ev["decoded"] and ev["hmac_valid"] and ev["fresh"]
    assert ev["mission_id"] == MISSION


def test_verify_marker_stale():
    now = int(time.time())
    m = make_marker(SECRET, MISSION, ts=now - 60)
    ev = verify_marker(SECRET, m, now=now, window_s=10)
    assert ev["hmac_valid"] is True
    assert ev["fresh"] is False
    assert ev["fail_reason"] == "stale"


def test_verify_marker_tampered_hmac():
    now = int(time.time())
    m = make_marker(SECRET, MISSION, ts=now)
    tampered = m[:-2] + ("00" if not m.endswith("00") else "11")
    ev = verify_marker(SECRET, tampered, now=now)
    assert ev["decoded"] is True
    assert ev["hmac_valid"] is False
    assert ev["fail_reason"] == "hmac"


def test_verify_marker_corrupted_undecodable():
    now = int(time.time())
    m = make_marker(SECRET, MISSION, ts=now)
    cm = corrupt_marker(m)
    ev = verify_marker(SECRET, cm, now=now)
    assert ev["decoded"] is False


# Fusion tests — one per state

def test_state_friendly_verified():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    signals = _signals_from_marker(ev, fresh=True, mission_ok=True,
                                   visual={"score": 0.9, "label": "known_friendly_fpv"})
    r = fuse_signals("FEED-A", signals)
    assert r.state is FusionState.FRIENDLY_VERIFIED
    assert r.confidence >= 0.85
    assert "visual_classifier" in r.signals_used  # uses TS stateMeta vocabulary
    assert "firmware_marker" in r.signals_used
    assert "hmac_verify" in r.signals_used


def test_state_likely_friendly_when_no_supporting():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    signals = _signals_from_marker(ev, fresh=True, mission_ok=True)
    r = fuse_signals("FEED-B", signals)
    assert r.state is FusionState.LIKELY_FRIENDLY
    assert 0.55 <= r.confidence < 0.85


def test_state_unknown_needs_review_when_no_marker():
    signals = [
        FusionSignal(name="time_window", score=0.0, fresh=False),
        FusionSignal(name="mission_match", score=0.0),
    ]
    r = fuse_signals("FEED-C", signals)
    assert r.state is FusionState.UNKNOWN_NEEDS_REVIEW
    assert r.confidence < 0.4
    assert "foe" not in r.reason.lower() or "not foe" in r.reason.lower()


def test_state_signature_corrupted():
    ev = {"extracted": True, "decoded": False, "hmac_valid": False, "fresh": False}
    signals = _signals_from_marker(ev, fresh=False, mission_ok=False)
    r = fuse_signals("FEED-D", signals)
    assert r.state is FusionState.SIGNATURE_CORRUPTED


def test_state_possible_spoof_bad_hmac():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    ev["hmac_valid"] = False  # simulate spoof
    ev["fail_reason"] = "hmac"
    signals = _signals_from_marker(ev, fresh=True, mission_ok=True)
    r = fuse_signals("FEED-E", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF


def test_state_possible_spoof_stale_marker():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now - 60), now=now, window_s=10)
    signals = _signals_from_marker(ev, fresh=False, mission_ok=True)
    r = fuse_signals("FEED-F", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF


def test_state_possible_spoof_mission_mismatch():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, "WRONG-MISSION", ts=now), now=now)
    signals = _signals_from_marker(ev, fresh=True, mission_ok=False)
    r = fuse_signals("FEED-G", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF


def test_safety_no_foe_label_in_reasons():
    """Smoke check: no fusion result reason ever uses 'foe' as a positive label."""
    now = int(time.time())
    cases = [
        _signals_from_marker(verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now),
                             fresh=True, mission_ok=True, visual={"score": 0.9, "label": "known_friendly_fpv"}),
        _signals_from_marker({"extracted": True, "decoded": False}, fresh=False, mission_ok=False),
        [],
    ]
    for sigs in cases:
        r = fuse_signals("FEED-X", sigs)
        # 'foe' may appear only in the explicit "not foe" disclaimer wording.
        assert "foe" not in r.reason.lower() or "not foe" in r.reason.lower()
