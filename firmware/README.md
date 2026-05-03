# `firmware/`

Drone-side firmware artifacts. The hackathon demo runs entirely on the receiver side (`src/bluemark/` + `dashboard/`); this directory is the production-roadmap bookend.

- [`wokwi/`](wokwi/) — ESP32 simulation of the FC-side marker generation, runnable in https://wokwi.com without any real hardware. Full integration story documented in [`docs/firmware_simulation.md`](../docs/firmware_simulation.md).

A real Betaflight fork would replace the simulated serial print with a VBI write routine targeting OSD chip lines 17–20 (MAX7456 / AT7456 family). See [`docs/steganographic_iff.md`](../docs/steganographic_iff.md) §"Production roadmap" for the full path.
