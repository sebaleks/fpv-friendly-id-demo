# Agent Instructions

## Project Goal

BlueMark FPV is a hackathon proof-of-concept for helping friendly EW or receiver teams identify simulated friendly FPV video feeds through a **steganographic HMAC-authenticated marker** (production design: embedded in the Vertical Blanking Interval of the analog video, invisible to pilot and enemy) plus a receiver-side dashboard. The hackathon demo simulates the receiver-side reading via pre-generated `feeds.json`; the cryptographic and fusion logic is real.

This is a deconfliction and identification-aid demo only.

## Safety Boundaries

Do not add or advise on:

- Autonomous targeting, engagement, or fire-control logic.
- Weaponization or payload integration.
- Evasion of detection, jamming, interception, or attribution.
- Operational deployment instructions for real battlefield use.
- Guidance that makes real drones harder to identify, intercept, or defend against.

Keep all work framed around simulated video, benign identification, operator warnings, and non-lethal deconfliction.

**Hard event constraint:** the hackathon will eliminate teams whose system makes autonomous engagement decisions. Human-in-loop is required, not preferred. Every dashboard state must surface "Identification aid only. Human decision required."

## Team Work Boundaries

- Keep shared project docs concise and practical.
- After every `git pull`, agents must read `CONTEXT.md` and every `team/*/changelog.md` before continuing work.
- Read `team/work_allocation.md` before taking on teammate-scoped work.
- Do not edit another person's team area without checking their notes first.
- Before editing `team/<name>/`, read `team/<name>/suggestions.md` if it exists.
- Sebastian owns repo coordination and final integration decisions.
- Birger is the domain SME / pitch reviewer (limited coding time).

## Team Suggestions

Current teammate guidance lives in:

- `team/sebastian/suggestions.md`
- `team/arpit/suggestions.md`
- `team/nicholas/suggestions.md`
- `team/birger/suggestions.md`

Use those files to understand ownership, editable areas, avoid-touch zones, expected deliverables, and each teammate's definition of done.

## Coordination

When making meaningful changes, update `HANDOFF.md` with:

- What changed.
- Files touched.
- Any assumptions or open questions.
- Suggested next step.

For teammate-specific work, append a short entry to `team/<your-name>/changelog.md` using the format in `CONTEXT.md`.
