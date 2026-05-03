# Handoff Log

Use this file to keep the team coordinated during the hackathon.

## Current Status (post-implementation push, 2026-05-03)

**Submitted to:** Natsec Hackathon Problem Statement 2 — *Edge Deployments and Drone Operation*. Pitch leads with edge-on-edge framing (drone-side STM32 marker generation + backpack-portable receiver detection, no cloud, software-only).


- ✅ Cross-agent context sync workflow live (`CONTEXT.md` + `.githooks/`).
- ✅ Sebastian demo planning docs done (`docs/demo_plan.md`, `demo_script.md`, `acceptance_checklist.md`, `dashboard_states.md`, `cost_tiers.md`).
- ✅ Architecture locks: Problem A (drone marks own video, ground EW reads, human decides), human-in-loop hard event constraint, 5-state taxonomy, risk-zone dropped.
- ✅ **Implementation shipped:** Python core (`src/bluemark/` — HMAC marker + 5-state fusion + Pydantic schemas); React + Vite + TS dashboard (`dashboard/`); pytest 12/12 passing; `feeds.json` covers all 5 states.
- ✅ ML model side: real ONNX YOLOv8n inference shipped (Sebastian, `scripts/run_visual_classifier.py`, ~24ms CPU); **deliberately cut from the live demo path** per NICK-015 (Birger Q2: no classifier needed; safety invariant gates known_friendly_*; no real-FPV evals). Code stays as Q&A ammunition (`docs/judge_faq.md` Q6).
- ✅ **Steganographic framing adopted** (per Sebastian's "Steganographic IFF FPV" concept doc): production marker embeds in VBI lines 17–20 of NTSC analog video; demo simulates the receiver-side read via `feeds.json`. See `docs/steganographic_iff.md`.
- ✅ Birger SME questions: all answered as of 2026-05-03 — see `team/nicholas/birger_responses_2026-05-03.md`. **Pitch corrected:** earlier "deployed friendly watermarks" framing was based on the concept paper, not field observation. New (stronger) framing: VBI encoding + covert watermarking + cryptographic IFF are decades-old proven prior art; the *combination* on live FPV analog video, on a flight controller, for real-time IFF at zero hardware cost is novel.
- ✅ **Dashboard v3 (Arpit):** liquid-glass split-pane with Mission Control nav, signal-trace UI (PASS/FAIL/MISSING per signal), tactical map, mission overview with declared-friendlies + state distribution + recent transitions. Full vocabulary alignment with Python signal names (commit `3c41940`).
- ✅ **52-task QA swarm filed in PF (NICK-016..NICK-067):** P0 wave (NICK-016..NICK-023) closed; P1 wave in flight; P2 wave queued. Pitch slides intentionally **dropped** in favor of slide-free 3-min demo walk (Sebastian).
- ⏳ Demo rehearsal: not yet run end-to-end.
- ⏳ NICK-015 (real FPV frames + YOLO evals): post-hackathon polish, deadline 2026-05-10.

### 2026-05-02 15:01 - Codex

- Changed: Added per-drone cost tier framing and linked it from system architecture.
- Files: `docs/cost_tiers.md`, `docs/system_architecture.md`, `HANDOFF.md`, `team/sebastian/changelog.md`
- Assumptions: The hackathon pitch should lead with Tier 0 pure software and treat hardware as fallback.
- Open questions: None.
- Next step: Use `docs/cost_tiers.md` in pitch materials and architecture discussion.

### 2026-05-02 14:25 - Codex

- Changed: Added Sebastian-owned demo planning docs for plan, script, acceptance checklist, and dashboard state definitions.
- Files: `docs/demo_plan.md`, `docs/demo_script.md`, `docs/acceptance_checklist.md`, `docs/dashboard_states.md`, `HANDOFF.md`, `team/sebastian/changelog.md`
- Assumptions: Detector output may be live or scripted for fallback, but the operator workflow must remain identical.
- Open questions: None.
- Next step: Arpit should read `docs/dashboard_states.md` before dashboard work; Nicholas should read `docs/acceptance_checklist.md` before detector work.

### 2026-05-02 14:18 - Codex

- Changed: Added Codex post-pull instructions, created missing teammate changelogs, and enabled local `.githooks` with `git config core.hooksPath .githooks`.
- Files: `AGENTS.md`, `HANDOFF.md`, `team/sebastian/changelog.md`, `team/arpit/changelog.md`, `team/birger/changelog.md`
- Assumptions: `CONTEXT.md`, `CLAUDE.md`, `.githooks/post-merge`, `.githooks/post-checkout`, and `team/nicholas/changelog.md` came from the previous pull and should remain as-is.
- Open questions: None.
- Next step: Tell teammates to run `git config core.hooksPath .githooks` once after pulling and to have their agents read `CONTEXT.md` plus all changelogs.

### 2026-05-02 21:08 - Nicholas

- Changed: Added cross-agent context system to mitigate merge-conflicts on direct push to main. New `CONTEXT.md` (root, read-only prompt) tells each agent to re-read `team/*/changelog.md` after every pull. Each teammate's agent appends only to their own `team/<name>/changelog.md` — partitioned write surfaces means zero cross-author conflicts. `.githooks/post-merge` + `post-checkout` print a reminder banner; enable once per clone with `git config core.hooksPath .githooks`. `CLAUDE.md` added as Claude Code auto-load entry point.
- Files: `CONTEXT.md`, `CLAUDE.md`, `.githooks/post-merge`, `.githooks/post-checkout`, `team/nicholas/changelog.md`, `HANDOFF.md`
- Assumptions: Going forward, per-agent change logs land in `team/<name>/changelog.md`. `HANDOFF.md` remains Sebastian's coordination doc — he can decide whether to roll changelogs into it or let it be replaced.
- Open questions: Sebastian, do you want `HANDOFF.md`'s role to change, or stay as-is alongside the changelogs? Each teammate also needs to be told to run `git config core.hooksPath .githooks` once.
- Next step: Teammates enable the hooks; their AIs read `CONTEXT.md`. Nicholas moves to NICK-001 (marker/detector design).

### 2026-05-02 13:34 - Codex

- Changed: Added a concrete three-feed demo plan with script, MVP, stretch, safety, and fallback.
- Files: `docs/demo_plan.md`, `HANDOFF.md`
- Assumptions: The demo should prioritize the operator workflow even if live detection needs a scripted fallback.
- Open questions: None.
- Next step: Use `docs/demo_plan.md` to drive feature breakdown.

### 2026-05-02 13:30 - Codex

- Changed: Replaced incorrect placeholder teammate references with `arpit`, `nicholas`, and `birger`.
- Files: `team/work_allocation.md`, `team/arpit/suggestions.md`, `team/nicholas/suggestions.md`, `team/birger/suggestions.md`, `team/sebastian/suggestions.md`, `AGENTS.md`, `HANDOFF.md`
- Assumptions: Directory names should be lowercase to match existing team folders.
- Open questions: None.
- Next step: Use actual teammate directories for future coordination.

### 2026-05-02 13:28 - Codex

- Changed: Added division-of-labor plan and per-teammate AI assistant guidance.
- Files: `team/work_allocation.md`, `team/sebastian/suggestions.md`, `team/arpit/suggestions.md`, `team/nicholas/suggestions.md`, `team/birger/suggestions.md`, `AGENTS.md`, `HANDOFF.md`
- Assumptions: Team suggestions should use actual teammate directories.
- Open questions: Confirm whether placeholder directories should be renamed to actual teammate names.
- Next step: Teammates review their suggestions file before implementation starts.

### 2026-05-02 13:04 - Codex

- Changed: Added lightweight teammate interview system.
- Files: `team/interview_template.md`, `team/interview_results/README.md`, `HANDOFF.md`
- Assumptions: Birger should be described as a technical advisor, not a coder.
- Open questions: None.
- Next step: Teammates fill out interview result files.

## Log Template

### YYYY-MM-DD HH:MM - Name

- Changed:
- Files:
- Assumptions:
- Open questions:
- Next step:
