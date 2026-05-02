# Dashboard States

Every dashboard state must show:

`Identification aid only. Human decision required.`

## FRIENDLY_VERIFIED

- Plain-English meaning: The feed appears to carry a valid friendly marker.
- Required detector conditions: Valid marker sequence detected across enough windows with acceptable confidence and timing.
- Dashboard display text: `Friendly Verified`
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed A has a readable OSD-like marker, good signal quality, and high confidence.
- Do not imply: Do not imply guaranteed identity, permission to ignore the feed, or any engagement decision.

## UNKNOWN

- Plain-English meaning: The system did not find a valid friendly marker.
- Required detector conditions: No marker sequence passes basic detection or authentication checks.
- Dashboard display text: `Unknown`
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed B has normal-looking FPV video but no valid marker.
- Do not imply: Do not imply hostile intent, targeting, or a recommendation to jam.

## SIGNATURE_CORRUPTED

- Plain-English meaning: Marker-like data appears to exist, but it is too noisy or incomplete to verify.
- Required detector conditions: Partial marker candidate detected, but confidence, completeness, or checksum/authentication evidence is insufficient.
- Dashboard display text: `Signature Corrupted / Needs Human Review`
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Feed C has visible degradation and an uncertain marker result.
- Do not imply: Do not imply the feed is hostile or safe; it requires human review.

## POSSIBLE_SPOOF

- Plain-English meaning: The feed contains marker-like data that fails expected timing or authentication checks.
- Required detector conditions: Marker candidate exists, but expected timing, sequence, or authentication validation fails.
- Dashboard display text: `Possible Spoof`
- Operator-facing warning: `Identification aid only. Human decision required.`
- Demo should show: Optional stretch feed or mode with suspicious marker-like overlay and clear caution styling.
- Do not imply: Do not provide spoofing methods, evasion advice, or automatic response recommendations.
