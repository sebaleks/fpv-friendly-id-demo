# CONTEXT.md — read me first, every pull

You are an AI agent helping a teammate work on **BlueMark FPV**. Read this file at the start of every session and immediately after every `git pull`. This file is read-only — propose changes to the project owner instead of editing it.

## Project

BlueMark FPV is a hackathon proof-of-concept for friendly identification of cheap FPV drone video signals via a steganographic HMAC-authenticated marker (embedded in the unrendered VBI lines of the analog video) plus a receiver-side dashboard. **Five states:** `FRIENDLY_VERIFIED`, `LIKELY_FRIENDLY`, `UNKNOWN_NEEDS_REVIEW`, `SIGNATURE_CORRUPTED`, `POSSIBLE_SPOOF`.

## Safety boundary (hard line)

Identification aid only. Human-in-the-loop. **Do not** add, advise on, or implement: autonomous targeting, engagement, weaponization, jamming, evasion, or operational deployment guidance. Full list in `AGENTS.md`.

## Canonical docs (read once per session, in this order)

1. `AGENTS.md` — root agent rules and safety boundary
2. `docs/problem_statement.md` — why this exists
3. `docs/demo_plan.md` — what the demo does end to end
4. `team/work_allocation.md` — who owns what
5. `team/<your-owner>/suggestions.md` — your owner's charter

## Shared evolving context — read every changelog after every pull

After every `git pull`, read every file matching `team/*/changelog.md`. This is how teammates' agents broadcast what changed without merge conflicts. Newest entries are at the top of each file.

If your owner's changelog doesn't exist yet, create `team/<your-owner>/changelog.md` and add your first entry using the format below.

## Your write surface (conflict-free by partition)

You may **append** to exactly one file: `team/<your-owner>/changelog.md`.

Do **not** edit:
- Any other teammate's changelog or files under `team/<other>/**`.
- This file (`CONTEXT.md`) — propose changes to the owner.
- `AGENTS.md`, `README.md`, `HANDOFF.md`, `docs/`, `team/work_allocation.md` — Sebastian-owned. Coordinate before touching.
- `.githooks/**` — coordination layer; treat as read-only.

If the work you're doing requires editing a file outside your write surface, **stop and ask the owner first**.

## Why this design works

Per-author changelogs cannot conflict across authors because no two agents touch the same file. Direct push to `main` stays safe so long as you stayed inside your write surface. The git hook in `.githooks/` reminds the human to tell their AI to re-read context after every pull.

## Changelog entry format

Append at the **top** of `team/<your-owner>/changelog.md` (newest first). Template:

```
### YYYY-MM-DD HH:MM - <Owner name> (via <agent stack>)

- Changed: <what changed>
- Files: <files touched>
- Why: <one-sentence reason>
- Assumptions: <if any>
- Open questions: <if any>
- Next step: <what should happen next>
```

Keep entries short — one paragraph of bullets, not prose.
