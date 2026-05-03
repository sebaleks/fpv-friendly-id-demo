# Demo Plan

## Demo Goal

Show that BlueMark FPV can help a human operator distinguish simulated friendly FPV feeds across the full five-state taxonomy — verified, likely, unknown, corrupted, and possibly spoofed — using an HMAC-authenticated marker steganographically embedded in the analog video VBI lines.

## User Story

As a friendly EW monitoring operator, I need a quick visual aid that tells me whether an incoming simulated FPV feed is `FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, or `POSSIBLE_SPOOF`, so I can avoid accidental friendly disruption while still treating unverified feeds cautiously and never auto-engaging.

## Demo Scenario

A friendly EW monitoring team sees multiple FPV-style video feeds in a contested environment. Cheap FPV drones often share similar analog video characteristics and usually lack expensive IFF hardware. BlueMark FPV adds an HMAC-authenticated marker (production: VBI-embedded) to friendly simulated feeds and shows receiver-side classification in a human-in-the-loop dashboard.

## Five Demo Feeds (one per state)

1. **FEED-A** — Valid HMAC marker, fresh timestamp, mission match, supporting signals corroborate → `FRIENDLY_VERIFIED`.
2. **FEED-B** — Marker valid + fresh + mission match, but no corroborating supporting signal → `LIKELY_FRIENDLY` (load-bearing for minimum-false-friendly per Birger Q7).
3. **FEED-C** — No marker observed → `UNKNOWN_NEEDS_REVIEW`. **Unknown is not foe.**
4. **FEED-D** — Marker bytes present but undecodable (degraded analog) → `SIGNATURE_CORRUPTED`.
5. **FEED-E** — Marker decoded but fails HMAC authentication → `POSSIBLE_SPOOF`.

Dashboard is a React + Vite SPA reading a static `feeds.json` (written by `scripts/generate_feeds.py`). No live backend in the demo path.

## What the Audience Should See

- Five FPV-style feed panels visible at once (sidebar list + detail view).
- FEED-A labeled `Friendly Verified`.
- FEED-B labeled `Likely Friendly` (deliberately *not* the same color as verified).
- FEED-C labeled `Unknown — Needs Review`.
- FEED-D labeled `Signature Corrupted / Needs Human Review`.
- FEED-E labeled `Possible Spoof`.
- Confidence percentage and `signals_used` breakdown shown for each feed.
- Persistent warning on every state and on the global footer: `Identification aid only. Human decision required.`
- Presenter states this is simulated, non-lethal, runs receiver-side on a laptop, requires no drone-side AI hardware, and is not production-grade IFF.

## MVP Success Criteria

- Dashboard opens reliably.
- All three feeds display with stable labels.
- Detector or scripted detector output drives the five dashboard states (`docs/dashboard_states.md`).
- Feed status, confidence, signal quality, and warning are visible.
- Presenter can complete the demo in two minutes.
- No part of the demo implies autonomous targeting, engagement, or jamming recommendations.

## Stretch Goals

- Show `Possible Spoof` with malformed marker timing or failed authentication.
- Add visual marker region or bounding box.
- Add degradation toggle for Feed C.
- Add short event log of status changes.
- Add mock key ID display for explaining future secure key management.

## Non-Goals

- No autonomous targeting.
- No engagement recommendation.
- No weaponization.
- No operational deployment instructions.
- No real drone control.
- No production-grade IFF claim.

## Risks

- Live detector may be unreliable under demo timing.
- Video assets may not look FPV-like enough.
- Dashboard may become too complex for a short pitch.
- Authentication language may sound production-ready if not framed carefully.
- Teammates may edit shared docs or implementation areas without coordination.

## Fallback Plan If Live Detection Fails

In this MVP, **the scripted detector path *is* the demo path** — `scripts/generate_feeds.py` produces `dashboard/public/feeds.json`, and the React dashboard reads it. There is no live detector to lose. Per `team/nicholas/risk_register.md` §C, if `feeds.json` is missing or corrupted at demo time, recovery is one command:

```
python scripts/generate_feeds.py
```

If even that fails, restore from the last known-good commit: `git checkout HEAD -- dashboard/public/feeds.json`. The five expected outputs:

- FEED-A: `Friendly Verified`, ~0.95 confidence.
- FEED-B: `Likely Friendly`, ~0.65 confidence.
- FEED-C: `Unknown — Needs Review`, ~0.20 confidence.
- FEED-D: `Signature Corrupted`, ~0.40 confidence.
- FEED-E: `Possible Spoof`, ~0.10 friendly confidence.

Presenter line: "Every demo run is identical and deterministic — that's the design." Fallback still succeeds if the audience understands the problem, the human review workflow, the safety boundary, and what production validation would require.
