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


def test_verify_marker_empty_string():
    """NICK-051: empty marker should not be classified as SIGNATURE_CORRUPTED."""
    ev = verify_marker(SECRET, "", now=int(time.time()))
    assert ev["extracted"] is False
    assert ev["decoded"] is False
    assert ev["fail_reason"] == "empty"
    # And it should drop the feed to UNKNOWN, not corrupted.
    signals = [FusionSignal(name="marker", score=0.0, evidence=ev)]
    r = fuse_signals("FEED-EMPTY", signals)
    assert r.state is FusionState.UNKNOWN_NEEDS_REVIEW


# Fusion tests — one per state. NICK-026: assert signals_used contents,
# not just state, to prevent silent attribution regressions.

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
    assert "manifest_match" in r.signals_used
    assert "time_window" in r.signals_used


def test_state_likely_friendly_when_no_supporting():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    signals = _signals_from_marker(ev, fresh=True, mission_ok=True)
    r = fuse_signals("FEED-B", signals)
    assert r.state is FusionState.LIKELY_FRIENDLY
    assert 0.55 <= r.confidence < 0.85
    # Marker layer fully fired but no supporting signals.
    assert set(r.signals_used) == {
        "firmware_marker", "steg_iff_token", "hmac_verify",
        "time_window", "manifest_match",
    }


def test_state_likely_friendly_via_marker_evidence_fresh():
    """NICK-024 regression test: marker carries evidence['fresh']=True and
    time_window signal is omitted; should still reach LIKELY_FRIENDLY (or
    FRIENDLY_VERIFIED with supporting), not silently fall to UNKNOWN."""
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    # Construct signals without an explicit `time_window` entry — only marker
    # + mission_match. fresh-ness must come from marker.evidence.
    signals = [
        FusionSignal(name="marker", score=1.0, evidence=ev),
        FusionSignal(name="mission_match", score=1.0),
    ]
    r = fuse_signals("FEED-X", signals)
    assert r.state is FusionState.LIKELY_FRIENDLY
    assert "firmware_marker" in r.signals_used


def test_state_unknown_needs_review_when_no_marker():
    signals = [
        FusionSignal(name="time_window", score=0.0, fresh=False),
        FusionSignal(name="mission_match", score=0.0),
    ]
    r = fuse_signals("FEED-C", signals)
    assert r.state is FusionState.UNKNOWN_NEEDS_REVIEW
    assert r.confidence < 0.4
    assert "foe" not in r.reason.lower() or "not foe" in r.reason.lower()
    assert r.signals_used == []


def test_state_signature_corrupted():
    ev = {"extracted": True, "decoded": False, "hmac_valid": False, "fresh": False}
    signals = _signals_from_marker(ev, fresh=False, mission_ok=False)
    r = fuse_signals("FEED-D", signals)
    assert r.state is FusionState.SIGNATURE_CORRUPTED
    # NICK-026: bytes were extractable but couldn't be decoded — emit the
    # *_partial failure variant so the dashboard signal trace shows
    # PRESENT-BUT-BAD rather than MISSING.
    assert "firmware_marker" in r.signals_used
    assert "steg_iff_token_partial" in r.signals_used


def test_state_possible_spoof_bad_hmac():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now), now=now)
    ev["hmac_valid"] = False  # simulate spoof
    ev["fail_reason"] = "hmac"
    signals = _signals_from_marker(ev, fresh=True, mission_ok=True)
    r = fuse_signals("FEED-E", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF
    # NICK-026: marker bytes existed but verification failed → emit *_mismatch.
    assert "firmware_marker_mismatch" in r.signals_used
    assert "steg_iff_token" in r.signals_used


def test_state_possible_spoof_stale_marker():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now - 60), now=now, window_s=10)
    signals = _signals_from_marker(ev, fresh=False, mission_ok=True)
    r = fuse_signals("FEED-F", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF


def test_state_possible_spoof_when_freshness_signal_absent_and_marker_stale():
    """NICK-025 regression: marker decoded with HMAC valid but stale (per
    marker evidence), and no explicit time_window signal supplied. Previously
    this fell through to UNKNOWN; should now flag as POSSIBLE_SPOOF (replay)."""
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, MISSION, ts=now - 60), now=now, window_s=10)
    # Construct signals WITHOUT a time_window entry — only marker + mission_match.
    signals = [
        FusionSignal(name="marker", score=1.0, evidence=ev),
        FusionSignal(name="mission_match", score=1.0),
    ]
    r = fuse_signals("FEED-Y", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF


def test_state_possible_spoof_mission_mismatch():
    now = int(time.time())
    ev = verify_marker(SECRET, make_marker(SECRET, "WRONG-MISSION", ts=now), now=now)
    signals = _signals_from_marker(ev, fresh=True, mission_ok=False)
    r = fuse_signals("FEED-G", signals)
    assert r.state is FusionState.POSSIBLE_SPOOF
    # NICK-026: mission failure variant must surface in signals_used.
    assert "manifest_miss" in r.signals_used


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
