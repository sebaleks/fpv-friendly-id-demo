# Self-onboarding — FPV / OSD basics

Nicholas's catch-up notes for the BlueMark FPV domain. Folded out of NICK-009.

## FPV (first-person view) drones

The pilot wears goggles that show the live feed from a camera mounted on the drone — they see what the drone "sees." Originally consumer racing tech; in the current Ukraine conflict, FPV drones are mass-produced as cheap, attritable munition platforms (often a few hundred USD per unit, sometimes less). The video link is typically analog (5.8 GHz) and noisy. Range is short; degradation is the norm, not the exception.

## OSD (on-screen display)

A graphical overlay drawn into the video by the drone's flight-controller chip — usually telemetry like altitude, battery, GPS, RC link RSSI. Betaflight (the dominant FPV firmware) ships with an OSD subsystem that already supports custom glyphs. We co-opt the OSD layer to embed an authenticated friendly marker. The drone's own chip draws the marker; whoever later watches the video reads it. No new hardware on the drone.

## HMAC marker (BlueMark's mechanism)

Marker payload format: `<mission_id>:<unix_timestamp>:<hex_hmac32>`. HMAC-SHA256 of `<mission_id>:<ts>` with a per-mission secret, truncated to 32 hex chars. Verifier checks: (1) parse format, (2) HMAC matches, (3) timestamp inside a freshness window (default 10s — prevents replay). Real production would rotate the secret per mission and likely use 128-bit truncation, but for hackathon-grade the 32-hex truncation is plenty.

The marker rotation Sebastian mentioned in the meeting (~20s in real ops) maps to the timestamp's freshness window — every fresh frame embeds a new marker carrying a fresh timestamp, so observed marker bytes are continuously changing. An adversary who captures a marker can't replay it past the freshness window.

## Drone types in the conflict (rough sketch — to be refined by Birger)

- Ukrainian side: many custom builds, plus DJI Mavic-class commercial drones. Munition FPVs vary wildly in physical shape.
- Russian side: Lancet (loitering munition), ZALA, Orlan family, plus some commercial DJI variants.

Visual distinguishability between sides is *not* generally clean. That's part of why the marker matters — visual classification alone is unreliable in real ops, so cryptographic authentication on the friendly side gives a high-confidence signal we can trust. Visual classification (when it works) is *supporting* evidence, never a primary friend/foe call.

## Receiver-side reading (where BlueMark's logic lives)

For BlueMark, "the receiver" is a friendly EW team's monitoring station: a laptop or ground station capturing one or more analog FPV feeds (via a 5.8 GHz video receiver + capture card or SDR). The detector code runs there. No drone-side AI hardware is required. This is the architectural lock from the 2026-05-02 meeting + Birger relay.

## Why "unknown" never becomes "foe"

Cheap FPV drones are operationally similar across sides; failing to authenticate as friendly does not authenticate as enemy. Mislabeling unknown as hostile is both unsafe and gets us eliminated from the hackathon (autonomous-engagement language is a hard event constraint). Unknown = "needs human review," nothing more.
