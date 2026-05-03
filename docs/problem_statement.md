# Problem Statement

Cheap FPV drones are now disposable, mass-produced battlefield assets, but friendly identification has not scaled with them.

Higher-end systems may have DroneID, operator-station identification, or dedicated hardware-based IFF. Cheap FPVs usually do not — adding $20+ of extra hardware to a $300 attritable platform doesn't scale. In contested environments, friendly EW teams may see a video or RF signal but still lack confidence that it belongs to their own pilot. This causes accidental self-jamming, lost missions, and operator confusion.

## What's already proven (in adjacent domains)

The component techniques BlueMark builds on are publicly documented and decades-old:

- **VBI data encoding** in analog TV (NABTS / teletext / closed-caption) — 1980s standard, 15.6 kbit/s per VBI line.
- **Covert video watermarking** — VEIL (1990s, luminance-based), Digimarc / Philips WaterCast (~72 bps program ID, no perceptible quality loss). Digimarc alone holds 800+ patents.
- **Covert light-based IFF** — US Patent 8,750,517 (encoded illumination, undetectable without key).
- **IR-based dismounted-soldier IFF** — fielded rolling-code systems.
- **Academic drone steganography** — LSB embedding for drone-captured stored photos.

## What's not been done — the gap

The *combination* applied to this specific problem hasn't been done publicly: **VBI encoding × live FPV analog video × on a flight controller × real-time IFF × zero added hardware cost × mass-produced cheap battlefield drones.** Birger's SME review (2026-05-03) confirmed this gap. Closest equivalent would be classified military programs that wouldn't be public.

We're not inventing new science; we're applying proven techniques to a problem they haven't been applied to. Implementation risk is low; operational risk is key management and ensuring the VBI payload survives the specific VTX / noise floor of cheap FPV hardware (Birger Q4: heavily contested EW environment; production deployment requires in-theatre tweaking).

## BlueMark FPV (this proof of concept)

A non-lethal identification aid for simulated FPV video:

- Embed a **steganographic HMAC marker** in the Vertical Blanking Interval of the analog video signal — VBI lines 17–20 of NTSC, lines that no FPV goggle, screen, or enemy capture device renders. Generated per-frame on the friendly drone's Betaflight FC using a pre-shared key never transmitted over the air.
- Receive on commodity hardware (~$50: Pi + USB capture card, or a laptop). Extract the VBI lines, validate the HMAC, check freshness window + mission manifest match.
- Fuse multiple receiver-side signals into a confidence score and one of five operator-facing states: `FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, `POSSIBLE_SPOOF`.
- Surface to a human operator. **The system never recommends engagement.** Human-in-loop is a hard event constraint and a hard safety boundary.

## Asymmetry — what we mark vs. what we identify

We mark *friendly* drones only. We have no mechanism to identify a foe. Anything that doesn't authenticate as friendly is `UNKNOWN_NEEDS_REVIEW` — never `FOE`. The complement of friendly-verified is *not-confirmed-friendly*, not hostile.

## Hackathon scope

- The cryptographic and fusion logic is real (`src/bluemark/`).
- The dashboard is real (`dashboard/` — React + Vite + TS).
- The video pipeline is *simulated*: pre-computed detector outputs in `feeds.json` instead of a live VBI-extracting receiver. The demo presenter's narration explains this; production deployment requires the firmware fork (`Betaflight + VBI write routine`) plus a real receiver.

The demo does not target, engage, jam, evade, or provide operational deployment guidance.
