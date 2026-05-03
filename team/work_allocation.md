# BlueMark FPV Work Allocation

> **Updated 2026-05-03 (post-implementation push).** Original first-3-tasks lists are mostly done — see "Current state" notes per teammate below. The role definitions still hold.

Team assistant folders:

- `team/sebastian/` - Sebastian
- `team/arpit/` - Arpit
- `team/nicholas/` - Nicholas
- `team/birger/` - Birger

## Sebastian

- Assigned role: Project coordinator, demo integrator, pitch lead.
- Why this fits: Sebastian has the most available time, is comfortable with Python and data science, and should keep integration decisions coherent. Has GPU access for ML stretch work.
- Primary responsibilities: Pitch slides + narration, integration coordination, demo flow, final judging Q&A.
- Owns: `README.md`, `HANDOFF.md`, `docs/`, `team/work_allocation.md`, `team/sebastian/`.
- Avoid unless coordinated: Deep frontend changes, teammate-owned suggestion files.
- **Current state (2026-05-03):**
  - ✅ Demo planning docs (`docs/demo_plan.md`, `demo_script.md`, `acceptance_checklist.md`, `dashboard_states.md`).
  - ✅ Cost-tier framing (`docs/cost_tiers.md`).
  - ⏳ Pitch slides reflecting the steganographic / VBI framing (see `docs/steganographic_iff.md`) and the watermark-as-deployed-practice insight from Birger.
  - ⏳ Optional ML stretch: wire real ONNX inference into `scripts/run_visual_classifier.py` (recommended: pretrained `doguilmak/Drone-Detection-YOLOv8x`). Demo runs without this — simulated values fall through.
  - ⏳ End-to-end demo rehearsal.

## Arpit

- Assigned role: Frontend / dashboard / app architecture.
- Why this fits: Deep engineering experience, strong frontend background, expert Git comfort.
- Primary responsibilities: Dashboard UX, state display, frontend/backend interface shape.
- Owns: `team/arpit/`, the React dashboard in `dashboard/` (Nicholas scaffolded it; Arpit is the long-term owner).
- Avoid unless coordinated: Reframing the mission/pitch, changing detector behavior, editing Sebastian coordination docs.
- **Current state (2026-05-03):**
  - ✅ Dashboard scaffolded (`dashboard/` — React + Vite + TS, fetches `feeds.json`, renders 5 cards).
  - ✅ Detector → dashboard contract (Pydantic schemas in `src/bluemark/schemas.py` mirrored in TS at `dashboard/src/types.ts`).
  - ✅ Git workflow live (`CONTEXT.md` + `.githooks/` + per-author changelogs).
  - ⏳ Optional polish: animations, "no signal" tile for the ~50% feed-throughput scenario Birger flagged, custom styling. Demo works as-is.

## Nicholas

- Assigned role: Detection / simulation / technical-prototype lead.
- Why this fits: ML / data science / image denoising / Python / hackathon experience.
- Primary responsibilities: Marker detection approach, fusion logic, status/confidence rules, technical feasibility, SME question coordination.
- Owns: `team/nicholas/`, `src/bluemark/`, `tests/`, `scripts/`, demo asset stubs.
- Avoid unless coordinated: Major dashboard UX decisions, final pitch language, broad repo restructuring.
- **Current state (2026-05-03):**
  - ✅ HMAC marker verifier (`src/bluemark/marker.py`).
  - ✅ 5-state fusion logic (`src/bluemark/fusion.py`).
  - ✅ Pydantic schemas (`src/bluemark/schemas.py`).
  - ✅ pytest coverage 12/12 (`tests/test_fusion.py`).
  - ✅ Demo asset stubs (`demo_assets/mission_manifest.json`, `session_log.json`, `visual_profile_overrides.json`).
  - ✅ `scripts/generate_feeds.py` + `scripts/run_visual_classifier.py` stub.
  - ✅ `docs/fusion_architecture.md` + `docs/steganographic_iff.md`.
  - ✅ Onboarding artifact (`team/nicholas/onboarding.md`).
  - ✅ SME question list for Birger (`team/nicholas/birger_email_questions.md`).
  - ⏳ NICK-004: technical risk register + fallback plan. Open in PF.

## Birger

- Assigned role: Domain SME / pitch reviewer.
- Why this fits: Limited coding time, but has the operational domain knowledge to keep the demo credible.
- Primary responsibilities: Review problem framing, validate domain language, advise on operator concerns, support Q&A.
- Owns: `team/birger/`.
- Avoid unless coordinated: Source code, dependency changes, detector implementation, frontend implementation.
- **Current state (2026-05-03):**
  - ✅ All 9 SME questions answered (`team/nicholas/birger_responses_2026-05-03.md`). Q5 corrected the pitch — earlier "friendly feeds already watermarked operationally" claim was the concept paper, not field observation. New framing: VBI/covert-watermarking/IFF are decades-old proven prior art; the *combination* applied to live FPV analog video on a flight controller for real-time IFF at zero hardware cost is unaddressed publicly. Q7 added: optimize for minimum false-friendly. Q2 confirmed: visual classifier is truly optional.
  - ⏳ Optional: drop any prior fiber/acoustic/EW-operations notes into `team/birger/` if convenient.

## Shared interfaces

- Detector → dashboard: `FusionResult { feed_id, state, confidence, signals_used, reason }` per `src/bluemark/schemas.py`. TS mirror in `dashboard/src/types.ts`.
- Demo assets → fusion: `mission_manifest.json`, `session_log.json`, `visual_profile_overrides.json` consumed by `scripts/generate_feeds.py`.
- Per-author updates: `team/<name>/changelog.md`. See `CONTEXT.md` for the partitioned write-surface convention.
- Safety review: all public-facing language must keep the project as a non-lethal identification aid; no autonomous engagement; never label "foe."
