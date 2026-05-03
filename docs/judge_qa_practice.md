# Judge Q&A Practice — Cerebral Valley NatSec Hackathon 2026

> Adversarial questions to rehearse before judging. Sourced from the actual judge demographics for the 3rd Annual NatSec Hackathon (May 2-3, 2026, SF, in collaboration with US Army PIT / Army FUZE xTech). Pair this with `docs/judge_faq.md` (5 baseline questions); this file goes deeper and more hostile.

## Judge demographics you'll face

Past NatSec Hackathon judges (likely repeat or archetype-similar in 2026):

- **VC / capital**: Raj Shah (Shield Capital, lead co-host), A.J. Bertone (IQT — In-Q-Tel, CIA's VC arm), DCVC reps.
- **Defense primes / dual-use cos**: Gokul Subramanian (Anduril), Scott Philips (Vannevar Labs), John Bohannon (Primer), Palantir reps, Scale AI reps.
- **Active government / military**: Nand Mulchandani (CIA, former CIA CTO), Stu Wagner (USAF), Ritwik Gupta (DIU), Glenn Parham + Nick Ashworth (Defense Digital Service), Scarlett Swerdlow (DISA), SOCOM + SOCPAC reps, US Army PIT, US Navy, US Space Force.
- **Academic dual-use**: Bryce Mitchell + Chris Kay (Stanford Defense Tech), UC Berkeley Defense & Dual Use Tech Club.
- **AI labs**: OpenAI, Scale AI — likely focused on ML methodology / evals.

Scoring rubric per the xTech RFI: **Technical approach 35% / Military applicability 30% / Implementation plan 20% / Cost & schedule 15%.**

**Critical context — past winners trend autonomous-engagement.** 1st place 2024 was *AI Laser Sentinel* — autonomous drone-killing laser. BlueMark deliberately rejects autonomous engagement. **You will get pushback on the human-in-loop stance from judges who prefer "we shoot it down."** Don't apologize for the safety boundary; defend it as the doctrinally correct posture.

---

## VC archetype (Shield Capital, IQT, DCVC)

These are pattern-matchers. They want: TAM, dual-use story, defensibility, regulatory moat, exit path.

### Q1 — "What's your TAM and how do you make money?"
**Trap**: getting drawn into a startup pitch when this is a hackathon project.
**Answer**: "TAM is anchored to FPV drone production volumes — Ukraine is at 1-2M/year today, US Army is standing up division-level FPV units, projected near-peer attrition fights are 5-10M/year per side. At a dollar per drone for marker integration, that's a multi-million-dollar program annually per service, plus the receiver-side software licensing across every EW unit. Business model is **firmware licensing + receiver-side contracts**. Today's project is a hackathon proof-of-concept; the market is real, the unit economics work at any scale."

### Q2 — "Who else is doing this? Why hasn't a defense prime built it?"
**Trap**: claiming false novelty. Birger's SME pass corrected exactly this.
**Answer**: "VBI watermarking, HMAC, and IFF are decades-proven prior art — NABTS in the 1980s, VEIL in the 1990s, Digimarc with 800+ patents, US Patent 8,750,517 covers covert light IFF, IR soldier IFF in active use, academic drone steganography. **Separately, all old. The combination — applied to live FPV analog video, generated on the drone's existing flight controller, for real-time IFF, at zero added hardware cost — is unaddressed publicly.** Defense primes haven't done it because their margin model is hardware-heavy; we're software-only on existing kit. That's exactly why a hackathon team can ship it credibly in 48 hours."

### Q3 — "Dual-use story?"
**Trap**: this is hackathon-coded, not commercial-coded.
**Answer**: "Direct dual-use to commercial drone deconfliction — FAA Remote ID is mandatory for commercial drones but offers no cryptographic authentication. Same VBI/HMAC marker pattern works for delivery drones, infrastructure inspection, public safety. Defense is the credible first market because friendly-fire prevention is a clear ROI; commercial follows the same architecture."

### Q4 — "What stops China from copying this in six months?"
**Trap**: implying the cryptographic primitive is the moat.
**Answer**: "**Nothing — and that's the point.** The primitives are public; the moat isn't crypto, it's the **integration with US/allied flight controller firmware and the key infrastructure for managing mission manifests**. Anyone can build the marker; only the holder of the signing key can produce *valid* friendlies for a given mission. Adversaries copying the architecture means adversaries also build IFF for their own forces — which doesn't hurt us; it's an unintended de-escalation effect."

---

## Defense prime / dual-use co archetype (Anduril, Palantir, Vannevar, Primer, Scale AI)

These judges think in integration terms. They want: where does it fit in the kill chain, who owns the data, can we partner.

### Q5 — "How does this integrate with our existing C2 stack?" *(Palantir / Anduril Lattice voice)*
**Trap**: claiming standalone deployment.
**Answer**: "The receiver emits a JSON contract — `feeds.json` schema in `src/bluemark/schemas.py`. Five fields per feed: state, confidence, signals_used, reason, feed_id. That feeds directly into Lattice/Maven/MATRIX as a sensor-fusion input. The classifier is one signal among many; we don't replace your fusion engine, we feed it. The dashboard is a hackathon presentation surface — the *contract* is the actual integration point."

### Q6 — "Why HMAC and not a public-key scheme?"
**Trap**: missing the operational reason.
**Answer**: "HMAC because key distribution is a solved problem at the unit-of-issue level — a brigade gets a shared secret rotated per mission, same way TACSAT crypto works today. Public-key adds key infrastructure overhead and per-drone storage cost without operational benefit at this scale; you don't need non-repudiation when the marker exists for one mission window. **If a prime wants to layer PKI on top, the byte-level interface accommodates it.**"

### Q7 — "Have you talked to operators?"
**Trap**: this is a tell-don't-show question. They want to hear named units, named feedback.
**Answer**: "Domain SME on our team — Birger — gave us a full review pass. Three load-bearing inputs: (1) cryptographic-marker prior art is decades-deep so position the contribution honestly as the *combination*; (2) optimize for **minimum false-friendly classification rate** over false-negative — a foe getting `FRIENDLY_VERIFIED` is the worst possible error; (3) Ukrainian field reality is ~50% feed throughput, so the dashboard must handle missing feeds gracefully — we ship `NO_SIGNAL` placeholders for declared-but-missing drones to prove the system flags the gap. SME write-up is in `team/nicholas/birger_responses_2026-05-03.md`."

### Q8 — "Show me the eval methodology."
**Trap**: there isn't one for the visual classifier — that's why we cut it.
**Answer**: "**Two-tier honesty.** The marker pipeline has deterministic evals — pytest suite verifies HMAC correctness, mission-window logic, and the 5+1 state transitions. Cross-language verifier (`scripts/verify_firmware_marker.py`) proves the Wokwi firmware-side and Python receiver-side produce byte-identical HMACs. The visual classifier — pretrained YOLOv8n via ONNX — has no evals on real FPV footage. That's exactly why we **cut it from the live demo path** and tracked the eval gap as a follow-up. We do not ship un-eval'd ML."

---

## Active military / government archetype (CIA, DIU, SOCOM, DISA, USAF, Army)

These are the most operationally adversarial questions. They've seen demos that don't survive contact with reality.

### Q9 — "What happens when EW jams the link?" *(USAF / EW operator voice)*
**Trap**: claiming the system is jam-proof. It isn't.
**Answer**: "Marker generation is on-airframe, no link required — the marker is encoded into the analog video signal the drone is already broadcasting. If the jammer kills the video link entirely, the drone is dark anyway and IFF is moot. If the jammer degrades the link, the marker degrades into `SIGNATURE_CORRUPTED` — explicit operator-review state, not a false friendly. We **inherit the jamming-resistance properties of the underlying analog video**, no worse and no better."

### Q10 — "What's your false-friendly rate?" *(DIU / xTech voice — the question that wins or loses you the round)*
**Trap**: giving any number for which you don't have evidence.
**Answer**: "**On the cryptographic path: zero by construction.** A foe can produce a `FRIENDLY_VERIFIED` only by holding the signing key. With the key, they're not a foe — they're an inside threat, which is a different problem. On the supporting-signal path: we deliberately do not allow visual classifier output to derive `known_friendly_*` — only hand-labels can. Belt-and-suspenders enforced at runtime by an assertion in `_resolve_label()`. Worst case under signal degradation: feeds drop *down* the confidence ladder, never up. **System optimizes for minimum false-friendly; we'd rather miss a friendly than mark a foe as friendly.**"

### Q11 — "How does this not become a kill chain?" *(CIA / Stanford ethics voice — Nand Mulchandani / Bryce Mitchell)*
**Trap**: getting defensive. The right answer is structural.
**Answer**: "By hard event constraint. The hackathon's safety boundary explicitly disqualifies autonomous engagement systems. Every dashboard card, every state, every fallback path carries the same footer: *Identification aid only. Human decision required.* We never label any feed *foe* — the complement of friendly-verified is *not-confirmed-friendly*, never hostile. We surface ambiguity for human review; we never recommend engagement. This isn't a kill chain because **it has no engagement output**."

### Q12 — "What's your story for adversary capture?" *(SOCOM voice — capture happens)*
**Trap**: pretending key compromise doesn't matter.
**Answer**: "Compromise is in-scope. Mitigations: (1) per-mission keys with short validity windows — manifest expires, all markers expire with it; (2) per-airframe marker derivation so capturing one drone doesn't unlock the fleet — derivation tree from a brigade master key; (3) operator can revoke a feed_id mid-mission via manifest update. Detection is also a signal — if a captured drone keeps reporting after capture, the operator sees `FRIENDLY_VERIFIED` from a known-down asset, which is itself diagnostic. We can't prevent capture; we can ensure capture is loud."

### Q13 — "What hardware do you need?" *(Army FUZE / xTech voice — they fund procurement)*
**Trap**: hand-waving the BOM.
**Answer**: "**Per-drone: zero added hardware.** Marker generation is a firmware flash to existing flight controllers — STM32-class, which is already in every FPV. Demonstrated in our Wokwi simulation (`firmware/wokwi/sketch.ino`). Per-receiver: a backpack laptop or a Raspberry Pi with a $15 analog video capture card. Software-only on both ends. Cost-tier breakdown is in `docs/cost_tiers.md`. Tier 0 is what we just described; Tier 3 adds a Pi AI Camera if the receiver wants on-device ML, optional, not required."

### Q14 — "How does an EW operator actually use this?" *(SOCOM / DISA voice)*
**Trap**: getting too dashboard-focused.
**Answer**: "Operator opens the dashboard on a laptop in the EW cell. Sorted by severity — top of the list is what needs attention first. The ops surface includes: state distribution at a glance, manifest cross-check (which declared friendlies are missing — could be link loss, downed asset, or never launched), spatial map of every feed in MGRS, recent-transitions log so the operator sees what changed in the last minute. Click any feed → full signal trace shows which checks passed, failed, or were missing. Operator decides; system never recommends action."

---

## Academic / dual-use archetype (Stanford DEFCON, Berkeley)

These judges are looking for intellectual honesty and prior-art literacy.

### Q15 — "Have you done a real prior-art search?"
**Trap**: claiming novelty for components.
**Answer**: "Yes — and it changed our pitch. Birger's review surfaced VBI watermarking (NABTS, VEIL), Digimarc's patent estate (800+), US Patent 8,750,517 on covert light IFF, IR soldier IFF in active use, academic drone steganography papers. Our earlier framing claimed we were upgrading a deployed practice; the corrected framing — *applying decades-proven techniques in a combination unaddressed publicly* — is honest and stronger. Cite sheet is in `docs/steganographic_iff.md`."

### Q16 — "What's the failure mode you're most worried about?"
**Trap**: false humility or false bravado.
**Answer**: "**False-friendly under spoofing with stolen key material.** All the safety architecture in the world doesn't help if a brigade signing key leaks. Mitigations are operational — short validity windows, per-mission keys, revocation. Second-place worry: the receiver-side analog-video → VBI-extraction integration is unproven on real Betaflight kit. Wokwi proves the firmware side; the receiver side is honest engineering deferred. Risk register is `team/nicholas/risk_register.md` — 26 risks across 4 categories with mitigations."

---

## AI lab archetype (OpenAI, Scale AI)

These judges want to see the AI/ML choices defended, not just listed.

### Q17 — "Why ONNX YOLOv8n? Why not a foundation model?"
**Trap**: defending a choice you didn't make.
**Answer**: "Three constraints drove the pick. (1) **Edge inference budget** — backpack laptop CPU, no GPU guarantee. YOLOv8n is 12 MB, 24 ms post-warmup CPU. A foundation vision model wouldn't fit. (2) **Eval honesty** — pretrained on COCO, no fine-tuning, no FPV-specific evals. We **cut it from the live path** because the safety invariant means YOLO output can never derive `known_friendly_*` anyway, so the marginal value to fusion is near-zero. (3) **Architecture decision over capability decision** — we'd rather ship a deterministic cryptographic verifier with a gated visual signal than ship un-eval'd ML on stage. The talking point is the *architecture*: vision is supporting evidence, never source-of-truth."

### Q18 — "How do you handle distribution shift between training and deployment?"
**Trap**: overclaiming model robustness.
**Answer**: "We don't, and we make that *fine* via the safety invariant. The visual classifier can shift from FPV-class to weather-balloon-class and the worst it does is mislabel things as `unknown_drone_like` — which still routes to operator review. The HMAC marker is the source of truth for *friendly*; vision is supporting evidence. Distribution shift in supporting-evidence-only signals doesn't break the system — it gracefully degrades."

---

## Questions to NOT volunteer answers to (defensive list)

Don't bring these up unprompted. If asked, here's the prepared answer:

- **"Have you talked to the actual Ukrainian Armed Forces?"** — "We have a domain SME with relevant operational background; we have not done direct UA AF outreach. Field validation is post-hackathon work."
- **"Is the marker patentable?"** — "We haven't filed; the prior art makes the *combination* the candidate, not the components. We'd defer to counsel."
- **"What if the FAA mandates Remote ID for military drones?"** — "BlueMark's marker is complementary to Remote ID, not competitive — Remote ID is the operator-facing transponder layer, BlueMark is the cryptographic friendly-IFF layer. They live at different OSI layers."
- **"How much code did Claude/Cursor/AI write?"** — *(this is a Cerebral Valley hackathon — answer honestly)* "Substantially. The hackathon is explicitly an AI-assisted-build event; team uses Claude Code and Codex. Architecture decisions, safety boundary, prior-art positioning, and the YOLO-cut decision are human-led; implementation and docs are AI-assisted."

---

## Pre-demo prep checklist

- [ ] Read `docs/judge_faq.md` (5 baseline answers).
- [ ] Read this file (Q1-Q18).
- [ ] Practice **Q10 (false-friendly rate)** out loud — this is the question most likely to lose you the round if you wing it.
- [ ] Practice **Q11 (kill chain)** out loud — defends the safety boundary structurally, not apologetically.
- [ ] Practice **Q4 (China copies in 6 months)** — the moat answer is counterintuitive and deserves rehearsal.
- [ ] Have `team/nicholas/risk_register.md` open in a tab for "show me the risks" follow-ups.
- [ ] Have `team/nicholas/birger_responses_2026-05-03.md` open for "have you talked to operators" follow-ups.
