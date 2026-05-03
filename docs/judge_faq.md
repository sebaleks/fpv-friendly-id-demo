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
