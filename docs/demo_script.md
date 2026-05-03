# Demo Script

## 60-Second Live Pitch (Authoritative — No Slides)

> *Goal: One intuitive minute. Do not walk all five states. Show the contrast pair: one suspicious feed and one verified feed. The middle states remain visible for Q&A. Every beat keeps the persistent footer "Identification aid only. Human decision required." visible.*

### Pre-Show

- Dashboard open at `http://localhost:5174/`.
- Sort set to **Severity**.
- Start on **Mission Control** with no feed selected.
- Footer visible: `Identification aid only. Human decision required.`

---

## Timed Script (145 words — exactly 60 seconds at normal speaking pace)

### 0:00 – 0:25 — Problem & Insight

*(Look at the audience, not the screen. Speak authoritatively.)*

"Ukraine will deploy seven million drones in 2026. Our SME reports half of current drone losses are friendly fire—EW teams accidentally jamming their own assets. Traditional IFF is too expensive for cheap FPVs. 

BlueMark solves this with zero added drone hardware. We hide a cryptographic fingerprint in the invisible lines of analog video that screens never display. The drone's existing flight controller writes it; the laptops EW teams already carry read it. It's invisible, unforgeable, and operates completely offline."

### 0:25 – 0:45 — Live Contrast Pair

*(Gesture to the dashboard.)*

"Here is the operator dashboard. Crucially: we only mark friendly, never foe. Anything unauthenticated is unknown, never hostile.

\[click FEED-E\] At the top: POSSIBLE_SPOOF. The cryptographic check failed. Suspicious, but we never flag *engage*.

\[click FEED-A\] Here: FRIENDLY_VERIFIED. The fingerprint is valid, fresh, and matches the mission."

### 0:45 – 1:00 — Safety + Scale Close

*(Click "Mission Control" in the top bar. Point to the persistent footer.)*

"Every screen enforces our safety boundary: **Identification aid only. Human decision required.** We inform the operator; we don't automate the trigger. 

By eliminating friendly fire, we effectively double the useful fleet without building a single new drone. That is tactical-edge resilience, delivered as a firmware update."

---

## Click Path Cheat-Sheet

1. **Pre-show**: dashboard at `:5174`, severity sort, no feed selected, TacticalMap visible.
2. **0:00 – 0:20** — talk to the audience, gesture at dashboard.
3. **0:25** click `FEED-E` → spoof beat.
4. **0:35** click `FEED-A` → verified beat.
5. **0:45** click "Mission Control" → point to footer, close.

---

## Deep QA Notes

### Strongest Narrative Arc
- **Problem**: 50% friendly fire loss rate due to lack of IFF on cheap drones.
- **Insight**: Analog video has invisible lines (VBI) that are transmitted but not displayed.
- **Solution**: A keyed cryptographic fingerprint hidden in those invisible lines.
- **Demo**: Show the contrast between a failed fingerprint (`POSSIBLE_SPOOF`) and a valid fingerprint (`FRIENDLY_VERIFIED`).
- **Scale**: Zero added drone hardware means we can deploy at the speed of a flash.

### Narrative Risks To Avoid
- **Do not walk all five states in one minute.** It becomes a rushed UI tour instead of a pitch. The middle states (`SIGNATURE_CORRUPTED`, `UNKNOWN_NEEDS_REVIEW`, `LIKELY_FRIENDLY`) remain visible on screen for Q&A.
- **Do not say the system identifies enemies.** It identifies friendlies only. Anchor "Unknown != Foe" explicitly before showing feeds.
- **Do not lead with "HMAC" or "VBI" before explaining them.** Say "cryptographic fingerprint" and "invisible lines." Avoid losing non-technical judges early.
- **Do not overclaim live analog VBI extraction.** The demo proves crypto, fusion, firmware simulation, and dashboard; the real OSD VBI write routine is deferred production work.
- **Do not use arbitrary cost numbers.** Say "zero added drone hardware" instead of "$1 per drone" to accurately reflect the software-only approach.

### Q&A One-Liners
- **What is VBI?** "Invisible lines in every analog video frame. The signal carries them; screens do not display them."
- **What is the technical contribution?** "A cryptographic IFF marker hidden in VBI lines 17-20 of live FPV analog video, generated on the existing flight controller."
- **What does the demo really prove?** "The firmware simulation and Python receiver produce and verify the exact same marker, the fusion engine classifies the feed, and the dashboard renders the operator workflow."
- **What is deferred?** "The real Betaflight OSD-chip write routine that places bytes into VBI lines 17-20. The crypto and receiver logic already work."
- **Is this targeting?** "No. It only marks friendly. Unknown is not foe. Human decision required."
- **What about the 50% loss claim?** "That's from our Ukrainian SME's operational context; we use it as a directional pain signal, not a lab-measured benchmark."
- **Does the receiver need new hardware?** "No. It runs on the laptops or EW scanners teams already carry, using a standard $15 analog video capture card."

## Recovery Patter (if it breaks mid-demo)

- **Dashboard freezes**: "Live system — edge deployments fail; that's why the same `feeds.json` shape ships as a scripted fallback." Refresh the page or pivot to a 30-second summary.
- **Wrong sort applied**: Don't try to fix mid-walk; just narrate whichever state is at the top of the list.
