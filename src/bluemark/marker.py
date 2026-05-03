"""HMAC-authenticated OSD marker. Hackathon-grade — not production crypto.

Marker format: ``<mission_id>:<unix_timestamp>:<hex_hmac32>``.
HMAC = first 32 hex chars of HMAC-SHA256(secret, "<mission_id>:<ts>").
"""
import hmac
import hashlib
import time


def make_marker(secret: bytes, mission_id: str, ts: int | None = None) -> str:
    if ts is None:
        ts = int(time.time())
    payload = f"{mission_id}:{ts}".encode()
    mac = hmac.new(secret, payload, hashlib.sha256).hexdigest()[:32]
    return f"{mission_id}:{ts}:{mac}"


def verify_marker(
    secret: bytes,
    marker: str,
    now: int | None = None,
    window_s: int = 10,
) -> dict:
    """Returns evidence dict consumed by fusion. Never raises on bad input."""
    if now is None:
        now = int(time.time())
    # NICK-051: an empty / whitespace-only marker means "no marker observed,"
    # which should drop the feed to UNKNOWN_NEEDS_REVIEW (not SIGNATURE_CORRUPTED).
    # Set extracted=False so fusion's marker_extracted check fires correctly.
    if not marker or not marker.strip():
        return {
            "extracted": False,
            "decoded": False,
            "hmac_valid": False,
            "fresh": False,
            "mission_id": None,
            "ts": None,
            "fail_reason": "empty",
        }
    result = {
        "extracted": True,
        "decoded": False,
        "hmac_valid": False,
        "fresh": False,
        "mission_id": None,
        "ts": None,
        "fail_reason": None,
    }
    parts = marker.split(":")
    if len(parts) != 3:
        result["fail_reason"] = "format"
        return result
    mission_id, ts_str, mac_provided = parts
    try:
        ts = int(ts_str)
    except ValueError:
        result["fail_reason"] = "timestamp_decode"
        return result
    result["decoded"] = True
    result["mission_id"] = mission_id
    result["ts"] = ts
    expected = hmac.new(secret, f"{mission_id}:{ts}".encode(), hashlib.sha256).hexdigest()[:32]
    if not hmac.compare_digest(expected, mac_provided):
        result["fail_reason"] = "hmac"
        return result
    result["hmac_valid"] = True
    if abs(now - ts) > window_s:
        result["fail_reason"] = "stale"
        return result
    result["fresh"] = True
    return result


def corrupt_marker(marker: str) -> str:
    """Demo helper: produce marker bytes that fail to parse cleanly.

    Truncates and replaces colons with ``?`` so the parser cannot recover the
    ``mission:ts:hmac`` structure — drives the SIGNATURE_CORRUPTED state.
    """
    truncated = marker[: len(marker) // 2]
    return truncated.replace(":", "?")
