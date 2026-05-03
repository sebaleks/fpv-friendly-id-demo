# Demo Plan

## Demo Goal

Show that BlueMark FPV can help a human operator distinguish simulated friendly FPV feeds from unknown or corrupted feeds using an OSD-like authenticated marker.

## User Story

As a friendly EW monitoring operator, I need a quick visual aid that tells me whether an incoming simulated FPV feed appears friendly, unknown, corrupted, or suspicious, so I can avoid accidental friendly disruption while still treating unknown feeds cautiously.

## Demo Scenario

A friendly EW monitoring team sees multiple FPV-style video feeds in a contested environment. Cheap FPV drones often share similar analog video characteristics and usually lack expensive IFF hardware. BlueMark FPV adds a small authenticated marker to friendly simulated feeds and shows receiver-side classification in a human-in-the-loop dashboard.

## Three Demo Feeds (MVP — optional 4th for stretch)

1. Friendly signed feed: Valid HMAC marker, fresh timestamp, mission match → `FRIENDLY_VERIFIED`.
2. Unsigned unknown feed: No valid marker → `UNKNOWN_NEEDS_REVIEW`. Note: unknown is *not* foe.
3. Degraded/corrupted signed feed: Marker-like data present but too noisy to verify → `SIGNATURE_CORRUPTED`.
4. **Stretch (optional 4th):** Marker-like overlay failing HMAC authentication → `POSSIBLE_SPOOF`. Or `LIKELY_FRIENDLY` (valid marker, missing mission match) if spoof feels too edgy for the demo.

Dashboard is a React + Vite SPA reading a static `feeds.json` (written by `scripts/generate_feeds.py`). No live backend in the demo path.

## What the Audience Should See

- Three (or four) FPV-style feed panels visible at once.
- Feed A labeled `Friendly Verified`.
- Feed B labeled `Unknown — Needs Review`.
- Feed C labeled `Signature Corrupted / Needs Human Review`.
- (Optional) Feed D labeled `Possible Spoof` or `Likely Friendly`.
- Confidence percentage and `signals_used` breakdown shown for each feed.
- Persistent warning: `Identification aid only. Human decision required.`
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

Use scripted detector results while keeping the same dashboard workflow:

- Feed A: `Friendly Verified`, high confidence, good signal quality.
- Feed B: `Unknown`, low marker confidence, moderate signal quality.
- Feed C: `Signature Corrupted / Needs Human Review`, medium marker confidence, poor signal quality.

Presenter line: "The live detector is replaced here with recorded detector output so we can show the operator workflow."

Fallback still succeeds if the audience understands the problem, the human review workflow, the safety boundary, and what production validation would require.
