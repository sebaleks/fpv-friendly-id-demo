# SME Questions for Birger — Email-Ready

> Copy the section below the line into an email. Nine questions, grouped into three topics. Short answers fine on each.

---

Hey Birger — thanks for the answers on jamming pattern and receiver compute. Your "all friendly feeds are already watermarked" comment reshaped our pitch in a really useful way. Before the hackathon deadline, I'd love your read on a few more refinement questions. Short answers are fine on any of them; skip any that aren't easily answerable.

## A. Friendly drone domain

1. **Which FPV / drone models matter most on each side of the current conflict?** Ukrainian custom builds, DJI Mavic-class commercial, Russian Lancet / ZALA / Orlan family — anything else we should be thinking about?

2. **Of the friendly side specifically — which visual types should our classifier recognize?** We're using an off-the-shelf pretrained YOLO that detects "drone" generically; we want to map detections to known-friendly buckets like FPV-class, fixed-wing, or Mavic-style. Which of those (or others) actually matter?

3. **Pi / Pi AI Camera availability on the front.** Is a Raspberry Pi (and the Pi AI Camera with Sony IMX500) realistically procurable in-theatre? If not, what's a more available alternative for receiver-side compute — generic laptop, NUC-class mini-PC, ruggedized x86?

## B. Video signal realities

4. **Realistic FPV video degradation patterns.** What does it actually look like in the field — analog noise, dropouts, jamming artifacts, range distortion? Any reference clips or recordings you could point us at would help us tune what "Signature Corrupted" looks like in our demo.

5. **Where does the existing friendly watermark actually live?** Inside the displayed video area (pilot can see it on goggles), or in the Vertical Blanking Interval / metadata channels (only visible if you know to extract them)? This is load-bearing for our pitch — we're claiming the *novel* part of BlueMark is hiding the IFF marker in VBI lines that nobody renders, so an enemy can't use it as a targeting beacon. If you've seen friendly watermarks already in VBI, we may be paralleling existing work and need to differentiate elsewhere.

6. **Are VBI lines 17–20 of NTSC actually unused on Betaflight FPV stacks today?** Or do flight-controller firmwares already write telemetry / something else there? If they're occupied, our VBI injection scheme has to find different lines.

## C. Operational decision posture

7. **False-positive vs false-negative tolerance.** In real EW ops, what's the accepted miss rate (foe missed) versus the accepted friendly-jamming rate? The numbers matter for our pitch metrics.

8. **"Unknown = eligible to jam" — operational reality?** A technical concept doc we're working from says exactly that, but you said earlier that humans are in the loop. We're assuming human-in-loop is the standard posture and "unconfirmed friendly" goes to human review — not auto-jammed. Is that right operationally, or is jam-on-uncertainty actually the default in some scenarios?

9. **Closest existing system.** Commercial or military, what's the closest analog to what we're proposing? Useful for benchmark / pitch comparison — we want to be specific about how BlueMark differs rather than hand-wave.

Thanks. Whatever you can answer fast is great; the rest can wait.

---

*(End of email body.)*

## Notes (not for the email — context for Nicholas)

- Q1, Q2, Q3, Q4 land in the "fielding realism / model tuning" bucket. Q1 + Q2 directly feed the visual classifier work; Q3 affects pitch credibility on hardware claims; Q4 informs `SIGNATURE_CORRUPTED` examples in the demo.
- Q5, Q6 are the **steganographic-IFF claim** — load-bearing for the pitch's novelty story. Q5's answer determines whether we're securing existing practice (still novel because invisible vs visible) or paralleling it (need to find another differentiator).
- Q7, Q8, Q9 are the **operational decision posture** — Q8 is most important; if "unknown = jam by default" is operationally true, our human-in-loop framing has to acknowledge that and explain why we don't propagate it.
- Skipped from the original 14-question questionnaire: Q5/Q6/Q7/Q8 (acoustic / fiber / infrasound — pitch-only), Q10 (risk-zone — dropped from MVP), Q11 (EW commander dashboard metrics — demoted).
