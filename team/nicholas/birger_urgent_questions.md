# Urgent clarifications for Birger — 2026-05-02

Birger — sending these ahead of the full SME questionnaire (which lives in `team/nicholas/meeting_2026-05-02.md`). NICK-008 (architecture proposal) is paused until I know your read on these four. Short answers are fine.

## 1. The receiver

In your mental model of BlueMark, who/what is reading the friend-marker on a friendly drone's video? Pick whichever is closest:

- Ground EW team (laptop / dashboard / SDR rig)
- Another friendly drone within mesh range
- The drone itself, examining its own outbound video
- The same drone classifying *other* drones it sees in its FPV camera (different problem from the marker — please flag if you mean this)
- Some combination — specify

This pivots the architecture. Everything else follows.

## 2. Jamming pattern

When you said "assume jammed," do you mean:

- Continuous denial — comms basically unavailable for the mission
- Intermittent denial — comms work in windows but cannot be counted on
- Defensive assumption — design as if jammed for resilience even though it usually isn't

If intermittent: roughly what fraction of mission time can we assume some backhaul works?

## 3. On-drone compute reality

What compute does a typical *cheap, mass-produced* friendly FPV drone realistically carry today?

- Flight-controller class only (Betaflight, no spare cycles)
- Tiny microcontroller assist (ESP32-class, ~$5–25)
- Small companion compute (Pi Zero 2 W / Coral USB / Jetson Nano, ~$25–70)
- Heavier (Jetson Orin Nano-class, $100+)

Specifically: could a friendly drone realistically run a small visual classifier (e.g. YOLOv8n quantized at low resolution) onboard, or is that already too much weight / power / cost for disposable FPV?

## 4. Decision authority

When BlueMark says "this is friendly" or "this is foe", who is the *consumer* of that decision?

- The drone itself, taking immediate autonomous action
- A pilot (human) seeing it on goggles / control station
- An EW commander on the ground when comms allow
- A mesh of friendly drones coordinating

This affects our safety-boundary language. We've been writing "identification aid only, human decides" assuming a human in the loop — if the drone consumes the output, the framing has to change (or the architecture has to keep a human somewhere).

---

Reply in `team/birger/changelog.md` or however works. Whatever you can answer fast unblocks NICK-008 and downstream work.
