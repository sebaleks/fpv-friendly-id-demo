"""Verify a firmware-generated marker against the receiver-side HMAC primitive.

Cross-language compatibility test: a marker produced by the Wokwi-simulated
firmware (firmware/wokwi/sketch.ino) decodes and verifies cleanly with the
receiver-side code in src/bluemark/marker.py — the integration claim that
underpins the pitch's "same crypto on both ends" story.

Usage:
    python scripts/verify_firmware_marker.py 'MISSION-2026-05-02-A:1746208900:<hex32>'

Or piped:
    echo 'MISSION-2026-05-02-A:1746208900:<hex32>' | python scripts/verify_firmware_marker.py

Exit code 0 on PASS, 1 on FAIL.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from bluemark.marker import verify_marker  # noqa: E402

# Must match firmware/wokwi/sketch.ino SECRET[].
SECRET = b"hackathon-demo-secret-not-real"


def main() -> int:
    if len(sys.argv) > 1:
        marker = sys.argv[1].strip()
    else:
        marker = sys.stdin.readline().strip()

    if not marker:
        print(
            "ERROR: no marker provided.\n"
            "Usage: python scripts/verify_firmware_marker.py '<mission_id>:<ts>:<hex_hmac32>'",
            file=sys.stderr,
        )
        return 2

    # Use the marker's own timestamp as `now` so freshness passes; we're
    # isolating this test to the cryptographic primitive, not to clock skew.
    parts = marker.split(":")
    own_ts = None
    if len(parts) == 3:
        try:
            own_ts = int(parts[1])
        except ValueError:
            own_ts = None

    result = verify_marker(SECRET, marker, now=own_ts, window_s=10**9)

    print(f"marker:      {marker}")
    print(f"decoded:     {result['decoded']}")
    print(f"hmac_valid:  {result['hmac_valid']}")
    print(f"mission_id:  {result['mission_id']}")
    print(f"ts:          {result['ts']}")
    print()

    if result["hmac_valid"]:
        print("PASS — firmware-side and receiver-side are cross-language compatible.")
        return 0
    print(f"FAIL — fail_reason: {result['fail_reason']}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
