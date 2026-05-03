# Steganographic IFF — Concept Reference

This doc captures BlueMark FPV's core conceptual claim: the *novel* part is **steganography combined with cryptography**, not encrypted verification alone.

Source material: an internal technical concept doc, "Steganographic IFF for Analog FPV Drones," reviewed 2026-05-03. Relevant sections paraphrased here; this file is the single-place pitch reference.

## What's already deployed in the field

Friendly drones (notably DJI variants) already watermark their video feeds operationally. HMAC-style authentication of visible watermarks is also a known pattern. BlueMark is **not** claiming to invent either of those.

## What's novel

The marker lives in the **Vertical Blanking Interval (VBI)** of NTSC/PAL analog video — specifically lines 17–20. Broadcast TV used these lines for teletext and closed captions for decades. FPV goggles, monitors, capture cards, and enemy SDR receivers do not render them.

Combined with a per-frame HMAC, this gives:

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

## What we explicitly reject from the source concept

The source doc proposed: *"Decision rule: Unknown = eligible to jam. Friend = skip."* We **explicitly disagree** with that framing. The hackathon's hard event constraint is human-in-the-loop. Our 5-state taxonomy (`FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, `POSSIBLE_SPOOF`) gives the operator nuance; the system never recommends engagement. Anything that isn't authenticated as friendly is `UNKNOWN_NEEDS_REVIEW`, not "eligible to jam."
