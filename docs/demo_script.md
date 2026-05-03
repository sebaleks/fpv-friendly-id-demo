# Demo Script

## 3-Minute Live Narration (Authoritative — no pitch slides)

> *Four parts: (1) background + US Army relevance, (2) problem statement, (3) solution/demo deep dive, (4) scalability/cost/margin. Every beat keeps the persistent footer "Identification aid only. Human decision required." visible. Total target: 3:00.*

### Pre-show (off-stage, before opening)
- Dashboard open in browser at `http://localhost:5174/`.
- **Nothing selected** — right pane shows MissionOverview by default.
- Sort dropdown set to **Severity** (default). Density: compact. Video toggle: on.
- TacticalMap visible bottom-right.

---

### Part 1 · 0:00 – 0:25 — Background + US Army relevance
*(Don't touch the dashboard yet. Look at the audience.)*

"In Ukraine, FPV drones have become the dominant battlefield platform — millions deployed, single-use, swarming. The US Army is following: division-level FPV units stood up in 2024, and the operational model is converging. But there's a gap. These platforms have **no IFF**. None. When friendly and adversary FPVs share the same airspace and the same video signal, the operator can't tell them apart fast enough."

### Part 2 · 0:25 – 0:40 — Problem statement
"Traditional IFF transponders don't fit on a four-hundred-dollar single-use drone. No spare hardware budget. No spare bandwidth. No spare power. The question we asked: can we add a cryptographic friendly-marker to FPV video, **without adding a single component to the drone?**"

---

### Part 3 · 0:40 – 2:40 — Solution + live demo

#### 0:40 – 0:55 — The architecture (one sentence) + open Mission Control
*(Gesture at the screen as you say "here's what the operator sees.")*

"Yes — by embedding an HMAC-authenticated marker in the **unrendered VBI lines** of the analog video. Invisible to the pilot, invisible to anyone watching the picture, generated on the drone's existing flight controller. Zero added hardware. Detection runs on a backpack laptop. Edge-on-edge. Here's what an EW operator sees. \[gesture top bar\] Five feeds in this AO; **two need review**. List sorted by severity — top is what needs attention now."

#### 0:55 – 1:15 — FEED-E: `POSSIBLE_SPOOF`
*(Click FEED-E in the left list.)*

"Top of the triage. POSSIBLE_SPOOF. \[point to signal trace\] Marker present, **HMAC failed**. A captured drone replaying yesterday's marker, or an adversary copying the byte pattern without the key. The system flags suspicion — it never flags *engage*."

#### 1:15 – 1:35 — FEED-D + FEED-C: ambiguous in different ways
*(Click FEED-D, then FEED-C.)*

"\[click FEED-D\] SIGNATURE_CORRUPTED — marker came through partial. Analog noise. \[click FEED-C\] UNKNOWN — no marker at all. Both end up the same place: **operator review**. **Unknown is not foe** — that's the hard line. We do not force verdicts on noisy or absent data."

#### 1:35 – 1:55 — FEED-B: `LIKELY_FRIENDLY`
*(Click FEED-B.)*

"LIKELY_FRIENDLY. \[point to signal trace\] Five signals pass, two missing. We **deliberately do not promote it** to fully verified. Minimum-false-friendly is the design goal — a foe stealing one component never climbs to FRIENDLY_VERIFIED."

#### 1:55 – 2:20 — FEED-A: `FRIENDLY_VERIFIED`
*(Click FEED-A.)*

"All seven signals PASS. HMAC marker is the source of truth; the other six are corroboration. Highest confidence. **Identification aid only. Human decision required.** That phrase is on every screen, every state, every fallback path. We never label any feed *foe* — the complement of friendly-verified is not-confirmed-friendly, not hostile."

#### 2:20 – 2:40 — Operational features + return to Mission Control
*(Click "Mission Control" in the top bar.)*

"Couple of operationally useful touches. \[point to TacticalMap\] **Every feed has estimated coordinates** — operators can prioritize unknowns or possible spoofs near sensitive assets without scanning the list. \[point to declared-friendlies panel\] **Manifest cross-check** flags any drone that's expected but missing — comms loss, downed asset, or worse. \[point to event log\] **Recent transitions** show what just changed, not just current state. And a pretrained visual classifier sits behind a safety invariant in the repo — we cut it from the live path because the cryptographic marker is sufficient."

---

### Part 4 · 2:40 – 3:00 — Scalability, cost, margin
"Scaling. Marker generation is a software flash to firmware already flying — **zero added per-drone cost**. At a dollar per drone, a seven-million-drone peer fight is a seven-million-dollar program. **One prevented friendly-fire incident pays for the entire deployment.** The unit economics work at any scale you can name."

---

## Click Path Cheat-Sheet

1. **Pre-show**: dashboard at `:5174`, severity sort, no feed selected, TacticalMap visible.
2. **0:40** — start gesturing at the dashboard (no click yet).
3. **0:55** click FEED-E → spoof beat.
4. **1:15** click FEED-D → corrupted beat.
5. **1:25** click FEED-C → unknown beat.
6. **1:35** click FEED-B → likely beat.
7. **1:55** click FEED-A → verified beat.
8. **2:20** click "Mission Control" in top bar → back to overview.
9. **2:40** start the cost/scale close. Footer holds the room.

## What To Say For Each State (one-liners — for Q&A)

- `POSSIBLE_SPOOF`: "Marker pattern present, HMAC failed. Suspicious, not actionable."
- `SIGNATURE_CORRUPTED`: "Marker bytes present, too noisy to verify. Operator reviews."
- `UNKNOWN_NEEDS_REVIEW`: "No marker. Unknown is not foe."
- `LIKELY_FRIENDLY`: "Marker valid, supporting signals missing. We refuse to promote — false-friendly is the worst error."
- `FRIENDLY_VERIFIED`: "All seven signals pass. Aid only."

## Recovery Patter (if it breaks mid-demo)

- **Dashboard freezes**: "Live system — edge deployments fail; that's why the same `feeds.json` shape ships as a scripted fallback." Refresh the page or pivot to the 30-second emergency version.
- **Click doesn't register**: keep talking, click again. Don't draw attention to it.
- **Wrong sort applied**: don't try to fix mid-walk; narrate whichever state is at the top of the list.

## 30-Second Emergency Version

"BlueMark FPV is software-only friendly-IFF for cheap analog FPV drones — Ukraine's dominant platform, the US Army's next gap. We embed an HMAC marker in the unrendered VBI lines of the video. Zero added hardware on the drone. \[click FEED-E\] Spoof — HMAC failed. \[click FEED-A\] Verified — all seven signals pass. Every state on this dashboard says: **Identification aid only. Human decision required.** Edge-on-edge. No cloud. A dollar per drone."

## Closing Sentence (if you only get one)

"The value is clearer human deconfliction at the tactical edge — running entirely on hardware already in the field, in the austere, EW-contested, disconnected environments where IFF actually has to work."
