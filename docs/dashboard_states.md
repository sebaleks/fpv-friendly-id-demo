# Dashboard States

Every dashboard state must show:

`Identification aid only. Human decision required.`

The dashboard never recommends engagement. It surfaces objective state plus a confidence value plus the list of signals that contributed; the human operator decides what to do.

## FRIENDLY_VERIFIED

- Plain-English meaning: Strong agreement across authenticated marker, mission/time window, and supporting signals.
- Required detector conditions: Valid HMAC marker + within mission time window + drone ID matches mission manifest + at least one supporting signal (visual / RC-session / RF) consistent.
- Dashboard display text: `Friendly Verified`
- Confidence: typically ≥ 0.85
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed A has a readable marker, fresh timestamp, mission match, good signal quality.
- Do not imply: Guaranteed identity, permission to ignore the feed, any engagement decision.

## LIKELY_FRIENDLY

- Plain-English meaning: Marker and time window are valid, but one or more supporting signals are missing or weak.
- Required detector conditions: Valid HMAC marker + fresh time window, **but** mission manifest match missing, or no supporting visual / RC-session corroboration.
- Dashboard display text: `Likely Friendly`
- Confidence: typically 0.55 – 0.85
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show (optional 4-feed stretch): A feed where the marker reads cleanly but the mission manifest can't confirm the drone ID.
- Do not imply: Permission to skip review; missing corroboration is not the same as confirmation.

## UNKNOWN_NEEDS_REVIEW

- Plain-English meaning: No valid friendly identification was found. **Unknown is not foe.** Escalate for human review.
- Required detector conditions: No marker sequence passes basic detection or authentication, and no mission/session match.
- Dashboard display text: `Unknown — Needs Review`
- Confidence: low (typically ≤ 0.4) — but confidence here means *confidence in the friendly call*, not confidence that the feed is hostile.
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed B has normal-looking FPV video but no valid marker.
- Do not imply: Hostile intent, targeting, or a recommendation to jam. Unknown means "we cannot confirm friendly," nothing more.

## SIGNATURE_CORRUPTED

- Plain-English meaning: Marker-like data appears to exist, but it is too noisy or incomplete to verify.
- Required detector conditions: Partial marker candidate detected, but confidence, completeness, or HMAC verification is insufficient.
- Dashboard display text: `Signature Corrupted / Needs Human Review`
- Confidence: typically 0.3 – 0.6 (uncertain)
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed C has visible degradation and an uncertain marker result.
- Do not imply: Hostile or safe; it requires human review.

## POSSIBLE_SPOOF

- Plain-English meaning: The feed contains marker-like data that fails expected timing, mission, or HMAC authentication checks.
- Required detector conditions: Marker candidate exists, but HMAC fails, timestamp is outside the freshness window, or mission/session metadata is inconsistent.
- Dashboard display text: `Possible Spoof`
- Confidence: low for friendly; flagged with caution styling.
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show (optional 4-feed stretch): A feed with marker-like overlay that fails authentication.
- Do not imply: A spoofing methodology, evasion advice, or any automatic response recommendation.

## Required output fields per state

The fusion engine emits, for each feed:

- `state` — one of the 5 above
- `confidence` — float in [0, 1]
- `signals_used` — list of signal names that contributed (e.g. `["marker", "time_window", "mission_match"]`)
- `reason` — short human-readable string for the operator
