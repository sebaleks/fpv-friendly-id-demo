# Firmware Simulation — Drone-Side Bookend

The receiver-side BlueMark code (`src/bluemark/`) is real, shipped, and tested. The drone-side firmware (a Betaflight fork that writes HMAC-authenticated bytes into VBI lines 17–20 of the analog video signal) is a *production roadmap* item — it would require a multi-day effort to flash real flight controllers and is not part of the hackathon demo.

To bridge that gap *for the pitch*, BlueMark ships a Wokwi-runnable simulation of the firmware-side marker generation. See `firmware/wokwi/`.

## What this proves

- **Same crypto, both ends.** The HMAC-SHA256 + payload format (`mission_id:ts:hex_hmac32`) is byte-identical between the firmware (C / mbedtls on simulated ESP32) and the receiver-side Python (`src/bluemark/marker.py`).
- **Verifiable cross-language compatibility.** `scripts/verify_firmware_marker.py` takes a marker line from the simulated firmware's serial output and verifies it against the receiver primitive. PASS = the integration claim holds.
- **Drop-in firmware path.** A real Betaflight fork replaces `Serial.println(marker)` with a VBI write routine targeting OSD chip lines 17–20; nothing else changes. The cryptographic primitive is portable.

## What this does NOT prove

- Real Betaflight FC flash with the modified firmware — multi-day effort, out of hackathon scope.
- Real VBI write through a MAX7456/AT7456 OSD chip past its safe-area restrictions — needs hardware.
- VBI survival through the analog VTX → goggles → capture-card pipeline under jamming — Birger Q4 noted this requires in-theatre tweaking against actual VTX/noise.

## Pitch framing

> "The receiver runs entirely on a backpack-portable rig and is real, tested, and shipped. The firmware side is simulated in Wokwi for this demo — same C code that would land in a Betaflight fork. The cross-language verifier proves a marker produced by the simulated FC decodes cleanly on the receiver. That's the full integration loop with one piece (real-FC flash) honestly deferred to production."

## How to run end-to-end

1. Load `firmware/wokwi/sketch.ino` and `diagram.json` into Wokwi (see `firmware/wokwi/README.md`).
2. Start the Wokwi simulation. Copy a marker line from the serial monitor.
3. From the project root: `python scripts/verify_firmware_marker.py '<paste marker>'`.
4. Expected: `PASS — firmware-side and receiver-side are cross-language compatible.`

## Files

| File | Purpose |
|---|---|
| `firmware/wokwi/sketch.ino` | ESP32 firmware: mbedtls HMAC-SHA256, marker formatting, serial output. |
| `firmware/wokwi/diagram.json` | Wokwi project layout — ESP32 dev board + serial monitor. |
| `firmware/wokwi/wokwi.toml` | Wokwi config (board, build artifacts). |
| `firmware/wokwi/README.md` | Load-into-Wokwi instructions, expected output, troubleshooting. |
| `scripts/verify_firmware_marker.py` | Cross-language verifier consuming the firmware's marker output. |
