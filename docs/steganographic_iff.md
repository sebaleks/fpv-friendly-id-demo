# Steganographic IFF — Concept Reference

This doc captures BlueMark FPV's core conceptual claim: the *novel* part is **steganography combined with cryptography**, not encrypted verification alone.

Source material: an internal technical concept doc, "Steganographic IFF for Analog FPV Drones," reviewed 2026-05-03. Relevant sections paraphrased here; this file is the single-place pitch reference.

## Prior art (proven, decades old)

The components BlueMark builds on are individually mature and publicly documented. Birger's SME review (2026-05-03) confirmed this — full citations in `team/nicholas/birger_responses_2026-05-03.md`. Summary:

1. **VBI data encoding.** Analog TV has used the vertical blanking interval for datacasting since the 1980s — closed captioning, teletext, VITC timecode, copy-protection. **NABTS** (North American Broadcast Teletext Specification) encodes digital data in VBI at 15.6 kbit/s per line. Our ~64-bit/frame payload is trivial by comparison.
2. **Covert video watermarking (commercial).** **VEIL** (1990s–2000s) modulated luminance across adjacent lines to carry data — used for interactive TV. **Digimarc / Philips WaterCast** added program-specific identifiers at transmission time, key-holding detectors required, ~72 bps with no perceptible video quality loss. Digimarc alone holds ~30 years of expertise and 800+ patents.
3. **Covert light-based IFF.** **US Patent 8,750,517** — encoded illumination from an object's surface, undetectable without the key. Same cryptographic-stealth principle applied to light.
4. **IR-based dismounted-soldier IFF.** Rolling codes of the day, response undetectable without expected timing parameters. Fielded.
5. **Drone image steganography (academic).** Modified-LSB embedding with chaotic positioning, marking drone-captured photographs. Stored images, not live video.

## What's not been done — the gap BlueMark fills

Per Birger's analysis: **the combination doesn't exist publicly.**

- VBI data encoding ✗ live FPV analog video
- ✗ on a flight controller (not a broadcast encoder)
- ✗ for real-time IFF (not copyright / forensics)
- ✗ at zero added hardware cost
- ✗ for mass-produced cheap battlefield drones

The individual technologies are mature. Their *combination* applied to this specific problem appears genuinely novel and unaddressed in public literature. Closest equivalent would be classified military programs, which wouldn't be public.

**Birger's verdict on positioning (paraphrased):** *"You're not inventing new science, you're applying proven techniques to a new problem. Implementation risk is low; operational risk is in key management and ensuring the VBI survives the specific VTX/noise floor of cheap FPV hardware."*

## What we actually claim is novel

The marker lives in the **Vertical Blanking Interval (VBI)** of NTSC/PAL analog video — specifically lines 17–20. FPV goggles, monitors, capture cards, and enemy SDR receivers do not render them.

Combined with a per-frame HMAC and rolling counter, this gives:

- **Invisible to enemy.** The IFF channel doesn't exist for anyone who isn't extracting VBI specifically with the right key.
- **Unforgeable.** HMAC with a pre-shared key (provisioned at flash time, never transmitted over air).
- **Replay-resistant.** Rolling timestamp / counter in payload.
- **Zero added hardware on the drone.** Betaflight firmware modification only — the existing OSD chip (MAX7456 / AT7456 family) already has the hardware capability; the firmware just bypasses its safe-area restrictions to write VBI lines.
- **Cheap receiver.** ~$15 USB composite capture card + ~$35 Raspberry Pi class compute. Or any laptop with a capture interface.

This addresses the operational problem with visible watermarking — that *visible* identification becomes an enemy targeting beacon.

## Payload (~52–64 bits per frame)

```
[ 4-bit protocol version ]
[ 16-bit unit ID ]
[ 32-bit truncated HMAC ]
[ rolling timestamp / counter ]
```

Fits in a single VBI line. One frame at 60 fps = ~16 ms decision latency.

Our hackathon implementation in `src/bluemark/marker.py` uses a slightly different concrete payload format (`<mission_id>:<unix_ts>:<hex_hmac32>`) — same cryptographic substance, simpler to demo. A production firmware fork would use the bit-packed payload above; the receiver-side decoder swaps trivially.

## Receiver-side flow

```
Composite video → capture card → VBI line extractor → HMAC verifier → fusion → dashboard state
```

The fusion and dashboard layers (this repo's `src/bluemark/fusion.py` + `dashboard/`) are agnostic to whether the marker came from a real VBI extraction or a pre-computed `feeds.json`. The demo uses the pre-computed path; production uses the live extraction.

## What our hackathon demo does and doesn't show

- **Shows:** real HMAC verification, real 5-state fusion, real React dashboard rendering, all the operator-facing UX.
- **Doesn't show:** live VBI injection from a real Betaflight FC, or live VBI extraction from a real analog capture. The presenter narration is honest about this; production deployment requires the firmware fork plus the capture rig.

## Production roadmap (out of hackathon scope)

1. Betaflight fork — VBI write routine targeting lines 17–20 via the OSD chip. Differs slightly per chip variant (MAX7456 vs AT7456 vs clones).
2. Key provisioning tool — CLI / Configurator integration, writes unit ID + HMAC key to EEPROM at flash time.
3. Receiver script — Python on Pi, captures composite, extracts VBI lines, validates HMAC, emits FusionSignal feeds into our existing fusion engine.
4. Field trial — mark N friendly drones, run EW detection, measure FP/FN rate.

## Why this fits Natsec Problem Statement 2 (Edge Deployments)

Problem Statement 2 asks for *"computation and control pushed to the tactical edge"* in *"austere, disconnected environments, sometimes from nothing more than a backpack,"* with *"power, latency, and mission complexity"* balanced.

| PS2 requirement | BlueMark's answer |
|---|---|
| "Push computation to tactical edge" | Marker generation runs on the drone's Betaflight FC (STM32-class). Detection runs on a Pi / laptop / EW scanner. No cloud, no central server. Edge-on-edge. |
| "Austere, disconnected environments" | Receiver works offline. Drone signs locally with a pre-shared key (provisioned at flash time). No backhaul required at any point. |
| "From a backpack" | $50 receiver kit (Pi + USB capture card) is backpack-portable. The whole receiver-side stack fits in a laptop bag. |
| "Resilient drone systems" | IFF lives at the analog-video / VBI layer — not GPS, not cellular, not satellite. Survives jammed RF environments to the same extent any signal does at all (Birger Q1 confirmed ~50% feed throughput is operational baseline). |
| "Balancing power, latency, mission complexity" | ~16 ms decision latency (one frame at 60 fps). Zero added drone power (firmware-only; the OSD chip's existing draw doesn't change). ~64 bits/frame payload — negligible bandwidth. |
| "Low to moderate compute availability" | STM32 on drone; Pi or laptop on receiver. Deliberately *not* Jetson- or server-class — that's the design point. |

This is the corner of PS2 that BlueMark addresses: **edge-on-edge IFF for the most common and numerous low-end analog FPV drones and EW receptors.** It does not address autonomous flight, swarming, or mission-execution edge intelligence — those are adjacent corners of PS2 that other teams may target.

## What we explicitly reject from the source concept

The source doc proposed: *"Decision rule: Unknown = eligible to jam. Friend = skip."* We **explicitly disagree** with that framing. The hackathon's hard event constraint is human-in-the-loop, and Birger (SME, 2026-05-03 reply) confirmed it: *"Human in the loop is still standard. There may be other signatures being used in addition to the watermark. In the end it is a decision made by an interceptor operator."* Our 5-state taxonomy (`FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, `POSSIBLE_SPOOF`) gives the operator nuance; the system never recommends engagement. Anything that isn't authenticated as friendly is `UNKNOWN_NEEDS_REVIEW`, not "eligible to jam."

## Optimization target (per Birger Q7)

**Minimize false friendly.** A foe that gets labeled `FRIENDLY_VERIFIED` is the worst error — it would invert the system's stated purpose. We'd rather call a friendly `UNKNOWN_NEEDS_REVIEW` than call a foe `FRIENDLY_VERIFIED`. The 5-state taxonomy is already biased this way: `FRIENDLY_VERIFIED` requires marker + freshness + mission match + at least one supporting signal; missing any of those produces a less-confident state, never a stronger one. Demoting a marker-valid feed to `LIKELY_FRIENDLY` (no supporting signal) is the explicit conservatism check.
