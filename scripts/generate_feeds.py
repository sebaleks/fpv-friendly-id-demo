"""Generate dashboard/public/feeds.json from simulated detector outputs.

Idempotent — re-run between demo takes. Writes one FeedsBundle covering all 5
dashboard states so the operator-facing UI shows the full taxonomy.
"""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from bluemark.fusion import fuse_signals  # noqa: E402
from bluemark.marker import make_marker, verify_marker, corrupt_marker  # noqa: E402
from bluemark.schemas import FeedsBundle, FusionSignal  # noqa: E402

SECRET = b"hackathon-demo-secret-not-real"


def _signals(marker_ev: dict, *, fresh: bool, mission_ok: bool, visual=None, rc=None) -> list[FusionSignal]:
    signals = [
        FusionSignal(name="marker", score=1.0 if marker_ev.get("hmac_valid") else 0.0, evidence=marker_ev),
        FusionSignal(name="time_window", score=1.0 if fresh else 0.0, fresh=fresh),
        FusionSignal(name="mission_match", score=1.0 if mission_ok else 0.0),
    ]
    if visual:
        signals.append(FusionSignal(name="visual_profile", score=visual["score"], evidence={"label": visual["label"]}))
    if rc is not None:
        signals.append(FusionSignal(name="rc_session", score=rc))
    return signals


def _load_visual_overrides() -> dict[str, dict]:
    """Read demo_assets/visual_profile_overrides.json if scripts/run_visual_classifier.py
    has produced it. Empty dict means use simulated defaults inline below."""
    path = ROOT / "demo_assets" / "visual_profile_overrides.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return {}


def main() -> None:
    manifest = json.loads((ROOT / "demo_assets" / "mission_manifest.json").read_text())
    mission_id = manifest["mission_id"]
    now = int(time.time())
    visual_overrides = _load_visual_overrides()

    def visual_for(feed_id: str, default: dict | None) -> dict | None:
        return visual_overrides.get(feed_id, default)

    feeds = []

    # FEED-A: FRIENDLY_VERIFIED — full corroboration.
    ev_a = verify_marker(SECRET, make_marker(SECRET, mission_id, ts=now), now=now)
    feeds.append(fuse_signals("FEED-A", _signals(
        ev_a, fresh=True, mission_ok=True,
        visual=visual_for("FEED-A", {"score": 0.92, "label": "known_friendly_fpv"}),
        rc=0.95,
    )))

    # FEED-B: LIKELY_FRIENDLY — marker valid + mission match, no supporting signal.
    ev_b = verify_marker(SECRET, make_marker(SECRET, mission_id, ts=now), now=now)
    feeds.append(fuse_signals("FEED-B", _signals(ev_b, fresh=True, mission_ok=True)))

    # FEED-C: UNKNOWN_NEEDS_REVIEW — no marker.
    feeds.append(fuse_signals("FEED-C", [
        FusionSignal(name="time_window", score=0.0, fresh=False),
        FusionSignal(name="mission_match", score=0.0),
    ]))

    # FEED-D: SIGNATURE_CORRUPTED — marker bytes present, undecodable.
    ev_d = verify_marker(SECRET, corrupt_marker(make_marker(SECRET, mission_id, ts=now)), now=now)
    feeds.append(fuse_signals("FEED-D", _signals(ev_d, fresh=False, mission_ok=False)))

    # FEED-E: POSSIBLE_SPOOF — marker decoded, HMAC fails (different secret).
    fake = make_marker(b"WRONG-SECRET", mission_id, ts=now)
    ev_e = verify_marker(SECRET, fake, now=now)
    feeds.append(fuse_signals("FEED-E", _signals(ev_e, fresh=True, mission_ok=True)))

    bundle = FeedsBundle(generated_at=now, mission_id=mission_id, feeds=feeds)

    out = ROOT / "dashboard" / "public" / "feeds.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(bundle.model_dump_json(indent=2))
    print(f"Wrote {out} — {len(feeds)} feeds, states: {[f.state.value for f in feeds]}")


if __name__ == "__main__":
    main()
