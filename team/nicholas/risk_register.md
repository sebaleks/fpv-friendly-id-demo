# BlueMark FPV — Technical Risk Register & Fallback Plan

Owner: Nicholas. Audience: presenter (likely Sebastian) + teammates rehearsing for judging on 2026-05-03.

Severity scale: **P0** = demo-breaking, **P1** = visible to judges but recoverable, **P2** = matters but won't sink the demo.
Likelihood: H / M / L based on what we've seen during the build.

---

## 1. Technical risks (build + runtime)

| # | Risk | Sev | Likelihood | Mitigation (now) | Fallback (during demo) |
|---|------|-----|------------|------------------|------------------------|
| T1 | **Fusion misclassification** — a feed lands in the wrong state (e.g. Feed C reads as `UNKNOWN_NEEDS_REVIEW` instead of `SIGNATURE_CORRUPTED`). Rule order in `src/bluemark/fusion.py` is sensitive; partial-marker vs no-marker is the most fragile boundary. | P1 | M | `tests/` covers all 5 states; rerun `pytest tests/` before demo. Generate `feeds.json` once, eyeball each state on the dashboard during rehearsal. Lock `feeds.json` in repo so it can't drift between rehearsal and demo. | Use the committed `dashboard/public/feeds.json` known-good fixture. Don't regenerate during the demo window. If a label still looks wrong on stage, narrate the dashboard state literally and move on — don't debug live. |
| T2 | **Dashboard render failure** — Vite dev server crashes, white screen, missing card, or React error boundary trips on a malformed feed. | P0 | L–M | Run `npm run build && npm run preview` against the production bundle once before demo (more stable than `npm run dev`). Pre-warm `http://localhost:5174` in the browser. Keep dev tools closed during demo to avoid HMR stalls. | Hard refresh (Cmd/Ctrl+Shift+R). If still broken, kill the Node process and run `npm run preview` from a second terminal already open. If still broken, fall to the static screenshot deck (see Fallback Playbook §B). |
| T3 | **Schema drift between Python and TypeScript** — `src/bluemark/schemas.py` (Pydantic) and the TS types the dashboard expects diverge after a last-minute edit; dashboard renders blank cards or throws on `signals_used`. | P0 | M | Freeze `schemas.py` and the TS interface today. Diff `feeds.json` against the TS types before demo (browser console will scream if a field is missing). Any schema change between now and demo requires both Python + TS edits in the same commit. | Revert the offending commit. The fixture `feeds.json` is the contract; if the live build breaks the contract, ship the previous build. |
| T4 | **ML inference failure when Sebastian wires real ONNX** — `scripts/run_visual_classifier.py` is currently a stub. If the real ONNX hookup lands tonight and `onnxruntime` fails on the demo laptop (missing wheel, model download failure, CPU AVX flag), `feeds.json` regeneration fails. | P1 | M | Keep the simulated path as the default. **Do not** depend on the ONNX path for the demo `feeds.json`. Commit a known-good `feeds.json` produced from the simulated path. Treat the ONNX run as a stretch artifact, not the demo feed. | Skip the ONNX-generated feed. Use the committed simulated `feeds.json`. The fusion/dashboard layers can't tell the difference — `visual_profile` is just a float either way. |
| T5 | **Missing `feeds.json`** — `dashboard/public/feeds.json` is absent, stale, or zero-byte at demo time (e.g. `.gitignore` swallowed it, or someone ran `npm run clean`). Dashboard fetches and gets 404 → empty UI. | P0 | L | Verify `feeds.json` is committed (not gitignored) and present at `dashboard/public/feeds.json`. Add a pre-flight grep: `ls -lh dashboard/public/feeds.json` in the rehearsal checklist. | Run `python scripts/generate_feeds.py` from a pre-opened terminal — recovery is one command and ~2 seconds. If the script also fails, restore from git: `git checkout HEAD -- dashboard/public/feeds.json`. |
| T6 | **HMAC verification edge case** — clock skew on the demo laptop pushes `time_window` outside the freshness window, dropping Feed A from `FRIENDLY_VERIFIED` → `POSSIBLE_SPOOF`. `feeds.json` is generated with `unix_ts = now()`, but if `now()` at generation and `now()` at fusion-eval differ by more than `window_s` (10s), this fires. | P1 | L | `generate_feeds.py` is run inside the dashboard load path with a fixed reference time, OR `feeds.json` is regenerated within seconds of demo. Increase `window_s` to 600s for the demo build if there's any chance of multi-minute delays. | Bump `window_s` and regen, or hand-edit the timestamp field in `feeds.json` to current epoch. |
| T7 | **Node/Python version mismatch on demo laptop** — presenter's machine has different Node or Python than the dev machine; `npm install` errors or `pydantic` import fails. | P1 | L | Pin Node ≥ 20 and Python ≥ 3.11 in `README.md`. Have presenter run the quick start once on their own laptop before demo. | Demo from Nicholas's or Sebastian's laptop. The fallback laptop is the laptop that has already rendered the dashboard once today. |
| T8 | **Feed asset missing** — visual previews (the FPV-style images) referenced by the dashboard cards 404. | P2 | L | Ensure `demo_assets/` previews are committed. Dashboard should fall back gracefully (placeholder div) — verify error boundary handles missing image. | Acceptable to demo with placeholder boxes; the fusion state labels are the load-bearing UX, not the imagery. Narrate around it. |

---

## 2. Demo-day operational risks

| # | Risk | Sev | Likelihood | Mitigation (now) | Fallback (during demo) |
|---|------|-----|------------|------------------|------------------------|
| O1 | **No internet / venue Wi-Fi flaky** — `npm install`, model downloads, or any CDN-loaded asset fails. | P0 | H | Demo path is fully offline once `npm install` has run once and `feeds.json` is committed. Verify the dashboard loads with Wi-Fi off during rehearsal. No CDN fonts; no remote images. | None needed if mitigation holds. If something does need the network, skip it — the core demo doesn't. |
| O2 | **Presenter unfamiliar with commands** — the person on stage forgets the command sequence (start dashboard, point browser, reset). | P1 | M | Pin the three commands in `docs/demo_script.md`. Stick a sticky-note version on the demo laptop. Two people rehearse the click path tonight. | Co-presenter from the team takes over the keyboard while the speaker keeps narrating. The 2-minute script (`docs/demo_script.md`) is short enough to recover from. |
| O3 | **Browser cache serving stale JS/JSON** — old build cached, dashboard shows yesterday's state. | P1 | M | Use an incognito window for the demo. Disable cache in dev tools if dev tools are open. Bump a query param on the `feeds.json` fetch if stale-fetch becomes recurring. | Hard refresh. If still stale, restart the dev/preview server. |
| O4 | **Audio / display issues** — projector resolution makes labels unreadable, or the laptop fails to mirror. | P1 | M | Test the venue display during setup window. Use `Cmd/Ctrl + +` to zoom to readable size; verify dashboard cards remain laid out at zoom levels we'd actually use. Confirm dashboard text passes the demo-distance readability check (`docs/acceptance_checklist.md` line 43). | Drop audio entirely (demo doesn't need it). Move to laptop-only and gather judges around if projector fails — the demo is a quiet visual demo, this works. |
| O5 | **Time overrun** — judges cut the 2-minute window short, or Q&A eats setup time. | P1 | M | Memorize the **30-second emergency version** in `docs/demo_script.md`. Practice the 2-minute version twice. | Drop to 30-second version mid-stream. Cut directly to: Feed A verified → Feed B unknown → Feed C corrupted → human-decision warning → done. |
| O6 | **Demo laptop battery / power** — laptop sleeps, dies, or thermals throttle Vite during a 30-min wait. | P2 | L | Plug in. Disable sleep. Close other apps. | Switch to backup laptop that already has the repo cloned and `feeds.json` rendered once. |
| O7 | **Last-minute git pull breaks the build** — someone merges to `main` while the presenter is staging. | P1 | M | Cut a `demo-locked` tag tonight. Presenter checks out the tag, not `main`. No `git pull` during the demo window. | `git checkout demo-locked` and reload. |

---

## 3. Pitch risks (Q&A objections)

| # | Risk | Sev | Likelihood | Mitigation (now) | Fallback (during demo) |
|---|------|-----|------------|------------------|------------------------|
| P1 | **"32-bit truncated HMAC is weak — this is just security theater."** Truncated HMAC is the documented payload (`docs/steganographic_iff.md`); a sharp judge will notice. | P1 | M | Pre-load the answer: 32-bit truncation is for the *bit-budget on a single VBI line*, not the security boundary; the security boundary is the pre-shared key + timestamp/counter freshness, which kills both replay and brute force within the freshness window. Production can rotate keys (~20s rotation in the source concept) and widen the tag if bandwidth allows. | If pressed: concede the demo payload is a hackathon simplification (`marker.py` uses a different concrete format anyway), and the cryptographic *primitive* is the load-bearing claim, not the bit-width. |
| P2 | **"Ethics — friend-vs-foe identification has obvious dual-use."** | P0 | M | Lead with the safety boundary every time it's mentioned: the system never produces a "foe" label, never recommends action, human-in-loop is a hard event constraint. The 5-state taxonomy is *deliberately asymmetric* — there's a "verified friend" path and a "needs review" path; there is no "foe" path. Cite `docs/dashboard_states.md`. | Don't argue. Re-state the boundary, point to the persistent warning ("Identification aid only. Human decision required."), and move on. Don't get drawn into autonomous-engagement hypotheticals. See §4 below for the specific script. |
| P3 | **"Scope claims you can't back."** Pitch language about VBI, Betaflight firmware fork, ~$50 receiver, etc. — a judge with hardware experience asks "have you actually tested this on real analog video?" | P1 | M | Be honest in the pitch: the cryptographic + fusion + dashboard layers are real and tested; the analog pipeline is *not* demonstrated, only specified. `docs/steganographic_iff.md` §"What our hackathon demo does and doesn't show" is the script. | Concede directly: "We did not flash a Betaflight FC or capture composite video for this demo. The receiver-side software is real; the firmware fork and capture rig are the production roadmap." Honesty wins more than overclaim. |
| P4 | **"Is this just YOLO with extra steps?"** Judges who skim the visual classifier conclude the demo is a thin wrapper around a pretrained drone detector. | P1 | M | Lead the pitch with HMAC-marker + VBI as the *novel* element (which it is). The visual classifier is *supporting evidence only* — coarse by design, never authoritative. Cite the fusion rule that requires marker + manifest + corroborating signal for `FRIENDLY_VERIFIED`. The visual signal alone can never produce a friendly label. | "The visual classifier is one of four signals. Strip it out and `FRIENDLY_VERIFIED` still requires HMAC + freshness + mission match. YOLO can't authenticate; HMAC can." |
| P5 | **"Why is this better than what's deployed today?"** A judge could read the pitch and ask whether existing watermarking already solves this. | P2 | M | Lead with prior art (VBI / VEIL / Digimarc / US Patent 8,750,517 / IR IFF) and the explicit gap — Birger's analysis (2026-05-03) confirmed the *combination* on live FPV analog video on a flight controller for real-time IFF at zero hardware cost is unaddressed publicly. Honest framing: applying proven techniques to a new problem, not inventing new science. | "These techniques are individually decades old. The combination applied to mass-produced cheap FPV hardware, on the flight controller, with no added hardware cost — that combination doesn't exist publicly. We're applying proven mechanisms to an unaddressed problem." |
| P6 | **"Confidence numbers look made up."** A judge presses on the heuristic confidence scores in `docs/fusion_architecture.md`. | P2 | L | They are heuristic and we say so. The honest framing: the *state* is determined by deterministic rules; the confidence is a coarse hint for the operator, not a calibrated probability. Production would calibrate against logged data. | Concede directly. The state machine is the load-bearing element; confidence is UX seasoning. |

---

## 4. Safety-boundary risks (the human-in-loop event constraint)

The hackathon will eliminate teams whose system makes autonomous engagement decisions. This isn't a soft preference — it's the boundary. These risks are about the boundary being *perceived* to slip during Q&A, even if the system itself is fine.

| # | Risk | Sev | Likelihood | Mitigation (now) | Fallback (during demo) |
|---|------|-----|------------|------------------|------------------------|
| S1 | **"What about jamming foes?"** A judge asks whether the system could feed a jammer or pick targets. | P0 | M–H | The answer is rehearsed and short: "No. The system never produces a 'foe' label and never recommends an action. `UNKNOWN_NEEDS_REVIEW` is not 'foe'; it's 'we cannot confirm friendly.' Anything past that is the human operator's decision." Cite the persistent warning. | Repeat the answer verbatim if pressed. Do not improvise on this question. Do not engage with hypothetical "but what if you wired it to..." framings. |
| S2 | **"Unknown = jam" reframe attempt.** Judge or audience tries to put words in the presenter's mouth — *"so unknown drones get jammed, right?"* The source concept literally proposed this; we explicitly reject it (`docs/steganographic_iff.md` §"What we explicitly reject"). | P0 | M | Pre-rehearse the rejection: "We explicitly reject that framing. Our taxonomy has five states; none of them is 'foe' and none of them recommends action. Unknown means *not confirmed friendly* — full stop." | Hold the line. If the judge keeps reframing, point to the persistent dashboard warning and the state list. Do not soften. |
| S3 | **Pitch language slippage.** Presenter under pressure says something like "the system tells you which drones to ignore" or "treat as foe" — phrasing that contradicts the boundary. | P1 | M | Drill the script. Words to avoid: "engage," "target," "jam," "foe," "shoot," "treat as." Words to use: "identify," "verify," "review," "operator decides," "identification aid." Risk-zone language is fully scrubbed (`docs/acceptance_checklist.md` §"Safety Language Audit"). | A teammate listening from the audience can flag with a hand signal if a slip happens; presenter recovers with "let me restate that — the system identifies, the operator decides." |
| S4 | **Demo UI implies action.** A late dashboard tweak introduces a button, color, or copy that reads as "engage" or "jam." | P0 | L | Acceptance checklist line: *"No UI copy implies autonomous action."* Re-grep before demo: `grep -ri "engage\|jam\|foe\|target" dashboard/src/`. | If discovered on stage, narrate around it: "ignore that label, it's a draft." Better: don't ship UI changes on demo day. |
| S5 | **Q&A pulls demo into autonomous-engagement hypotheticals.** "If you added a jammer integration..." | P0 | M | Don't engage with the hypothetical. The answer is: "That's outside the scope of this project and outside the boundary the hackathon set. We built an identification aid, not a fire-control system." | Repeat. Move on. Don't speculate. |

---

## Fallback playbook (presenter-facing)

If something breaks, work down this list in order. Don't try to debug live; the goal is "the audience saw the three-feed story and the safety boundary," not "the live demo was perfect."

### A. Live dashboard works, `feeds.json` is fine — primary path

Run the 2-minute script in `docs/demo_script.md` as written. This is the fallback already documented in `docs/demo_plan.md` §"Fallback Plan If Live Detection Fails": the demo path *is* the scripted-detector path. There's no live detector to lose — `feeds.json` is the demo. Say the line:

> *"The live detector is replaced here with recorded detector output so we can show the operator workflow."*

This is a feature, not a bug: every demo run is identical, deterministic, and rehearsable. Lean on it.

### B. Dashboard won't render, but `feeds.json` exists

1. Hard refresh (Cmd/Ctrl+Shift+R).
2. Kill Vite, restart with `npm run preview` from the pre-opened terminal.
3. If still broken: open `dashboard/public/feeds.json` in a browser tab and *narrate the JSON*. The five states are human-readable; a judge can follow `state: "FRIENDLY_VERIFIED"` and `confidence: 0.92` directly. Less polished but the story still lands.
4. Last resort: screenshots (see §D).

### C. `feeds.json` missing or corrupted

1. From the pre-opened terminal: `python scripts/generate_feeds.py`. ~2 seconds.
2. If that fails: `git checkout HEAD -- dashboard/public/feeds.json`.
3. If both fail: switch laptops to the backup that already has a working render.

### D. Total laptop failure

Keep three screenshots committed in `team/nicholas/` (or wherever Sebastian lands them) covering the three core states: Feed A verified, Feed B unknown, Feed C corrupted. Narrate over the screenshots using the 30-second emergency script. The pitch survives without a live render.

### E. Q&A goes off the rails on safety

Hold the boundary. Repeat the rehearsed lines from §4 above. Do not extend the conversation. The judges are testing whether the team understands the boundary; the right move is to re-state it cleanly and stop.

---

## Pre-demo checklist (run T-30 minutes before judging)

- [ ] `pytest tests/` — 12/12 passing.
- [ ] `ls -lh dashboard/public/feeds.json` — file exists, non-zero, modified today.
- [ ] Dashboard renders three feeds at the venue projector resolution.
- [ ] All five states (or the three MVP states) show the persistent warning text.
- [ ] Wi-Fi off — dashboard still loads.
- [ ] `git status` clean; on the `demo-locked` tag (or whatever Sebastian cuts).
- [ ] Presenter has run through the 2-minute script once today.
- [ ] Backup laptop has rendered the dashboard at least once.
- [ ] Screenshots for §D fallback are saved locally.

---

## Coverage summary

- **Technical risks:** 8 (T1–T8)
- **Demo-day operational risks:** 7 (O1–O7)
- **Pitch risks:** 6 (P1–P6)
- **Safety-boundary risks:** 5 (S1–S5)
- **Total:** 26 risks across 4 categories, plus a 5-section fallback playbook and a pre-demo checklist.
