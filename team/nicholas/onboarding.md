# Self-onboarding — FPV / OSD basics

Nicholas's catch-up notes for the BlueMark FPV domain. Folded out of NICK-009.

## FPV (first-person view) drones

The pilot wears goggles that show the live feed from a camera mounted on the drone — they see what the drone "sees." Originally consumer racing tech; in the current Ukraine conflict, FPV drones are mass-produced as cheap, attritable munition platforms (often a few hundred USD per unit, sometimes less). The video link is typically analog (5.8 GHz) and noisy. Range is short; degradation is the norm, not the exception.

## OSD (on-screen display)

A graphical overlay drawn into the video by the drone's flight-controller chip — usually telemetry like altitude, battery, GPS, RC link RSSI. Betaflight (the dominant FPV firmware) ships with an OSD subsystem that already supports custom glyphs. The OSD chip family (MAX7456 / AT7456 and clones) is what does the drawing.

## VBI (Vertical Blanking Interval) — where the marker actually lives

NTSC/PAL analog video has lines that are *never displayed* on FPV goggles or screens — the Vertical Blanking Interval, approximately lines 10–21 of each frame. Broadcast TV used VBI for teletext and closed captions for decades. **Lines 17–20 are our target.** A standard FPV receiver, goggles, or capture card never renders these lines. They are invisible to the pilot, invisible to anyone watching the feed, and invisible to an enemy capturing the signal — *unless* they specifically know to look there.

This is the core insight that makes BlueMark different from existing visible watermarking. The OSD chip can be coaxed (via firmware mod) to write into VBI lines beyond its default safe-area restrictions. So:

- The drone marks itself by writing HMAC bytes into VBI from the FC's OSD path. Zero added hardware.
- The receiver extracts those VBI lines from a composite video capture (~$15 USB capture card + Pi or laptop).
- An enemy sees only normal video plus electrical noise in the blanking interval.

In short: OSD chip = the *mechanism* that lets us write into VBI without adding hardware; VBI = the *location* that's invisible to anyone not specifically extracting it.

## HMAC marker (BlueMark's mechanism)

**Hackathon payload (in code):** `<mission_id>:<unix_timestamp>:<hex_hmac32>`. HMAC-SHA256 of `<mission_id>:<ts>` with a per-mission secret, truncated to 32 hex chars. Verifier checks: (1) parse format, (2) HMAC matches, (3) timestamp inside a freshness window (default 10s — prevents replay).

**Production payload (per source concept doc):** bit-packed: `[4-bit version][16-bit unit ID][32-bit truncated HMAC][rolling counter]` ≈ 52–64 bits, fits in a single VBI line. Same cryptographic substance; the receiver-side decoder swaps trivially.

The marker rotation Sebastian mentioned in the meeting (~20s in real ops) is the freshness window in disguise — every fresh frame embeds a new marker carrying a fresh timestamp, so observed marker bytes are continuously changing. An adversary who captures a marker can't replay it past the window.

## Drone types in the conflict (rough sketch — to be refined by Birger)

- Ukrainian side: many custom builds, plus DJI Mavic-class commercial drones. Munition FPVs vary wildly in physical shape.
- Russian side: Lancet (loitering munition), ZALA, Orlan family, plus some commercial DJI variants.

Visual distinguishability between sides is *not* generally clean. That's part of why the marker matters — visual classification alone is unreliable in real ops, so cryptographic authentication on the friendly side gives a high-confidence signal we can trust. Visual classification (when it works) is *supporting* evidence, never a primary friend/foe call.

## Receiver-side reading (where BlueMark's logic lives)

For BlueMark, "the receiver" is a friendly EW team's monitoring station: a laptop or ground station capturing one or more analog FPV feeds (via a 5.8 GHz video receiver + capture card or SDR). The detector code runs there. No drone-side AI hardware is required. This is the architectural lock from the 2026-05-02 meeting + Birger relay.

## Why "unknown" never becomes "foe"

Cheap FPV drones are operationally similar across sides; failing to authenticate as friendly does not authenticate as enemy. Mislabeling unknown as hostile is both unsafe and gets us eliminated from the hackathon (autonomous-engagement language is a hard event constraint). Unknown = "needs human review," nothing more.
