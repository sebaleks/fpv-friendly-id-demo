# Problem Statement

Cheap FPV drones are now disposable, mass-produced battlefield assets, but friendly identification has not scaled with them.

Higher-end systems may have DroneID, operator-station identification, or dedicated hardware-based IFF. Cheap FPVs usually do not — adding $20+ of extra hardware to a $300 attritable platform doesn't scale. In contested environments, friendly EW teams may see a video or RF signal but still lack confidence that it belongs to their own pilot. This causes accidental self-jamming, lost missions, and operator confusion.

## Why existing watermarking isn't enough

Friendly drones (notably DJI variants) already watermark their video feeds operationally. The remaining gap: **visible watermarks become enemy targeting beacons.** Any signature that's too obvious can be used by the enemy to detect and locate friendlies. The system needs to be *invisible to the enemy*, *unforgeable*, and *deployable via firmware flash alone* — no added drone hardware.

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
