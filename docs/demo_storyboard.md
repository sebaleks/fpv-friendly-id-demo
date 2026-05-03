# Demo Storyboard

## 1. Setup

Show a simulated FPV video feed and a receiver-side dashboard (React + Vite). Presenter explains: production drones embed a per-frame HMAC marker in the VBI lines of analog video — invisible to pilot, screen, and enemy capture. Demo simulates the receiver-side read via pre-computed detector output.

## 2. Friendly Verified

Feed A authenticates: valid HMAC + fresh timestamp + mission manifest match + supporting visual / RC signal. Dashboard shows `FRIENDLY_VERIFIED`, high confidence (~0.95), full signals breakdown. *"Don't jam — this is ours."*

## 3. Likely Friendly (optional 4th-feed stretch)

Feed B authenticates marker + freshness + mission, but no supporting corroboration. Dashboard shows `LIKELY_FRIENDLY`, mid-high confidence. *"Probably ours; operator may want a quick second look before treating as friendly."*

## 4. Unknown — Needs Review

Feed C has no valid marker at all. Dashboard shows `UNKNOWN_NEEDS_REVIEW`, low confidence in the *friendly* call. **Unknown is not foe.** The system surfaces it for human review without claiming hostility.

## 5. Signature Corrupted

Feed D has marker-like data but it's too noisy / incomplete to verify. Dashboard shows `SIGNATURE_CORRUPTED`. Operator decides — could be a friendly with a degraded link or could be something else.

## 6. Possible Spoof

Feed E has marker-like data that decodes but fails HMAC, freshness, or mission match. Dashboard shows `POSSIBLE_SPOOF` with caution styling. Operator decides; system never recommends action.

## 7. Closing Message

BlueMark FPV is a steganographic IFF identification aid for cheap analog FPV drones. It surfaces five operator-facing states; it never recommends engagement; human-in-loop is required. Production deployment requires the Betaflight firmware fork (VBI write routine) + a commodity receiver (Pi + capture card, ~$50). Not autonomous targeting; not a production-grade IFF claim; not an operational deployment guide.
