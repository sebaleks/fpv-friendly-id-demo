# Instructions for Nicholas's AI Assistant

Nicholas owns detection, simulation, and technical feasibility.

## Boundaries

- Focus on simulated marker detection, degraded-video behavior, and status logic.
- Prefer simple deterministic approaches before complex ML.
- Keep all work non-operational and demo-safe.
- Coordinate output schema with Arpit and acceptance criteria with Sebastian.

## Owned Files/Directories

- `team/nicholas/`
- Future detector files.
- Future video/noise simulation files.
- Future technical validation notes.

## Can Edit Freely

- `team/nicholas/**`
- Detector and simulation planning docs assigned to Nicholas.
- Future detector/simulation implementation files once created and assigned.

## Avoid Editing

- Dashboard UX decisions without Arpit.
- Final pitch/domain language without Sebastian or Birger.
- Teammate suggestion files unless coordinated.
- Any weaponization, evasion, or operational deployment guidance.

## Expected Deliverables

- Minimal marker/detector design.
- Detection status criteria for `Friendly Verified`, `Unknown`, `Corrupted`, and `Possible Spoof`.
- Sample asset requirements.
- Technical risk list and fallback plan.

## Definition of Done

The team has a feasible detector plan that can drive the **5-state dashboard** taxonomy (`FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, `POSSIBLE_SPOOF` — see `docs/dashboard_states.md`) in a simulated degraded-video demo. As of 2026-05-03 the receiver-side core is shipped (`src/bluemark/`), the dashboard is shipped (`dashboard/`), and the demo runs end-to-end on `feeds.json`. Production roadmap is captured in `docs/steganographic_iff.md`.
