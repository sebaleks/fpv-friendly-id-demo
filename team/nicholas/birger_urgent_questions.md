# Urgent clarifications for Birger — 2026-05-02 (revised)

Birger — partial answers landed via Sebastian since the original draft of this doc:

- **Human-in-loop is confirmed** (and is a hard event constraint — we'd be eliminated otherwise).
- **We're committing to Problem A**: the friendly drone embeds an authenticated OSD-style marker into its own video; a ground EW team reads the marker and classifies feeds. Problem B (drone-onboard classification of *other* drones in its FPV view) is demoted to a pitch-side mention, not an MVP track.

That closes original Q1 (receiver = ground EW team) and Q4 (decision consumer = human operator). Two questions remain. Short answers fine.

## 1. Jamming pattern

When you said "assume jammed," do you mean:

- Continuous denial — comms basically unavailable for the mission
- Intermittent denial — comms work in windows but cannot be counted on
- Defensive assumption — design as if jammed for resilience even though it usually isn't

If intermittent: roughly what fraction of friendly FPV feeds reach the EW team's receiver in a typical mission? This shapes the dashboard's "missing feed" semantics — do we show the feed-list with gaps, or assume every friendly drone's feed eventually arrives?

## 2. Receiver-side compute reality

Now that we're locked on ground-side reading by an EW team:

- What's the realistic compute envelope for the receiver — laptop, ruggedized Pi, milspec rig?
- Any constraints on resolution / latency / battery / power?
- Is there specific hardware we should target for the demo so the pitch lands as realistic, not academic?

---

That's it. The full SME questionnaire (12 questions, with post-lock relevance flags) is still in `team/nicholas/meeting_2026-05-02.md` and can be answered async. These two unblock NICK-008 architecture lock.
