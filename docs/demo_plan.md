# Demo Plan

## Scenario

A friendly EW monitoring team is observing multiple FPV-style video feeds in a contested environment. Cheap FPV drones are hard to distinguish because many use similar analog video characteristics and do not carry expensive IFF hardware.

The team wants to avoid jamming friendly drones while still treating unknown feeds cautiously.

BlueMark FPV is a simulated identification aid. It helps a human operator classify incoming video feeds by checking for an OSD-like authenticated marker.

## User Story

As a friendly EW monitoring operator, I want a dashboard that highlights which simulated FPV feeds carry a valid friendly marker, which feeds are unknown, and which feeds need human review, so I can reduce accidental friendly disruption without trusting the system as an autonomous decision-maker.

## Demo Script

1. Operator opens the BlueMark FPV dashboard.
2. Dashboard shows three simulated incoming FPV feeds:
   - Feed A: friendly signed feed.
   - Feed B: unsigned unknown feed.
   - Feed C: friendly feed with degraded or corrupted marker.
3. Presenter explains: "Cheap FPV feeds often look similar. This demo asks whether a receiver can identify a friendly marker in simulated video, even when the signal is degraded."
4. Feed A shows an OSD-like authenticated marker. The system labels it `Friendly Verified`.
5. Feed B has no valid marker. The system labels it `Unknown`.
6. Feed C has partial or noisy marker data. The system labels it `Signature Corrupted / Needs Human Review`.
7. Dashboard displays:
   - Status label.
   - Confidence.
   - Signal quality.
   - Warning: `Identification aid only. Human decision required.`
8. Presenter closes with: "This prototype uses simulated video and OSD-like overlays. Production deployment would require integration, testing, secure key management, and validation under real-world analog-video degradation."

## Success Criteria

- Dashboard loads without setup friction.
- Three feeds are visible at the same time.
- Feed A is labeled `Friendly Verified`.
- Feed B is labeled `Unknown`.
- Feed C is labeled `Signature Corrupted / Needs Human Review`.
- Each feed shows confidence and signal quality.
- The human decision warning is always visible.
- Presenter can explain the full scenario in under three minutes.
- Demo never implies autonomous engagement, targeting, or jamming decisions.

## MVP Feature List

- Static or looping simulated FPV-style video panels.
- Three named feeds: A, B, and C.
- OSD-like marker overlay for friendly feeds.
- Simple detector or simulated detector result for each feed.
- Dashboard status cards for:
  - `Friendly Verified`
  - `Unknown`
  - `Signature Corrupted / Needs Human Review`
- Confidence and signal quality values.
- Persistent warning: `Identification aid only. Human decision required.`
- Short pitch notes explaining simulated scope and production requirements.

## Stretch Feature List

- Live toggle to add or remove video degradation.
- Visual marker bounding box or detection region.
- Timeline showing status changes over time.
- Side-by-side clean versus degraded view for Feed C.
- Exportable demo log showing feed status decisions.
- Mock key rotation or key ID display for explaining secure marker management.
- Operator notes field for human review.

## Non-Goals

- No autonomous targeting or engagement.
- No jamming recommendations.
- No weaponization or payload integration.
- No evasion guidance.
- No operational deployment instructions.
- No real drone control.
- No claim that this solves real-world IFF without further validation.

## Safety Constraints

- Keep all media simulated or clearly benign.
- Keep the system framed as an identification aid only.
- Always show the human decision warning.
- Avoid tactical instructions about how to evade detection or defeat EW systems.
- Avoid real key material, secrets, or deployment procedures.
- Present production requirements as unresolved engineering work, not as instructions.

## Fallback Demo If Detection Fails Live

If live detection breaks, switch to a scripted detector-result mode:

1. Keep the same three feed panels visible.
2. Use precomputed or hardcoded demo statuses:
   - Feed A: `Friendly Verified`
   - Feed B: `Unknown`
   - Feed C: `Signature Corrupted / Needs Human Review`
3. Clearly state: "The live detector is replaced here with recorded detector output so we can show the operator workflow."
4. Show confidence and signal quality as fixed demo values.
5. Continue the pitch around the real user problem, dashboard workflow, safety boundary, and production validation needs.

Fallback success is showing the human workflow clearly, even if the live detector is not running.
