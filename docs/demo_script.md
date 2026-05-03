# Demo Script

## 3-Minute Live Narration (Authoritative — no pitch slides)

> *Walk the live v3 dashboard at `:5174`. Default sort is **severity** (highest-risk first), so the list reads top-down: SPOOF → CORRUPTED → UNKNOWN → LIKELY → VERIFIED. We deliberately walk in this order — bad-news-first ends on the success beat, which is dramatically stronger than A→E. Every beat keeps the persistent footer "Identification aid only. Human decision required." visible. Total target: 3:00.*

### Pre-show (off-stage, before opening)
- Dashboard open in browser at `http://localhost:5174/`.
- **Nothing selected** — the right pane shows MissionOverview by default.
- Sort dropdown set to **Severity** (default). Density: compact. Video toggle: on.
- Tactical map is visible in the bottom-right.

### 0:00 – 0:30 — Open on Mission Control
*(Right pane is MissionOverview; nothing clicked yet.)*

"BlueMark FPV — receiver-side IFF for cheap analog FPV drones. Edge-on-edge, no cloud, software-only. \[gesture top bar\] Five feeds in this AO; **two need review**. \[point to state-distribution bar\] Severity at a glance. \[point to declared friendlies\] Every feed is cross-checked against today's signed mission manifest. \[point to tactical map\] Here they are in the AO. The list at left is sorted by severity — top of the list is what needs operator attention now."

### 0:30 – 0:50 — FEED-E: `POSSIBLE_SPOOF`
*(Click FEED-E in the left list. FeedDetail loads.)*

"Top of the triage. POSSIBLE_SPOOF. \[point to signal trace\] Firmware marker present, steg-IFF token decoded, but **HMAC verification failed**. Marker-like data, no cryptographic proof. Could be a captured drone replaying yesterday's marker, or an adversary copying the byte pattern without the key. The system flags suspicion — it does not flag *engage*."

### 0:50 – 1:05 — FEED-D: `SIGNATURE_CORRUPTED`
*(Click FEED-D.)*

"Next: SIGNATURE_CORRUPTED. Marker present, steg-IFF token came through partial — analog degradation. \[point to signal trace\] One PASS, one FAIL, five MISSING. Operator reviews. We don't force a verdict on noisy data."

### 1:05 – 1:20 — FEED-C: `UNKNOWN_NEEDS_REVIEW`
*(Click FEED-C.)*

"Zero signals. No marker observed at all. **Unknown is not foe** — that's the hard line. The complement of friendly-verified is *not-confirmed-friendly*, never hostile."

### 1:20 – 1:40 — FEED-B: `LIKELY_FRIENDLY`
*(Click FEED-B.)*

"LIKELY_FRIENDLY. \[point to signal trace\] Five signals pass — firmware marker, steg-IFF token, HMAC verified, freshness, manifest match. Two missing. We **deliberately do not promote it** to fully verified. Minimum-false-friendly is the design goal — a foe who steals one component never reaches FRIENDLY_VERIFIED."

### 1:40 – 2:00 — FEED-A: `FRIENDLY_VERIFIED`
*(Click FEED-A.)*

"All seven signals PASS. \[point to signal trace\] HMAC marker is the source of truth; the other six are corroboration. Highest confidence. **Identification aid only. Human decision required.** That phrase is on every screen, every state, every fallback path."

### 2:00 – 2:30 — Honest ML note + scaling
*(Click "Mission Control" in the top bar to return to overview.)*

"Two honest notes. **ML**: we built a pretrained YOLO classifier, gated by a safety invariant so vision can never derive 'friendly' on its own. We **cut it from the live path** — our SME confirmed the cryptographic marker is sufficient. Code stays in the repo; the architecture decision is the talking point. **Scaling**: marker generation is a software change to firmware already flying. Zero added per-drone cost. Receiver runs on hardware EW teams already carry. Edge-on-edge. No cloud. Works EW-contested."

### 2:30 – 3:00 — Close
"What's novel here isn't VBI watermarking, isn't HMAC, isn't IFF — those are decades-proven prior art. It's the **combination**: applied to cheap FPV analog video, on a flight controller, for real-time IFF, at zero added hardware cost. That's the gap we close — on equipment already in the field today. Identification aid only. The human decides."

## Click Path Cheat-Sheet

1. Pre-show: dashboard open at `:5174`, severity sort, no feed selected (MissionOverview visible), TacticalMap visible.
2. **0:30** click FEED-E → narrate spoof beat.
3. **0:50** click FEED-D → narrate corrupted beat.
4. **1:05** click FEED-C → narrate unknown beat.
5. **1:20** click FEED-B → narrate likely beat.
6. **1:40** click FEED-A → narrate verified beat.
7. **2:00** click "Mission Control" in the top bar → back to overview.
8. **2:30** stop talking; let the persistent footer hold the room for two beats.

## What To Say For Each State (one-liners)

- `POSSIBLE_SPOOF`: "Marker pattern present, HMAC failed. Suspicious, not actionable."
- `SIGNATURE_CORRUPTED`: "Marker bytes present, too noisy to verify. Operator reviews."
- `UNKNOWN_NEEDS_REVIEW`: "No marker. Unknown is not foe."
- `LIKELY_FRIENDLY`: "Marker valid, supporting signals missing. We refuse to promote — false-friendly is the worst error."
- `FRIENDLY_VERIFIED`: "All seven signals pass. Aid only."

## 30-Second Emergency Version

"BlueMark FPV is software-only friendly-IFF for cheap analog FPV drones. Five live feeds, sorted by severity. \[click FEED-E\] Spoof — HMAC failed. \[click FEED-A\] Verified — all seven signals pass. Every state on the dashboard says: Identification aid only. Human decision required. We never label foe. Edge-on-edge, no cloud, zero added hardware on the drone."

## Closing Sentence (if you only get one)

"The value is clearer human deconfliction at the tactical edge — running entirely on hardware already in the field, in the austere, EW-contested, disconnected environments where IFF actually has to work."

## What changed vs the prior version of this script

- **Walk order reversed**: severity-sorted (E→A) instead of feed-id-sorted (A→E). The default sort, and the dramatically stronger arc.
- **Opens on MissionOverview** instead of jumping straight to a feed — the state-distribution bar + manifest cross-check + tactical map are the strongest opening assets.
- **Per-feed beat narrates from the signal trace** (PASS/FAIL/MISSING for all 7 signals), which is the v3 dashboard's richest surface.
- **YOLO/ML claim cut and inverted** — the prior FEED-A line claimed "real visual classifier"; the new version honestly explains the cut as a safety architecture decision (matches `docs/judge_faq.md` Q6).
- **Click "Mission Control" button** to return to overview before the close — uses Arpit's nav UX as a built-in pacing beat.
