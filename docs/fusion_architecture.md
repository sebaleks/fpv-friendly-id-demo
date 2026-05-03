# Fusion Architecture

How BlueMark FPV combines multiple identification signals into one of the five dashboard states (`docs/dashboard_states.md`). All logic runs receiver-side; no drone-side AI hardware is required.

## Inputs

| Signal | Source | Required for MVP | Notes |
|---|---|---|---|
| `marker` | HMAC verifier on the OSD-style overlay extracted from the video frame | yes | Pass = HMAC valid + decoded (mission_id, timestamp). Fail = malformed / unverifiable. |
| `time_window` | Marker timestamp vs. current time | yes | Pass = inside `window_s` (default 10s) freshness window. Stale = outside. |
| `mission_match` | Decoded mission_id checked against `demo_assets/mission_manifest.json` | yes | Pass = mission_id is in the active manifest. |
| `visual_profile` | Receiver-side classifier (rule-based for MVP, ML in future) | optional | Score in [0,1]. Labels: `known_friendly_*`, `unknown_drone_like`, `background_or_noise`. **Never `foe`.** |
| `rc_session` | Cross-check against `demo_assets/session_log.json` (RC channel + pilot ID) | optional | Tier-1 metadata. Useful corroboration when present. |
| `rf_metadata` | RF/channel consistency | optional | Pitch-only for MVP; placeholder field. |

## Pipeline

```
                  ┌────────────────┐
   FPV frame ───▶ │ marker extract │ ─▶ marker bytes ─▶ HMAC verify ─▶ marker / time_window / mission_match
                  └────────────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │ visual classifier │ ─▶ visual_profile (score + label)
                  └────────────────┘
                          │
                          ▼
                  ┌────────────────┐
   manifest ────▶ │ session lookup │ ─▶ rc_session (optional)
                  └────────────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │  fuse_signals  │ ─▶ FusionResult { state, confidence, signals_used, reason }
                  └────────────────┘
                          │
                          ▼
                    dashboard card
```

## State mapping rules (v1, rule-based)

The fusion logic in `src/bluemark/fusion.py` evaluates signals in the order below. First matching rule wins.

| State | Required evidence |
|---|---|
| `POSSIBLE_SPOOF` | A marker candidate was extracted **and** any of: HMAC failed, timestamp outside window, mission_id not in manifest. *(Marker-like but failed verification — must escalate.)* |
| `SIGNATURE_CORRUPTED` | Marker candidate extracted **but** marker bytes were partial / could not be decoded. No HMAC pass/fail decision possible. |
| `FRIENDLY_VERIFIED` | `marker` passes + `time_window` fresh + `mission_match` true + at least one supporting signal (`visual_profile` ≥ 0.6 with a `known_friendly_*` label, or `rc_session` matches). |
| `LIKELY_FRIENDLY` | `marker` passes + `time_window` fresh + `mission_match` true, **but** no supporting signal corroborates. |
| `UNKNOWN_NEEDS_REVIEW` | No marker candidate found at all (or all extraction attempts produced no decodable bytes). **Unknown is not foe.** |

## Confidence calculation

`confidence` is a heuristic float in [0, 1]:

- `FRIENDLY_VERIFIED`: 0.85 + 0.05 × (number of corroborating supporting signals), capped at 0.97.
- `LIKELY_FRIENDLY`: 0.65.
- `UNKNOWN_NEEDS_REVIEW`: 0.20 (low confidence in the *friendly* call — not a hostile claim).
- `SIGNATURE_CORRUPTED`: 0.40.
- `POSSIBLE_SPOOF`: 0.10 friendly confidence (the spoof-flag is the signal; confidence here means "confidence this is friendly").

## Failure modes

| Failure | Effect | Mitigation |
|---|---|---|
| Marker extraction returns garbage on every frame | All feeds → `UNKNOWN_NEEDS_REVIEW` | Fallback: pre-baked `feeds.json` for the demo. |
| Mission manifest missing / wrong mission | All otherwise-valid feeds → `LIKELY_FRIENDLY` | Demo presenter shows the manifest path; manifest ships with the demo bundle. |
| HMAC secret leaked / shared | Spoof feeds may pass `FRIENDLY_VERIFIED` | Pitch-only concern: production needs key rotation + per-mission keys. |
| Visual classifier flags a friendly drone as `unknown_drone_like` | Demotion `FRIENDLY_VERIFIED` → `LIKELY_FRIENDLY` | Acceptable. Marker + manifest still anchor the call. |
| All signals tied | Tie-break to the lower-confidence state (favor human review) | Encoded in rule order above. |

## Human review path

Every state surfaces `Identification aid only. Human decision required.` The dashboard never recommends engagement, jamming, or any action. The operator decides. `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, and `POSSIBLE_SPOOF` are all "needs review" from the system's perspective; only `FRIENDLY_VERIFIED` says "the system is comfortable with the friendly call."

## Optimization target: minimum false-friendly (per Birger Q7)

The system optimizes for **minimum false-friendly classification rate.** A foe that gets `FRIENDLY_VERIFIED` is the worst possible error — it inverts the system's purpose. We'd rather mark a friendly as `UNKNOWN_NEEDS_REVIEW` than mark a foe as `FRIENDLY_VERIFIED`. The state-mapping rules above are biased this way: `FRIENDLY_VERIFIED` requires marker + freshness + mission match + at least one supporting signal; missing any one of those produces a less-confident state, never a stronger one.

## What this doesn't do (explicit)

- No "foe" label is ever produced. Anything not known-friendly is `UNKNOWN_NEEDS_REVIEW`.
- No autonomous engagement / jamming / targeting recommendations.
- No risk-zone modulation (dropped from MVP; see `team/nicholas/meeting_2026-05-02.md` for history).
- No drone-side decision-making — all fusion runs receiver-side.

## Visual classifier — pretrained ONNX (no fine-tuning, truly optional)

**Per Birger (2026-05-03, Q2):** *"We do not have to make a classifier on the drone detector — only a piece of code that sees the watermark in friendly, but not foe, intercepter video."* So the visual classifier is **truly optional** for the MVP. Marker + freshness + manifest is the load-bearing path.

If wired anyway: `visual_profile` accepts a real model's output via `scripts/run_visual_classifier.py`. The recommended path is **off-the-shelf** [`doguilmak/Drone-Detection-YOLOv8x`](https://huggingface.co/doguilmak/Drone-Detection-YOLOv8x) exported to ONNX via Ultralytics, run on CPU with `onnxruntime`. No training, no labeled dataset, no GPU required.

The script writes `demo_assets/visual_profile_overrides.json` (one entry per feed). `scripts/generate_feeds.py` prefers that file over simulated values when present. If the script is not run, simulated values are used and the demo flow is unchanged.

**Mapping convention.** A pretrained drone-detection YOLO labels every drone as just "drone." We map detections to `unknown_drone_like` by default; the `known_friendly_*` labels come from a hand-curated `demo_assets/friendly_overrides.json` (per-feed) that says "in this clip the drone authenticated by the marker is FPV-class." This is honest — the HMAC marker is the authoritative friendly signal; the visual classifier is supporting evidence, allowed to be coarse.

## Future extensions (pitch only)

- Fine-tuning a YOLO classifier on `known_friendly_*` labels with a real curated dataset (Sebastian has GPU access) — strictly stretch.
- Audio cue (acoustic spectral signature) as additional supporting signal when available.
- Seismic / RF cues as future passive corroboration.
- Mesh / drone-to-drone marker exchange when comms permit.
