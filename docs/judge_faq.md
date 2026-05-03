# Judge Q&A — 1-Pager

> Defensive, neutral, safety-forward. Sourced from `team/nicholas/birger_responses_2026-05-03.md` (Birger SME), `team/nicholas/risk_register.md` (NICK-004), and `AGENTS.md` safety boundary. Every answer respects: human-in-loop is a *hard event constraint*, never an autonomous decision, never label "foe".

## Q1 — What's actually novel here? VBI watermarking and HMAC are old.

Correct, and we say so on stage. Per Birger's SME pass (Q5), VBI watermarking, IFF, and covert authentication are decades-proven prior art — separately. The unaddressed-publicly contribution is the *combination*: applied to **live FPV analog video**, generated on the **drone's existing STM32 flight controller**, for **real-time friendly-IFF at zero added hardware cost**. The earlier framing of "friendly feeds already watermarked operationally" was the concept-paper claim, not a field observation; we corrected it and now lead with the combination story.

## Q2 — How do you minimize false-friendlies? A foe wearing a stolen marker is the worst case.

We optimize for **minimum false-friendly classification rate** (Birger Q7). `FRIENDLY_VERIFIED` requires four conditions: valid HMAC, freshness window, mission match, *and* at least one supporting signal (RC session, visual profile, telemetry). Missing any one drops the feed to `LIKELY_FRIENDLY` — which is deliberately *not* the same green as verified. A spoofed marker without freshness or supporting signals lands on `POSSIBLE_SPOOF`, not on the verified path. The state ordering is biased so that errors fail toward "operator must review," never toward "verified friendly."

## Q3 — Why FPV / analog / VBI specifically? Why not digital IFF?

FPV drones are the most numerous platforms in the conflict and the ones least served by traditional IFF — they're cheap, single-use, analog-video, no spare bandwidth, no spare hardware budget. VBI lines are unrendered by the receiver display, so the marker is invisible to the pilot and to anyone watching the picture, and it costs zero pixels of useful video. Digital IFF transponders are a non-starter at this price point and form factor; analog VBI is the only place a marker can live without competing with the mission payload.

## Q4 — What fails gracefully? What happens when the demo or the field system breaks?

NICK-004 risk register lists the failure modes and fallbacks. Marker bytes degraded → `SIGNATURE_CORRUPTED` (operator review). No marker → `UNKNOWN_NEEDS_REVIEW` (operator review — *unknown is not foe*). Receiver compute degraded → marker verification still runs (HMAC is cheap); supporting signals drop, so worst case feed lands at `LIKELY_FRIENDLY` instead of `FRIENDLY_VERIFIED`. Live demo failure → scripted detector mode renders the same `feeds.json` shape from `demo_assets/`. No path leads to autonomous engagement; every degradation lands on operator review.

## Q5 — Is this targeting? Is this a kill chain?

No. By hard event constraint and by design: the system is an **identification aid only**. Every dashboard card, every state, every fallback path carries the same footer: *Identification aid only. Human decision required.* The system never recommends engagement; the operator decides. We never label any feed "foe" — the complement of friendly-verified is *not-confirmed-friendly*, never hostile. Production deployment would still require integration testing, secure key management, validation under analog-video degradation, and operator training — none of which is in scope for a hackathon proof-of-concept.

## Q6 — Did you build any ML? Why isn't it on the demo path?

Yes — pretrained YOLOv8n via ONNX Runtime CPU is shipped in `scripts/run_visual_classifier.py`. We **deliberately cut it from the live demo path** for three reasons. (1) Birger's SME review (Q2) was explicit: *"We do not have to make a classifier on the drone detector — only a piece of code that sees the watermark in friendly, but not foe, intercepter video."* (2) The model is **gated by a safety invariant** (`_resolve_label()`): `known_friendly_*` labels can never be derived from YOLO output — only from a hand-labeled human review of the HMAC-authenticated marker. So in practice the model contributes nothing to the `FRIENDLY_VERIFIED` decision; the cryptographic marker is authoritative. (3) The model has **no evals on real FPV footage** yet — that's tracked as a follow-up (acquire real frames + measure FP/FN rate). On a slide-free 3-min demo, putting unverified ML on stage is risk without insight. The code stays in the repo; the safety architecture is the talking point — *responsible AI by construction*, not by aspiration.
