# Sebastian's Agent Changelog

Append new entries at the **top** (newest first). Format defined in `CONTEXT.md`. Only Sebastian's agent writes here.

### 2026-05-03 20:50 - Sebastian (via Claude Code)

- Changed: Updated `docs/demo_script.md` for `NO_SIGNAL` state landing in `2cdb559`/`0b7747e`. Mission manifest now declares 9 friendlies (A–I); only 5 (A–E) have feeds; dashboard synthesizes 4 NO_SIGNAL placeholders. Script now opens with "Nine declared, five with live signal, four lost" — turns the manifest cross-check beat from speculative to literal (operator can see the lost-signal rows on screen). Compensated by trimming redundant phrasing in the architecture sentence and the FEED-D+C combined beat. Lands at 3:11 with click overhead at 165 wpm.
- Files: `docs/demo_script.md`, `team/sebastian/changelog.md`.
- Why: The team shipped the operational scenario the user just asked the script to surface — manifest cross-check now has visible drama (4 missing rows) instead of "5/5 seen, nothing to see." Worth the words.
- Assumptions: Mission manifest will continue declaring more friendlies than feeds.json contains; if Nicholas tightens it back to 5/5 the "four lost" line breaks. Demo-locked tag is on `2cdb559`; this script change is post-lock and demo-day-only.
- Open questions: None blocking.
- Next step: Read-aloud rehearsal against a stopwatch (PF P0).

### 2026-05-03 20:25 - Sebastian (via Claude Code)

- Changed: Restructured `docs/demo_script.md` to Sebastian's four-part outline: (1) background + US Army relevance 0:00-0:25, (2) problem statement 0:25-0:40, (3) solution + demo deep-dive 0:40-2:40, (4) scalability/cost/margin 2:40-3:00. Added operational-features mini-beat inside Part 3 (2:20-2:40) covering: TacticalMap coordinates for prioritizing unknowns/spoofs near sensitive assets, manifest cross-check for missing-but-expected drones, recent-transitions log for temporal context. Cost beat names the dollar-per-drone × 7M-drone math = $7M peer-fight program, "one prevented friendly-fire incident pays for the entire deployment."
- Files: `docs/demo_script.md`, `team/sebastian/changelog.md`.
- Why: Original v3 script had no opening hook, didn't surface US Army relevance, buried operational features, and didn't make the cost/margin case explicit. Sebastian's outline fixes all four.
- Assumptions: 165 wpm conversational pace; per-section breakdown lands inside user's target windows; total = 2:54 spoken + 10s click overhead = 3:04 (within rehearsal-tightening distance of clean 3:00). US Army FPV-units-stood-up-2024 fact is sourced from public Army announcements (verifiable; if challenged, soften to "the US Army is following Ukraine's adoption curve").
- Open questions: None blocking. Recovery patter section is in the script; operator can fall back to the 30-second emergency version if the dashboard breaks mid-demo.
- Next step: Read-aloud rehearsal against a stopwatch (PF P0). If consistently overshooting, the FEED-D+FEED-C combined beat is the cheapest cut.

### 2026-05-03 19:50 - Sebastian (via Claude Code)

- Changed: Reconciled `docs/demo_script.md` against Arpit's v3 dashboard (split-pane + MissionOverview + TacticalMap + signal trace) and Nicholas's YOLO-cut decision (`7aa524b`). New script: severity-sorted walk **E→A** (not A→E — opposite direction; the default sort + dramatically stronger arc), opens on MissionOverview, narrates per-feed from the signal trace (PASS/FAIL/MISSING for all 7 signals), folds in the honest "we built it, gated it, cut it" ML talking point per `judge_faq.md` Q6, returns to Mission Control before the close. Word count cut 564 → 503 to fit 3:00 budget (lands at 3:00 at 180 wpm / 3:15 at 165 wpm + 13s click overhead).
- Files: `docs/demo_script.md`, `team/sebastian/changelog.md`. PF: T8 (re-validate script against v3 dashboard) marked complete; T1 demoted to P3 (real FPV still — only needed if reversing Nicholas's cut); T9 (wire classifier_log.json) cancelled (no surface to wire into per Nicholas's cut).
- Why: Three commits since the script was last touched changed the dashboard significantly (`9aea062` v3 split-pane, `d3129de` liquid-glass + TacticalMap, `1417df5` P0 QA fixes). Script referenced "5 cards in a grid" and "left-to-right A→E" — neither exists in v3. Also referenced "real visual classifier" on FEED-A — Nicholas cut that path; script needed to invert to the safety-architecture talking point.
- Assumptions: Severity sort stays the default (Arpit's choice in App.tsx). MissionOverview's manifest cross-check uses `dashboard/public/mission_manifest.json` which currently lists all 5 feeds — drama is muted but honesty wins (no fake "missing" entries). 180 wpm pace is achievable; if delivery drifts to 165 wpm the demo lands at 3:15 — flag if hard 3:00 ceiling.
- Open questions: Should `mission_manifest.json` list a SUBSET (3 of 5) so the cross-check shows visible "not seen" rows? That'd be a Nicholas/generate_feeds.py change; small but pitch-strengthening. Punt unless asked.
- Next step: Read-aloud rehearsal against a stopwatch (PF P0, only-you task). Drop a real FPV still only if reversing the YOLO cut (P3, optional).

### 2026-05-03 04:35 - Sebastian (via Claude Code)

- Changed: Shipped the model side of T5 (real ONNX YOLOv8n integration). `scripts/run_visual_classifier.py` is now real: loads `weights/yolov8n.onnx` via onnxruntime CPU provider, runs per-feed inference on `demo_assets/sample_frames/<feed_id>.jpg`, writes `demo_assets/visual_profile_overrides.json` (existing contract, unchanged downstream) plus a new `demo_assets/classifier_log.json` (per-frame raw + final label + rationale + latency — the file Arpit's dashboard surface will read once he lands on a shape). 24 ms post-warmup inference on CPU. Graceful fallback when weights or frames missing. Safety invariant enforced in `_resolve_label()`: YOLO output **never** derives `known_friendly_*`; only the hand-labeled `demo_assets/friendly_overrides.json` may promote a feed to that label.
- Files: `scripts/run_visual_classifier.py`, `demo_assets/friendly_overrides.json` (new), `demo_assets/sample_frames/README.md` (new), `demo_assets/sample_frames/placeholder.png` (new — synthetic smoke-test frame), `demo_assets/visual_profile_overrides.json` (regenerated), `dashboard/public/feeds.json` (regenerated), `.gitignore` (added `weights/`, `demo_assets/sample_frames/*.jpg|jpeg|png` except placeholder, `demo_assets/classifier_log.json`), `team/sebastian/changelog.md`.
- Why: Stretch task T5 (PF) was greenlit. Path B (live inference as failure-demo). Model side ships independently of Arpit's dashboard surface so we don't block on coordination.
- Assumptions: YOLOv8n picked over YOLOv8x for stage safety (12 MB ONNX, 24 ms CPU vs 150 MB / multi-second first-run). Synthetic placeholder frame ships in-tree; real FPV frames stay gitignored. `classifier_log.json` shape is a proposal — Arpit can rename fields when he integrates.
- Open questions: **Still waiting on Arpit** for the three coordination questions in the previous changelog entry (read `bd5f45e`). Specifically: shape of the dashboard read, whether he wants a new `FusionResult` field or a separate fetch.
- Next step: Arpit picks dashboard shape → tiny edit to `FeedCard.tsx` → live demo beat works end-to-end. Independently: drop a real FPV still at `demo_assets/sample_frames/feed_a.jpg` before stage time (the synthetic placeholder produces meaningless YOLO classes — pipeline works, demo credibility doesn't).

### 2026-05-03 04:05 - Sebastian (via Claude Code)

- Changed: Coordination ask for Arpit — heads-up before any `dashboard/` edits. Stretch task T5 (real ONNX YOLO via `scripts/run_visual_classifier.py`) is greenlit. Plan is **Path B**: live inference *as a failure demo* at the front of the 3-min walk (run pretrained YOLOv8n on a FEED-A sample frame on stage, show it labels `unknown_drone_like`, use that to motivate why the HMAC marker is load-bearing — Birger Q5 prior-art-delta gets reinforced by a visible vision failure). Demo stays at 3:00 by tightening intro / FEED-D / close.
- Files: `team/sebastian/changelog.md` (this file). No code yet.
- Why: Path B requires a small visible touch to `dashboard/` — likely a "Last classified: \<label\> (\<score\>)" line or a small "Run classifier" affordance on FEED-A so the live inference has a target the audience can see. `dashboard/` is Arpit-owned per `team/work_allocation.md`. Posting before touching, per `CONTEXT.md` ("If the work you're doing requires editing a file outside your write surface, stop and ask the owner first").
- Assumptions: YOLOv8n (~6 MB, ~0.1-0.3s CPU inference) over YOLOv8x (~150 MB, multi-second first-run) — safer for live stage. Pretrained, no fine-tuning. Output stays inside the existing visual_profile contract (`docs/fusion_architecture.md`). No fusion-logic changes; `scripts/generate_feeds.py` already prefers `demo_assets/visual_profile_overrides.json` when present.
- Open questions: **For Arpit** — (1) OK to add a small read-only "last classifier output" line to `FeedCard.tsx`, or would you rather own the implementation and I just ship the script + JSON? (2) If you want to own it, what shape do you want for the input — a new field on `FusionResult`, or a separate `classifier.json` the dashboard fetches? (3) Any objection to the live-inference beat being on FEED-A specifically?
- Next step: Wait for Arpit's read on the dashboard surface. In parallel, I can ship the model side (script + weights download path + `visual_profile_overrides.json` writer + sample-frame slot at `demo_assets/sample_frames/`) — that work doesn't touch `dashboard/`.

### 2026-05-03 03:25 - Sebastian (via Claude Code)

- Changed: Dropped pitch slides per Sebastian's call. Executed end-to-end demo (3-min target, no slides) and shipped the judge Q&A 1-pager. Rewrote `docs/demo_script.md` for 3:00 × 5-state walk (FRIENDLY_VERIFIED → LIKELY_FRIENDLY → UNKNOWN_NEEDS_REVIEW → SIGNATURE_CORRUPTED → POSSIBLE_SPOOF). Wrote `docs/judge_faq.md` (5 Q&As, safety-reviewed against AGENTS.md). Refreshed `docs/acceptance_checklist.md` for the 5-feed model and ticked verified items. Verified pipeline: `python scripts/generate_feeds.py` produces all 5 states; `dashboard/` builds + serves on :5174 with the persistent "Identification aid only. Human decision required." footer; pytest 12/12.
- Files: `docs/demo_script.md`, `docs/judge_faq.md` (new), `docs/acceptance_checklist.md`, `team/sebastian/changelog.md`.
- Why: Sebastian instructed: no pitch slides, demo must be 3 minutes, complete the tasks. Old script targeted 2 min × 3 feeds and pre-dated the 5-state model.
- Assumptions: `LIKELY_FRIENDLY` belongs in the live walk (it's the load-bearing state for false-friendly minimization, Birger Q7). 3:00 is read-aloud target, not hard ceiling.
- Open questions: Stretch ML (T5 / P3) left open — skip-or-do at Sebastian's discretion; demo is complete without it.
- Next step: One full read-aloud rehearsal against the new script with a stopwatch; teammates can `git pull` and inspect `docs/demo_script.md` + `docs/judge_faq.md`.

### 2026-05-03 02:59 - Sebastian (via Claude Code)

- Changed: Re-synced after the 2026-05-03 push (steganographic IFF reframing, Birger SME final-pass, NICK-004 risk register, Wokwi firmware sim, Natsec PS2 framing lock, Wokwi cross-language verifier). Created BlueMark FPV project + 5 parent tasks + 11 subtasks in Priority Forge against the post-implementation outstanding list.
- Files: `team/sebastian/changelog.md` (this file). PF project id `f6c98d87-c1b5-48a5-bfd3-f2b48dd780c9`.
- Why: Sebastian's changelog had not caught up to the 2026-05-03 work, and the four remaining owner items (pitch slides, demo rehearsal, judging Q&A FAQ, optional ML stretch) needed a tracked priority order before integration push.
- Assumptions: Pitch slides, end-to-end rehearsal, and judge FAQ are P0/P1; ONNX YOLO stretch stays P3 per Birger Q2.
- Open questions: None new — Birger Q5 prior-art reframing is the load-bearing pitch fact.
- Next step: Execute PF top-priority — start the rehearsal pass (`scripts/generate_feeds.py` → dashboard renders 5 cards → walk acceptance_checklist.md → time narration), in parallel with outlining the deck.

### 2026-05-02 15:01 - Sebastian (via Codex)

- Changed: Added per-drone cost tiers and linked the software-first cost framing from system architecture.
- Files: `docs/cost_tiers.md`, `docs/system_architecture.md`, `HANDOFF.md`, `team/sebastian/changelog.md`
- Why: The pitch needs a clear scaling story that leads with Tier 0 near-zero marginal drone cost.
- Assumptions: Hardware tiers are future integration paths, not implementation tasks for the hackathon MVP.
- Open questions: None.
- Next step: Reference `docs/cost_tiers.md` when preparing slides or judge answers.

### 2026-05-02 14:25 - Sebastian (via Codex)

- Changed: Created concise Sebastian-owned demo planning docs: demo plan, live narration, acceptance checklist, and dashboard state definitions.
- Files: `docs/demo_plan.md`, `docs/demo_script.md`, `docs/acceptance_checklist.md`, `docs/dashboard_states.md`, `HANDOFF.md`, `team/sebastian/changelog.md`
- Why: The team needs concrete MVP acceptance criteria and a shared live-demo story before implementation.
- Assumptions: Scripted detector output is acceptable as a fallback if live detection fails.
- Open questions: None.
- Next step: Arpit aligns dashboard UI to `docs/dashboard_states.md`; Nicholas aligns detector outputs to `docs/acceptance_checklist.md`.

### 2026-05-02 14:21 - Sebastian (via Codex)

- Changed: Expanded Sebastian's assistant instructions with integrator role, MVP focus, dashboard state definitions, live-demo checklist expectations, and fallback-demo ownership.
- Files: `team/sebastian/suggestions.md`, `team/sebastian/changelog.md`
- Why: Sebastian's AI assistant needs a sharper project-integrator charter before implementation work begins.
- Assumptions: No implementation should be started from this edit.
- Open questions: None.
- Next step: Use this charter when creating integration checklists and demo acceptance criteria.

### 2026-05-02 14:18 - Sebastian (via Codex)

- Changed: Performed the manual first-pass sync after the context-system pull; enabled the local hooks opt-in and added Codex-facing post-pull instructions.
- Files: `AGENTS.md`, `HANDOFF.md`, `team/sebastian/changelog.md`, `team/arpit/changelog.md`, `team/birger/changelog.md`
- Why: The pull happened before this context flow was inspected, so the repo needed to be brought into the agreed post-pull workflow.
- Assumptions: `CONTEXT.md` remains the source of truth and should not be edited during this pass.
- Open questions: None.
- Next step: Each teammate reads `CONTEXT.md` and all `team/*/changelog.md` after future pulls.
