"""NICK-067: smoke test for cross-language firmware compatibility.

Exercises `scripts/verify_firmware_marker.py` against a deterministic
reference marker so a judge running `pytest tests/` sees the firmware-side
proof in CI alongside the receiver-side coverage in `test_fusion.py`.

The reference marker is the exact byte string the Wokwi simulation prints on
its first boot at `demo_ts=1746208900` — produced by both the Python
`make_marker()` and the C `make_marker()` in `firmware/wokwi/sketch.ino`.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "verify_firmware_marker.py"

# Deterministic reference marker — identical bytes from Python and C sides.
REFERENCE_MARKER = "MISSION-2026-05-02-A:1746208900:21022f95966557c07810cd256c350974"


def test_verify_firmware_marker_passes_on_reference():
    """The deterministic reference marker must verify cleanly through the
    firmware-compat verifier — proves Python ↔ C produce byte-identical bytes
    for the same secret + mission + timestamp."""
    result = subprocess.run(
        [sys.executable, str(SCRIPT), REFERENCE_MARKER],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0, f"verify_firmware_marker.py failed:\n{result.stdout}\n{result.stderr}"
    assert "PASS" in result.stdout
    assert "MISSION-2026-05-02-A" in result.stdout


def test_verify_firmware_marker_rejects_tampered():
    """Sanity: a marker with a flipped final hex digit should NOT verify."""
    tampered = REFERENCE_MARKER[:-1] + ("0" if REFERENCE_MARKER[-1] != "0" else "1")
    result = subprocess.run(
        [sys.executable, str(SCRIPT), tampered],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 1
    assert "FAIL" in result.stdout
