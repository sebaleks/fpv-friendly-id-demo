# System Architecture

## Goal

Build a compact hackathon demo that simulates friendly FPV identification in degraded video.

Cost framing lives in `docs/cost_tiers.md`. The preferred demo and pitch direction is Tier 0: pure software with near-zero marginal drone cost, with hardware assist only as a fallback.

## Planned Components

- Simulated FPV video source.
- OSD-like HMAC-authenticated marker overlay.
- Video degradation and noise simulator.
- Receiver-side multi-signal fusion (marker + time window + mission manifest + visual profile + optional RC/session + optional RF). Runs on a laptop-class machine.
- Operator dashboard with **five states** (see `docs/dashboard_states.md`):
  - `FRIENDLY_VERIFIED`
  - `LIKELY_FRIENDLY`
  - `UNKNOWN_NEEDS_REVIEW`
  - `SIGNATURE_CORRUPTED`
  - `POSSIBLE_SPOOF`
- Human-in-the-loop warning on every state.

## Receiver-Side Edge AI (locked direction)

All identification logic runs **receiver-side** on existing FPV video feeds. No drone-side AI hardware is required for the MVP. Per-drone marginal cost stays at Tier 0 (~$0). See `docs/cost_tiers.md` for hardware tiers and `docs/fusion_architecture.md` for the multi-signal fusion pipeline.

## Data Flow

1. Simulated feed is loaded or generated.
2. Friendly marker is overlaid for authorized demo feeds.
3. Noise/degradation is applied.
4. Receiver analyzes the video frame or stream.
5. Dashboard displays status for a human operator.

## Explicit Non-Goals

- No autonomous targeting.
- No autonomous engagement decisions (hard event constraint — see `AGENTS.md`).
- No weapon control.
- No jamming decisions.
- No evasion logic.
- No real-world deployment procedure.
- No drone-side AI hardware as a requirement.
