# Urgent clarifications for Birger — 2026-05-02 (revised + answered)

Birger — partial answers landed via Sebastian since the original draft:

- **Human-in-loop is confirmed** (and is a hard event constraint — we'd be eliminated otherwise).
- **We're committing to Problem A**: the friendly drone embeds an authenticated OSD-style marker into its own video; a ground EW team reads the marker and classifies feeds. Problem B (drone-onboard classification of *other* drones in its FPV view) is demoted to a pitch-side mention, not an MVP track.

That closed original Q1 (receiver = ground EW team) and Q4 (decision consumer = human operator). Two questions remained — both now have **preliminary answers from Birger (2026-05-03)** below.

## 1. Jamming pattern — ✅ ANSWERED

**Birger's answer:** *Intermittent denial — comms work in windows but cannot be counted on. Assuming ~50% of friendly feeds get through.*

**Bonus context Birger added:**
- Receiving teams lock onto drones and record flight path + radio frequency.
- DJI drones already have encoding interleaved in friendly video feeds.
- **All friendly video feeds are watermarked** (operationally, today).

**What this means for us:**
- BlueMark's authenticated-marker concept is *consistent with existing operational practice* — we're adding a cryptographic upgrade to an already-deployed watermarking pattern, not introducing a new idea. Strong pitch framing.
- Dashboard should gracefully handle missing feeds (~half of incoming friendly feeds may not arrive in any given window). MVP can mock this with a "feed unavailable" tile; pitch covers it explicitly.
- Mission timing matters: a feed not arriving in window N might arrive in window N+1. Don't permanently mark "missing."

## 2. Receiver-side compute — ✅ ANSWERED (with scope clarification)

**Scope clarifier (re Birger's pushback "is this on the drone or the FPV?"):**

The question was about the **ground receiver only** — the laptop / Pi / NUC where BlueMark's fusion logic runs. We do **not** add anything to:
- the drone airframe / flight controller (STM32-class), or
- the FPV camera / analog VTX / OSD layer (where the existing watermark lives).

The drone's existing OSD layer is *where the marker is embedded* (by reusing the same overlay capability already drawing telemetry), but no BlueMark *compute* runs on the drone.

**Birger's answer:** *Software runs on a laptop. Drone-side compute is typically Pi or STM32.*

**What this means for us:**
- Receiver = laptop class. **Tier 0 software-first confirmed.** No change to `docs/cost_tiers.md`.
- Drone-side compute info (Pi / STM32) is bonus context — useful for pitch when describing Tier 2/3 *future* paths where extra drone-side hardware could host marker generation logic. Doesn't change MVP scope.

---

Both urgent questions are now answered to a "good enough for hackathon" level. The full SME questionnaire (12+2 questions in `team/nicholas/meeting_2026-05-02.md`) remains async — Birger can answer when convenient. The watermark insight (Q1 bonus) gets surfaced in the pitch.
