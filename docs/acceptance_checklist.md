# Acceptance Checklist

## Repo Readiness

- [ ] `README.md`, `AGENTS.md`, `CONTEXT.md`, and `HANDOFF.md` are current.
- [ ] `docs/demo_plan.md`, `docs/demo_script.md`, and `docs/dashboard_states.md` match.
- [ ] Team ownership files and changelogs exist.
- [ ] No secrets or `.env` files are committed.

## Data/Demo Assets

- [ ] Feed A asset exists or can be generated.
- [ ] Feed B asset exists or can be generated.
- [ ] Feed C degraded asset exists or can be generated.
- [ ] Assets are simulated or benign.

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

- [ ] Feed A resolves to `FRIENDLY_VERIFIED`.
- [ ] Feed B resolves to `UNKNOWN`.
- [ ] Feed C resolves to `SIGNATURE_CORRUPTED`.
- [ ] Optional spoof example resolves to `POSSIBLE_SPOOF`.
- [ ] Scripted fallback results are ready.

## Dashboard

- [ ] Three feeds display at once.
- [ ] Each feed shows status, confidence, and signal quality.
- [ ] Every state shows `Identification aid only. Human decision required.`
- [ ] Labels are readable from demo distance.
- [ ] No UI copy implies autonomous action.

## Pitch

- [ ] Problem statement is clear in one sentence.
- [ ] Demo can be narrated in two minutes.
- [ ] Safety framing is explicit.
- [ ] Production caveats are stated: integration, testing, key management, and real-world validation.

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
