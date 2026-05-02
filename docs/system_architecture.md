# System Architecture

## Goal

Build a compact hackathon demo that simulates friendly FPV identification in degraded video.

Cost framing lives in `docs/cost_tiers.md`. The preferred demo and pitch direction is Tier 0: pure software with near-zero marginal drone cost, with hardware assist only as a fallback.

## Planned Components

- Simulated FPV video source.
- OSD-like authenticated marker overlay.
- Video degradation and noise simulator.
- Receiver-side marker detector.
- Operator dashboard with four states:
  - `Friendly Verified`
  - `Unknown`
  - `Corrupted`
  - `Possible Spoof`
- Human-in-the-loop warning and explanation area.

## Data Flow

1. Simulated feed is loaded or generated.
2. Friendly marker is overlaid for authorized demo feeds.
3. Noise/degradation is applied.
4. Receiver analyzes the video frame or stream.
5. Dashboard displays status for a human operator.

## Explicit Non-Goals

- No autonomous targeting.
- No weapon control.
- No jamming decisions.
- No evasion logic.
- No real-world deployment procedure.
