# Acceptance Checklist

## Repo Readiness

- [ ] `README.md`, `AGENTS.md`, `CONTEXT.md`, and `HANDOFF.md` are current.
- [ ] `docs/demo_plan.md`, `docs/demo_script.md`, and `docs/dashboard_states.md` match.
- [ ] Team ownership files and changelogs exist.
- [ ] No secrets or `.env` files are committed.

## Data/Demo Assets

- [x] Feed assets exist (FEED-A through FEED-E) — `dashboard/public/feeds.json` regenerates via `python scripts/generate_feeds.py` from `demo_assets/{mission_manifest,session_log,visual_profile_overrides}.json`.
- [x] Assets are simulated or benign (no real key material; see `src/bluemark/marker.py`).

## Marker

- [ ] Friendly marker is small and OSD-like.
- [ ] Marker is visible enough for the demo.
- [ ] Marker has a clear valid versus invalid concept.
- [ ] No real key material is used.

## Degradation

- [ ] Feed C shows visible noise, corruption, or partial marker loss.
- [ ] Degradation does not make the demo unreadable.
- [ ] Signal quality value reflects degradation.

## Detector

- [x] FEED-A resolves to `FRIENDLY_VERIFIED`.
- [x] FEED-B resolves to `LIKELY_FRIENDLY`.
- [x] FEED-C resolves to `UNKNOWN_NEEDS_REVIEW`.
- [x] FEED-D resolves to `SIGNATURE_CORRUPTED`.
- [x] FEED-E resolves to `POSSIBLE_SPOOF`.
- [x] Scripted detector path **is** the demo path — `scripts/generate_feeds.py` produces `dashboard/public/feeds.json`, dashboard reads it; there is no separate live detector. If `feeds.json` is missing/corrupted at demo time, recovery is one command (`python scripts/generate_feeds.py`) or restore from git (`git checkout HEAD -- dashboard/public/feeds.json`). See `docs/demo_plan.md` §"Fallback Plan If Live Detection Fails".
- [x] pytest 12/12 passing.

## Dashboard

- [x] Five feed cards display at once (one per state: FRIENDLY_VERIFIED, LIKELY_FRIENDLY, UNKNOWN_NEEDS_REVIEW, SIGNATURE_CORRUPTED, POSSIBLE_SPOOF).
- [x] Each feed shows state, confidence, and signals_used.
- [x] Every state shows `Identification aid only. Human decision required.` (verified in `dashboard/src/App.tsx` global footer + `dashboard/src/components/FeedDetail.tsx` + `dashboard/src/components/MissionOverview.tsx`; `FeedCard.tsx` was deleted in commit `9aea062` when the dashboard split-pane refactor landed).
- [ ] Labels are readable from demo distance.
- [x] No UI copy implies autonomous action.

## Demo (no pitch slides)

- [x] Problem statement is clear in one sentence.
- [x] Demo can be narrated in three minutes (no slides — see `docs/demo_script.md`).
- [x] Safety framing is explicit (human-in-loop is a hard event constraint, not preferred).
- [x] Production caveats are stated: integration, testing, key management, and real-world validation.
- [x] Judge Q&A 1-pager available at `docs/judge_faq.md`.

## Safety Language Audit

- [ ] No "unknown = foe" language anywhere in repo (`grep -ri "unknown.*foe\|treat.*as foe" docs/ src/ team/` is empty).
- [ ] No autonomous-engagement language anywhere (`grep -ri "shoot.*down\|engage.*drone" docs/ src/ team/` returns only safety-boundary disclaimers).
- [ ] Risk-zone "shoot it down" framing has been fully scrubbed (replaced with attention-bias semantics, then dropped from MVP).

## Hardware

- [ ] MVP runs without Raspberry Pi AI Camera (receiver-side AI on a laptop is sufficient).
- [ ] Optional hardware tiers stay under their stated cost constraint (`docs/cost_tiers.md`).
- [x] No claim that Tier 3 hardware is procurable on the Ukrainian front without verification — Birger Q3 (`team/nicholas/birger_responses_2026-05-03.md`) confirmed: receivers are EW scanners with sufficient compute; the dashboard pitch targets laptop-class hardware that EW teams already carry. Pi/Pi-AI-Camera availability is tracked separately as NICK-006 Q13.

## Live Demo Fallback

- [ ] Scripted detector mode exists or can be triggered.
- [ ] Presenter knows the fallback line.
- [ ] Fixed status/confidence/signal values are prepared.
- [ ] Demo still shows all three operator decisions.

## Demo Is Ready When

- [ ] A teammate can run the demo without Sebastian debugging live.
- [ ] The audience sees the three-feed story immediately.
- [ ] The dashboard states match `docs/dashboard_states.md`.
- [ ] The safety warning is always visible.
- [ ] The fallback path has been rehearsed once.
