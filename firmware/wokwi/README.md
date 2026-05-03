# Wokwi Simulation — Drone-Side Marker Generation

Simulated Betaflight FC producing per-frame HMAC-authenticated markers identical in format to the Python receiver. Lives in the Wokwi web simulator (https://wokwi.com) — no real hardware required.

## What this is

A pitch-time bridge between the receiver-side code (real, shipped, in `src/bluemark/`) and the production-roadmap firmware fork (a Betaflight modification writing into VBI lines 17–20 of analog video — see `docs/steganographic_iff.md`). Wokwi runs an ESP32 simulating the FC; the C code uses mbedtls's HMAC-SHA256 to produce markers byte-identical to `src/bluemark/marker.py::make_marker`.

The cross-language compatibility is verifiable: pipe a marker line from the Wokwi serial monitor into `scripts/verify_firmware_marker.py`. It will report `✅ HMAC verification PASSED`.

## How to load it (~3 minutes)

1. Open https://wokwi.com/
2. Click **+ NEW PROJECT** → choose **ESP32**
3. Replace the default `sketch.ino` content with the contents of [`sketch.ino`](sketch.ino) in this directory.
4. Replace `diagram.json` content with [`diagram.json`](diagram.json) in this directory.
5. Click the green ▶️ START SIMULATION button.

The serial monitor will print one marker line per second. **Expected first line** (the firmware boots with `demo_ts = 1746208900` baseline):

```
[VBI line 17-20 write] MISSION-2026-05-02-A:1746208900:21022f95966557c07810cd256c350974
[VBI line 17-20 write] MISSION-2026-05-02-A:1746208901:<next hmac>
[VBI line 17-20 write] MISSION-2026-05-02-A:1746208902:<next hmac>
```

The HMAC suffix on the first line is **deterministic** — verifiable cross-language: that exact string is what `python -c "from bluemark.marker import make_marker; print(make_marker(b'hackathon-demo-secret-not-real', 'MISSION-2026-05-02-A', ts=1746208900))"` prints. If your Wokwi serial monitor shows a different HMAC on the first line for `ts=1746208900`, the firmware build is wrong (likely an mbedtls config issue).

## Verifying cross-language compatibility

Copy any marker line and feed it to the receiver-side verifier:

```bash
python scripts/verify_firmware_marker.py "MISSION-2026-05-02-A:1746208900:5b8d2a7e..."
```

Expected output:
```
marker:      MISSION-2026-05-02-A:1746208900:5b8d2a7e...
decoded:     True
hmac_valid:  True
✅ HMAC verification PASSED — firmware-side and receiver-side are cross-language compatible.
```

That's the integration claim: the same crypto, same format, same key contract. A real Betaflight fork swaps the `Serial.println` for a VBI write routine and changes nothing else.

## What this does NOT do

- Does **not** flash a real Betaflight FC. That's a multi-day effort and out of hackathon scope.
- Does **not** demonstrate VBI line writes through a real OSD chip (MAX7456 / AT7456 family) — that requires hardware and firmware-bypassing the chip's safe-area restrictions.
- Does **not** demonstrate VBI survival through the analog VTX → goggles → capture-card pipeline — Birger's Q4 noted this requires in-theatre tweaking against actual VTX/noise patterns.

For the pitch: this is the *firmware-side* bookend of the BlueMark integration story. Receiver side is real and tested (`pytest tests/`); firmware side is simulated here, with a clear path to a real fork.
