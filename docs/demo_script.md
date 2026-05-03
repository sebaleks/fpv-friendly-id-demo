# Demo Script

## 3-Minute Live Narration (Authoritative — no pitch slides)

> *Walk the live dashboard. Every beat keeps the persistent footer "Identification aid only. Human decision required." visible. Total target: 3:00.*

### 0:00 – 0:30 — Frame the problem (no slides)
"BlueMark FPV is edge-on-edge, software-only friendly-identification for cheap analog FPV drones — the most numerous platforms in the conflict and the ones least served by traditional IFF hardware. Marker generation runs on the drone's existing STM32 flight controller. Detection runs on a backpack-portable receiver — a Pi and a fifteen-dollar capture card, or a laptop. No cloud. No central server. Zero added hardware on the drone. We embed the friendly marker in the unrendered VBI lines of the analog video, so it's invisible to the pilot and to anyone watching the picture. The system is an identification aid only — it never recommends engagement; the operator decides."

### 0:30 – 0:45 — FEED-A: `FRIENDLY_VERIFIED`
"Feed A has an HMAC-authenticated marker that's fresh, matches today's mission, and is corroborated by RC-session and visual-profile signals. Highest confidence. Still surfaced as an *aid* — never as an engagement recommendation."

### 0:45 – 1:00 — FEED-B: `LIKELY_FRIENDLY`
"Feed B's marker authenticates and is in-window, but no supporting signal corroborates it. We deliberately do not promote it to fully verified — we optimize for minimum false-friendly. A foe wearing a stolen marker stops here; it does *not* climb to FRIENDLY_VERIFIED."

### 1:00 – 1:30 — FEED-C: `UNKNOWN_NEEDS_REVIEW`
"Feed C has no decodable marker at all. The system does not guess. **Unknown is not foe** — that's the hard line. We surface it for human review with the same persistent warning. The complement of friendly-verified is *not-confirmed-friendly*, never hostile."

### 1:30 – 1:45 — FEED-D: `SIGNATURE_CORRUPTED`
"Feed D has marker-like bytes, but degradation — noise, partial loss — prevents verification. That's expected behavior on contested analog video. We flag it for the operator instead of forcing a decision."

### 1:45 – 2:15 — FEED-E: `POSSIBLE_SPOOF`
"Feed E has marker-like data that fails authentication or freshness. This is the spoof path. The system flags suspicion; it does not flag *engage*. A captured drone replaying yesterday's marker, or an adversary forging the byte pattern without the HMAC key, lands here — not on a kill list."

### 2:15 – 2:45 — Safety + scaling
"Every card carries the same persistent footer — *Identification aid only. Human decision required.* That's a hardware-event constraint, not a preference. On scaling: marker generation is a software change to firmware that's already flying; the per-drone marginal cost is zero. Receiver-side runs on hardware EW teams already carry. Edge-on-edge. No cloud, no central server, works disconnected and EW-contested."

### 2:45 – 3:00 — Close
"The novel contribution isn't VBI watermarking, isn't HMAC, isn't IFF — those are decades-proven prior art. It's the *combination*, applied to live FPV analog video on a flight controller, for real-time IFF at zero hardware cost. That's the gap we close, on equipment that's already in the field today."

## Step-by-Step Click Path (5 feeds)

1. Open the BlueMark FPV dashboard at `http://localhost:5174/`.
2. Confirm five feed cards render: FEED-A through FEED-E, each with a distinct state color.
3. Walk left-to-right: A → B → C → D → E, one beat per card per the script above.
4. On every card, point to: state badge, confidence number, signals_used list, and the persistent footer.
5. Close on the persistent footer + the prior-art-delta sentence.

## What To Say For Each State

- `FRIENDLY_VERIFIED`: "Marker authenticated, fresh, mission-matched, with at least one supporting signal. Aid only."
- `LIKELY_FRIENDLY`: "Marker valid but uncorroborated. We refuse to promote it — false-friendly is the worst error we can make."
- `UNKNOWN_NEEDS_REVIEW`: "No marker. Unknown is not foe."
- `SIGNATURE_CORRUPTED`: "Marker bytes present, too noisy to verify. Operator reviews."
- `POSSIBLE_SPOOF`: "Marker pattern present, authentication or freshness fails. Suspicious, not actionable."

## 30-Second Emergency Version

"BlueMark FPV helps a human operator classify simulated FPV feeds. Feed A has a valid signed marker and shows Friendly Verified. Feed B has no marker and shows Unknown. Feed C has degraded marker data and shows Signature Corrupted / Needs Human Review. The dashboard always says: Identification aid only. Human decision required. This is not targeting, not weaponization, and not production-grade IFF."

## Closing Sentence

"The value is clearer human deconfliction at the tactical edge — running entirely on hardware already in the field, in the austere, EW-contested, disconnected environments where IFF actually has to work."
