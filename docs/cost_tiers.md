# Cost Tiers

BlueMark FPV should be pitched as software-first. Hardware is a fallback only when the existing OSD or firmware path cannot support marker generation.

| Tier | Approach | Approx. added cost per drone | Best use |
| --- | --- | ---: | --- |
| Tier 0 | Pure software OSD marker | ~$0 | Best hackathon MVP and best scaling story |
| Tier 1 | Software + existing RC/telemetry metadata | ~$0-$20 | Low-cost future integration path |
| Tier 2 | Tiny microcontroller assist | ~$5-$25 | Fallback if firmware/OSD cannot generate marker logic directly |
| Tier 3 | Small companion computer | ~$20-$70+ | Prototype or higher-value drone path, not default mass-FPV path |

## Tier 0: Pure Software

Added cost per drone: ~$0

Uses what the drone already has:

- Betaflight-compatible OSD path.
- Existing video feed.
- Receiver-side detector.
- Mission manifest.
- Dashboard fusion.

Identity signals:

- Rotating OSD marker.
- Time-window freshness.
- Mission allowlist.
- Receiver-side video verification.

Pitch: Near-zero marginal cost if the drone already has an OSD/video-overlay path.

## Tier 1: Software + Existing Metadata

Added cost per drone: ~$0-$20

Uses the OSD marker plus metadata from the control or telemetry stack if already available.

Identity signals:

- OSD marker valid.
- Drone ID in mission manifest.
- RC/session metadata matches expected pilot or controller.
- Time window is fresh.

Pitch: Still mostly software, but cross-validates video identity against existing session context.

## Tier 2: Tiny Microcontroller Assist

Added cost per drone: ~$5-$25

Adds a very small board only if flight controller or OSD firmware cannot handle marker generation cleanly.

Possible hardware:

- ESP32-class board.
- Small microcontroller.
- Lightweight serial connection to flight controller.

Use for:

- Generating rotating marker codes.
- Storing mission/session identity.
- Feeding marker state to the OSD layer.

Pitch: Still cheap enough for mass FPV scaling, but only used when pure software is not feasible.

## Tier 3: Small Companion Computer

Added cost per drone: ~$20-$70+

Adds more compute for video processing or overlay control.

Possible hardware:

- Raspberry Pi Zero 2 W.
- Small Linux SBC.
- Lightweight video-overlay module.

Use for:

- More flexible video overlay.
- More complex local identity logic.
- Digital video workflows.
- Rapid prototyping.

Downside:

- More weight.
- More power draw.
- More wiring.
- More failure points.
- Less attractive for disposable drones.

Pitch: Useful for prototypes or higher-value FPVs, but not the preferred path for mass-produced cheap drones.

## Recommendation

For the hackathon, present BlueMark FPV as Tier 0: a pure software OSD-marker system with near-zero marginal drone cost. Tier 1 adds cross-validation from existing RC/telemetry metadata. Tier 2 stays under roughly $25 when a tiny helper board is needed. Tier 3 remains under the $70 constraint for some prototypes, but it is not the default path for disposable FPV scale.
