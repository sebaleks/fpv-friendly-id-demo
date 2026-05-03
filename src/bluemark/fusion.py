"""Rule-based multi-signal fusion → 5-state dashboard. See docs/fusion_architecture.md.

Signal naming (must match `dashboard/src/components/stateMeta.ts::ALL_SIGNALS`):
  firmware_marker, steg_iff_token, hmac_verify, time_window, manifest_match,
  visual_classifier, rc_session.

Failure variants (consumed by `classifySignal` in stateMeta.ts):
  firmware_marker_mismatch  — marker bytes existed but verification failed
  steg_iff_token_partial    — token bytes were extracted but couldn't be decoded
  manifest_miss             — drone ID is not in the active mission manifest

Internal lookups still take FusionSignal `name=marker` etc. as INPUT for back-compat
with `generate_feeds.py` and tests; the OUTPUT `signals_used` strings use the TS
vocabulary so the dashboard signal trace lights up correctly.
"""
from .schemas import FusionResult, FusionSignal, FusionState


def _by_name(signals: list[FusionSignal]) -> dict[str, FusionSignal]:
    return {s.name: s for s in signals}


def fuse_signals(feed_id: str, signals: list[FusionSignal]) -> FusionResult:
    s = _by_name(signals)
    marker = s.get("marker")
    time_window = s.get("time_window")
    mission_match = s.get("mission_match")
    visual_profile = s.get("visual_profile")
    rc_session = s.get("rc_session")

    marker_extracted = bool(marker and marker.evidence.get("extracted"))
    marker_decoded = bool(marker and marker.evidence.get("decoded"))
    hmac_valid = bool(marker and marker.evidence.get("hmac_valid"))
    # NICK-024: freshness can come from either an explicit `time_window` signal
    # OR the marker's own `evidence["fresh"]` (set by verify_marker). A
    # fully-valid HMAC marker without a separate time_window signal still
    # carries a freshness verdict; ignoring it would silently downgrade.
    fresh = bool(
        (time_window and time_window.fresh)
        or (marker and marker.evidence.get("fresh"))
    )
    mission_ok = bool(mission_match and mission_match.score >= 0.5)

    used: list[str] = []

    # 1. POSSIBLE_SPOOF: marker decoded, but at least one verification check failed.
    # NICK-025: missing time_window/mission_match signals previously fell through
    # to UNKNOWN; a marker decoded with HMAC valid but failing freshness (regardless
    # of which fresh source — explicit signal or marker evidence) is a replay
    # attempt and should be flagged as SPOOF, not silently dropped.
    if marker_decoded and (
        not hmac_valid
        or not fresh
        or (mission_match is not None and not mission_ok)
    ):
        # Marker bytes existed but verification failed → emit the *_mismatch variant
        # so the dashboard signal trace shows it as PRESENT-BUT-BAD.
        used.append("firmware_marker_mismatch")
        used.append("steg_iff_token")  # token bytes were extractable
        if time_window is not None and fresh:
            used.append("time_window")
        if mission_match is not None:
            used.append("manifest_match" if mission_ok else "manifest_miss")
        return FusionResult(
            feed_id=feed_id,
            state=FusionState.POSSIBLE_SPOOF,
            confidence=0.10,
            signals_used=used,
            reason="Marker-like data decoded but failed HMAC, freshness, or mission-match.",
        )

    # 2. SIGNATURE_CORRUPTED: marker bytes present but did not decode.
    if marker_extracted and not marker_decoded:
        used.append("firmware_marker")
        used.append("steg_iff_token_partial")  # bytes extracted, couldn't decode
        return FusionResult(
            feed_id=feed_id,
            state=FusionState.SIGNATURE_CORRUPTED,
            confidence=0.40,
            signals_used=used,
            reason="Marker-like data present but too noisy or incomplete to verify.",
        )

    # 3 + 4. Marker fully verified — distinguish FRIENDLY_VERIFIED vs LIKELY_FRIENDLY by supporting signals.
    if hmac_valid and fresh and mission_ok:
        # All three sub-signals of the marker layer fired cleanly.
        used.extend(["firmware_marker", "steg_iff_token", "hmac_verify",
                     "time_window", "manifest_match"])
        supporting = 0
        if visual_profile is not None and visual_profile.score >= 0.6 and "known_friendly" in str(
            visual_profile.evidence.get("label", "")
        ):
            supporting += 1
            used.append("visual_classifier")
        if rc_session is not None and rc_session.score >= 0.5:
            supporting += 1
            used.append("rc_session")
        if supporting >= 1:
            return FusionResult(
                feed_id=feed_id,
                state=FusionState.FRIENDLY_VERIFIED,
                confidence=min(0.85 + 0.05 * supporting, 0.97),
                signals_used=used,
                reason=f"Marker authenticated and fresh, mission match, {supporting} supporting signal(s).",
            )
        return FusionResult(
            feed_id=feed_id,
            state=FusionState.LIKELY_FRIENDLY,
            confidence=0.65,
            signals_used=used,
            reason="Marker authenticated and fresh with mission match, but no corroborating supporting signal.",
        )

    # 5. UNKNOWN_NEEDS_REVIEW: no marker at all (or extraction never happened).
    return FusionResult(
        feed_id=feed_id,
        state=FusionState.UNKNOWN_NEEDS_REVIEW,
        confidence=0.20,
        signals_used=[],
        reason="No valid friendly marker identified. Unknown is not foe — human review required.",
    )
