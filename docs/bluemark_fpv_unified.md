# BlueMark FPV — Steganographic Friendly-IFF for Cheap Analog FPV Drones

> **Identification aid only. Human decision required.**

---

## 1. The Problem

We chose Challenge 2, *Edge Deployments and Drone Operation* — directly relevant to future US national security needs in a potential wider conflict, but where the state of the art is being defined in the kill zone in Ukraine.

We consulted with Vlad, a Ukrainian scaleup founder who is building a common tech stack to solve the scaling challenge in Ukraine's UAV ecosystem — an ecosystem consisting of hundreds of domestic designs and modifications to high-volume commercial models like the DJI Mavic. His input grounded our problem definition in operational reality.

**The specific problem: friendly fire.** Current EW interceptor systems rely on tapping into and jamming video streams and/or drone control signals. Without a way to distinguish friendly feeds from hostile ones, friendly drones get jammed alongside enemy ones. The result: roughly **50% of drone losses are due to friendly fire** — friendly EW teams inadvertently destroying their own assets.

With Ukraine's current run rate of **7 million drones projected for 2026**, this is not a niche problem. Solving friendly identification for the simplest and most numerous FPV drones will not only strengthen the US ability to fight low-end drone battles, but could potentially **double the effective size of the arsenal of democracy** in Ukraine by eliminating the friendly-fire loss rate.

Cheap FPV drones are disposable, mass-produced battlefield assets. Friendly identification has not scaled with them. Higher-end platforms carry DroneID, dedicated IFF transponders, or operator-station identification. Cheap FPVs do not — adding $20+ of hardware to a $300 attritable drone doesn't survive cost-benefit analysis at scale. In contested environments, friendly EW teams see a video or RF signal but lack confidence that it belongs to their own pilot.

The hackathon challenge asks for *"computation and control pushed to the tactical edge"* in *"austere, disconnected environments, sometimes from nothing more than a backpack."* BlueMark FPV answers a specific corner of that challenge: **friend-or-foe identification of cheap analog FPV drones, edge-on-edge, no cloud, software-only.** We are helping build a more resilient drone ecosystem by pushing highly resource-efficient computation and control to the tactical edge.

---

## 2. The Insight

The component technologies are decades-proven prior art — individually. The combination hasn't been done.

| Prior Art | Era | What it proved |
|---|---|---|
| VBI data encoding (NABTS / teletext / closed captioning) | 1980s | Digital data can ride in the Vertical Blanking Interval of analog video at 15.6 kbit/s per line. |
| Covert video watermarking (VEIL, Digimarc / Philips WaterCast) | 1990s–2000s | Program-specific identifiers can be embedded in broadcast video with no perceptible quality loss (~72 bps). Digimarc alone holds 800+ patents. |
| Covert light-based IFF (US Patent 8,750,517) | 2010s | Encoded illumination invisible without the key. Same cryptographic-stealth principle applied to light. |
| IR-based dismounted-soldier IFF | Fielded | Rolling codes, undetectable without expected timing parameters. |
| Academic drone steganography (LSB embedding) | 2020s | Steganographic marking of drone-captured images — but stored photos, not live video, not IFF. |

**The gap:** VBI encoding x live FPV analog video x on a flight controller x for real-time IFF x at zero added hardware cost x for mass-produced cheap battlefield drones. SME review confirmed this gap is unaddressed in public literature. Closest equivalent would be classified military programs.

We are not inventing new science. We are applying proven techniques to a problem they haven't been applied to.

---

## 3. The Core Technical Contribution

Every analog video signal has a Vertical Blanking Interval — a handful of lines at the top of each frame that exist for historical sync purposes. **No screen, no FPV goggle, no capture card, and no enemy SDR receiver ever renders VBI lines.** They are invisible to everyone watching the video. But they are still physically present in the signal.

BlueMark's contribution is using those invisible lines as a covert IFF channel:

1. **Write** an HMAC-SHA256 cryptographic fingerprint into VBI lines 17–20 on the friendly drone, using the OSD chip (MAX7456 / AT7456) that is already on every Betaflight flight controller. No new hardware. No visible change to the video. No signal the enemy can see or copy without the secret key.
2. **Read** those same invisible lines on the receiver side — a friendly EW team pulls VBI data from the captured signal and verifies the fingerprint. Valid HMAC, fresh timestamp, correct mission manifest = friendly. Anything else = operator reviews manually.

**Why this is novel:** VBI encoding is 1980s technology. HMAC authentication is textbook cryptography. IFF is as old as radar. What has not been done publicly is the combination: a cryptographic IFF marker hidden in VBI lines of *live FPV analog video*, generated on *the drone's own flight controller*, at *zero added hardware cost*, for *real-time identification* of *cheap mass-produced battlefield drones*. Each ingredient is proven; the recipe is new.

**In one sentence:** we hide an unforgeable, invisible cryptographic tag in the part of the video signal that nobody renders, using hardware the drone already has, and we prove the full crypto loop works from both ends.

### What our demo proves end-to-end

1. **Firmware simulation** (Wokwi ESP32, C + mbedtls) generates the exact same HMAC marker payload that the Python receiver expects — same crypto, both languages, byte-identical. Cross-language verification: `scripts/verify_firmware_marker.py`.
2. **Receiver-side verification** (`src/bluemark/marker.py`) decodes and validates the marker: HMAC check, freshness window, mission manifest match.
3. **Fusion engine** (`src/bluemark/fusion.py`) combines seven identification signals into one of five operator-facing states, biased toward minimum false-friendly.
4. **Dashboard** (React + Vite + TypeScript) renders those states to a human operator who makes the call.

**What is honestly deferred:** the actual OSD chip write routine that puts bytes into VBI lines 17–20 on a real Betaflight flight controller. That is a firmware delta — the cryptographic primitive does not change. Production deployment swaps `Serial.println(marker)` for a VBI write targeting the OSD chip past its safe-area restrictions; everything else in the pipeline stays identical.

---

## 4. The Solution in Detail

BlueMark FPV embeds a **steganographic HMAC-authenticated marker** in the Vertical Blanking Interval (VBI) of the drone's analog video signal — lines 17–20 of NTSC, which no FPV goggle, screen, or enemy capture device renders. The marker is invisible to the pilot and invisible to the adversary. Detection runs receiver-side on hardware EW teams already carry.

### How it works

**Drone side (firmware-only, zero added hardware):**
A Betaflight firmware modification writes a per-frame HMAC-SHA256 marker into VBI lines via the drone's existing OSD chip (MAX7456 / AT7456 family). The firmware bypasses the OSD's safe-area restrictions to write into lines the display never renders. The pre-shared key is provisioned at flash time and never transmitted over the air.

**Payload per frame (~52–64 bits):**
```
[ 4-bit protocol version ][ 16-bit unit ID ][ 32-bit truncated HMAC ][ rolling timestamp / counter ]
```
One frame at 60 fps = ~16 ms decision latency.

**Receiver side (~$50 kit, backpack-portable):**
Composite video → USB capture card → VBI line extractor → HMAC verifier → multi-signal fusion → operator dashboard.

Runs on a Raspberry Pi + capture card (~$50) or any laptop with a composite capture interface. No cloud, no central server, no satellite link.

### What this gives the operator

- **Invisible to the enemy.** The IFF channel doesn't exist for anyone not extracting VBI with the right key.
- **Unforgeable.** HMAC with a pre-shared key; no raw crypto material over the air.
- **Replay-resistant.** Rolling timestamp in payload; stale markers fail the freshness window.
- **Zero marginal drone cost.** Software change to firmware already flying.
- **Edge-on-edge.** Both sides run on hardware already in the field, disconnected, no backhaul.

---

## 5. Five-State Classification

The fusion engine combines up to seven identification signals and maps every feed into one of five operator-facing states. The taxonomy is deliberately biased toward **minimum false-friendly**: a foe labeled `FRIENDLY_VERIFIED` is the worst possible error and inverts the system's purpose. We'd rather flag a friendly as `UNKNOWN_NEEDS_REVIEW` than let a foe through as verified.

| State | What it means | Required evidence | Confidence |
|---|---|---|---|
| **FRIENDLY_VERIFIED** | All signals agree: this feed authenticates as ours. | HMAC valid + fresh timestamp + mission manifest match + at least one supporting signal (visual, RC session, or RF). | ≥ 0.85 |
| **LIKELY_FRIENDLY** | Marker checks out, but corroboration is missing. Deliberately not promoted. | HMAC valid + fresh + mission match, but no supporting signal. | ~0.65 |
| **UNKNOWN_NEEDS_REVIEW** | No marker observed. **Unknown is not foe.** | No marker candidate found. The complement of friendly-verified is *not-confirmed-friendly*, never hostile. | ~0.20 |
| **SIGNATURE_CORRUPTED** | Marker-like data present, too noisy to verify. Analog degradation. | Partial marker extracted; no HMAC pass/fail decision possible. | ~0.40 |
| **POSSIBLE_SPOOF** | Marker pattern found, but fails cryptographic verification. Suspicious. | Marker decoded but HMAC failed, timestamp stale, or mission mismatch. | ~0.10 |

Every state, every card, every fallback path carries the same footer: **Identification aid only. Human decision required.**

The system never labels anything "foe." The system never recommends engagement.

### Identification signals

| Signal | Source | Role |
|---|---|---|
| Firmware marker | HMAC verifier on extracted VBI data | Authoritative — source of truth. |
| Steg-IFF token | Decoded marker payload | Identity + freshness carrier. |
| HMAC verification | Cryptographic check against pre-shared key | Authentication gate. |
| Freshness window | Marker timestamp vs. current time (default 10s) | Replay resistance. |
| Mission manifest match | Decoded mission_id checked against signed manifest | Authorization check. |
| Visual profile | Receiver-side classifier (rule-based / optional ONNX) | Supporting corroboration only; can never derive "friendly" on its own. |
| RC session | Cross-check against pilot/controller metadata | Supporting corroboration when available. |

`FRIENDLY_VERIFIED` requires marker + freshness + mission + at least one supporting signal. Missing any one produces a less-confident state, never a stronger one.

---

## 6. Architecture

All identification logic runs **receiver-side**. No drone-side AI hardware is required. Per-drone marginal cost is zero (Tier 0: pure software).

```
Drone side                         Receiver side
──────────────                     ────────────────────────────────────────
Betaflight FC (STM32)              Pi / laptop / EW scanner
  └─ firmware mod                    └─ USB capture card
      └─ HMAC marker → VBI              └─ VBI extractor
          └─ analog VTX signal               └─ HMAC verifier
              ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►  └─ fusion engine
                                                        └─ dashboard
                                                            └─ human operator
```

### Cost tiers (pitch as Tier 0)

| Tier | Approach | Added cost / drone |
|---|---|---:|
| **0** | Pure software OSD marker (firmware mod only) | ~$0 |
| 1 | Software + existing RC/telemetry metadata | ~$0–$20 |
| 2 | Tiny microcontroller assist (ESP32-class) | ~$5–$25 |
| 3 | Small companion computer (Pi Zero / SBC) | ~$20–$70+ |

Tier 0 is the hackathon MVP and the strongest scaling story: a software change to firmware already flying, detected by hardware EW teams already carry.

### Fusion pipeline

```
FPV frame ─┬─► marker extract ──► HMAC verify ─┬─ marker ──────────┐
           │                                    ├─ time_window ─────┤
           │                                    └─ mission_match ───┤
           └─► visual classifier (optional) ────── visual_profile ──┤
                                                                    ▼
mission_manifest.json ──► session lookup ──── rc_session (opt) ──► FUSE
                                                                    │
                                                              FusionResult
                                                        state · confidence
                                                     signals_used · reason
                                                                    │
                                                                    ▼
                                                          dashboard card
```

Tie-breaks always resolve to the lower-confidence state — favoring human review over false certainty.

---

## 7. The Demo

The hackathon demo simulates the receiver-side reading via pre-generated detector output. The cryptographic and fusion logic is real; the video pipeline is simulated. The presenter is honest about this on stage.

### Five live feeds, sorted by severity (bad-news-first)

The dashboard opens sorted by severity — highest-risk feeds at the top. The walk order is E → D → C → B → A, ending on the success beat.

**FEED-E — POSSIBLE_SPOOF:** Marker pattern present, HMAC verification failed. Could be a captured drone replaying yesterday's marker, or an adversary copying the byte pattern without the key. System flags suspicion — it does not flag *engage*.

**FEED-D — SIGNATURE_CORRUPTED:** Marker present, steg-IFF token came through partial — analog degradation. One PASS, one FAIL, five MISSING. Operator reviews. We don't force a verdict on noisy data.

**FEED-C — UNKNOWN_NEEDS_REVIEW:** Zero signals. No marker observed at all. Unknown is not foe — that's the hard line. The complement of friendly-verified is *not-confirmed-friendly*, never hostile.

**FEED-B — LIKELY_FRIENDLY:** Five signals pass — firmware marker, steg-IFF token, HMAC verified, freshness, manifest match. Two missing. We deliberately do not promote it to fully verified. Minimum-false-friendly is the design goal — a foe who steals one component never reaches FRIENDLY_VERIFIED.

**FEED-A — FRIENDLY_VERIFIED:** All seven signals PASS. HMAC marker is the source of truth; the other six are corroboration. Highest confidence. Identification aid only. Human decision required.

### What the audience sees

- Five FPV-style feed panels (sidebar list + detail view), each with state, confidence, and full signal breakdown.
- Severity-sorted — the feeds needing operator attention are at the top.
- State-distribution bar and tactical map on the Mission Overview screen.
- Cross-check against a signed mission manifest.
- Persistent warning on every state and in the global footer: **Identification aid only. Human decision required.**

### Firmware cross-verification

The drone-side firmware is simulated in Wokwi (ESP32 running C with mbedtls HMAC-SHA256). A cross-language verifier (`scripts/verify_firmware_marker.py`) proves that a marker produced by the simulated flight controller decodes cleanly on the receiver — same crypto, both ends, byte-identical. Production roadmap: a real Betaflight fork swaps `Serial.println(marker)` for a VBI write routine; the cryptographic primitive doesn't change.

### Fallback

The scripted detector path **is** the demo path. `scripts/generate_feeds.py` produces `dashboard/public/feeds.json`; the React dashboard reads it. If anything fails at demo time, recovery is one command: `python scripts/generate_feeds.py`. Every demo run is identical and deterministic — that's the design.

---

## 8. Honest Scope & Limitations

### What we built and shipped
- Real HMAC-SHA256 marker generation and verification (Python + C).
- Real 5-state fusion engine with seven signal inputs.
- Real React + Vite + TypeScript dashboard with all five operator-facing states.
- Wokwi firmware simulation proving cross-language cryptographic compatibility.
- Cross-language verifier confirming the full integration loop.

### What we simulated
- The video pipeline: pre-computed detector outputs in `feeds.json` instead of a live VBI-extracting receiver.
- FPV video feeds are simulated assets, not live analog captures.

### What production requires (out of hackathon scope)
- Betaflight firmware fork with VBI write routine targeting OSD chip lines 17–20.
- Key provisioning tool (CLI / Configurator integration, writes unit ID + HMAC key to EEPROM at flash time).
- Live VBI extraction from a real analog capture pipeline.
- Per-mission key rotation and secure key management (ATECC608 or dedicated EEPROM region).
- Field trial: VBI marker survival under real VTX/noise conditions in contested EW environments.
- Measurement of operationally-acceptable false-positive and false-negative rates against real intercepted feeds.

### What we explicitly do not do
- No autonomous targeting, engagement, or fire-control logic.
- No "foe" label is ever produced.
- No weaponization or payload integration.
- No evasion, jamming, interception, or attribution guidance.
- No operational deployment instructions for real battlefield use.
- Human-in-the-loop is a hard constraint, not a preference.

---

## 9. Why This Matters

### The asymmetry

We mark *friendly* drones only. We have no mechanism to identify a foe. Anything that doesn't authenticate as friendly is `UNKNOWN_NEEDS_REVIEW` — never `FOE`. The complement of friendly-verified is *not-confirmed-friendly*, not hostile. This asymmetry is the design, not a limitation: it prevents the system from becoming a targeting tool.

### The optimization target

Minimize false-friendly classification. A foe reaching `FRIENDLY_VERIFIED` is the worst error. The entire state taxonomy, fusion logic, and tiebreak policy are biased to prevent it: errors fail toward "operator must review," never toward "verified friendly."

### The scaling story

Marker generation is a software change to firmware already flying — zero added per-drone cost. The receiver runs on hardware EW teams already carry. Edge-on-edge, no cloud, works EW-contested. This scales with the inventory of cheap analog FPV drones, not against it.

At Ukraine's projected 2026 run rate of 7 million drones, cutting the ~50% friendly-fire loss rate doesn't just save hardware — it effectively doubles the operational fleet without producing a single additional drone. BlueMark FPV is a force multiplier deployed as a firmware update.

### ML: responsible by construction

We built a pretrained YOLO classifier, gated by a safety invariant so vision can never derive "friendly" on its own. We cut it from the live demo path — our SME confirmed the cryptographic marker is sufficient, and the model has no evals on real FPV footage. The code stays in the repo; the architecture decision is the talking point. Responsible AI by construction, not by aspiration.

---

## 10. Anticipated Questions

**"VBI watermarking and HMAC are old."**
Correct, and we say so on stage. The novel contribution is the combination: VBI encoding x live FPV analog video x on a flight controller x for real-time IFF x at zero hardware cost. The individual parts are mature; their intersection applied to this problem is unaddressed publicly.

**"How do you handle a stolen marker?"**
A spoofed marker without freshness or supporting signals lands on `POSSIBLE_SPOOF`, not on the verified path. The rolling timestamp bounds replay windows to 10 seconds. `FRIENDLY_VERIFIED` requires four conditions — missing any one drops the feed to a less-confident state.

**"What if the analog signal degrades?"**
`SIGNATURE_CORRUPTED` — operator reviews. Every degradation path leads to human review, never to silent failure or false certainty.

**"Has this been tested in real EW conditions?"**
No. Our SME was explicit: any watermarking solution should be tested and tweaked in theatre. This is a proof-of-concept. Overclaiming it would be the bigger ethical failure.

**"Did you flash a real flight controller?"**
Not for this demo — multi-day effort, out of hackathon scope, and we say so honestly. We ship a Wokwi simulation with cross-language verification proving cryptographic compatibility. Production roadmap: the VBI write routine is the only firmware delta; the cryptographic primitive is portable.

**"Is this a kill chain?"**
No. Human-in-the-loop is a hard event constraint. The system never recommends engagement. We never label "foe." Every screen says: *Identification aid only. Human decision required.*

---

## 11. The Closing Line

The value is clearer human deconfliction at the tactical edge — running entirely on hardware already in the field, in the austere, EW-contested, disconnected environments where IFF actually has to work.

What's novel here isn't VBI watermarking, isn't HMAC, isn't IFF — those are decades-proven prior art. It's the **combination**: applied to cheap FPV analog video, on a flight controller, for real-time IFF, at zero added hardware cost. That's the gap we close — on equipment already in the field today.

When half of all drone losses are friendly fire and the run rate is 7 million drones a year, a software-only IFF system that deploys as a firmware update isn't incremental improvement. It's a strategic capability deployed at the speed of a flash.

**Identification aid only. The human decides.**
