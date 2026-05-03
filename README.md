# BlueMark FPV

**Steganographic IFF for cheap analog FPV drones.** A receiver-side identification aid that helps a human operator decide whether an incoming FPV video feed belongs to their own pilot.

> Hackathon demo. Not production. Identification aid only — human decision required.

## What it does (in one sentence)

A friendly drone embeds a cryptographic HMAC marker into the **Vertical Blanking Interval** of its analog video — lines of the signal that no goggle, no screen, and no enemy capture device renders. A receiver (laptop or Pi + ~$15 capture card) extracts those lines, validates the HMAC, fuses with mission manifest + supporting signals, and surfaces one of five operator-facing states.

## Why it exists

- Cheap mass-produced FPV drones can't carry IFF hardware that costs more than the drone.
- Existing visible watermarks (which friendly forces deploy today) become enemy targeting beacons.
- The gap is an *invisible* friendly identification channel that scales to disposable platforms — no added BOM cost, just firmware.

## Five dashboard states

| State | Meaning |
|---|---|
| `FRIENDLY_VERIFIED` | HMAC valid + fresh + mission match + supporting signal. |
| `LIKELY_FRIENDLY` | HMAC valid + fresh + mission match, but no supporting corroboration. |
| `UNKNOWN_NEEDS_REVIEW` | No valid friendly marker. **Unknown is not foe.** Human reviews. |
| `SIGNATURE_CORRUPTED` | Marker-like bytes present but undecodable — degraded link or noise. |
| `POSSIBLE_SPOOF` | Marker decoded but fails HMAC, freshness, or mission check. |

The system **never** recommends engagement, jamming, or any action. Human decides. See `AGENTS.md` for the safety boundary; this is also a hard hackathon-judging constraint.

## Repo map

| Path | What's there |
|---|---|
| `src/bluemark/` | Python core: HMAC marker (`marker.py`), 5-state fusion (`fusion.py`), Pydantic schemas (`schemas.py`). |
| `tests/` | pytest coverage for fusion + marker. 12/12 passing. |
| `scripts/` | `generate_feeds.py` (Python → `dashboard/public/feeds.json`); `run_visual_classifier.py` (Sebastian's ONNX hookup point). |
| `dashboard/` | React + Vite + TypeScript SPA. Reads `feeds.json`. |
| `demo_assets/` | `mission_manifest.json`, `session_log.json`, `visual_profile_overrides.json`. |
| `docs/` | Architecture + demo + dashboard-states + cost-tier docs. Start with `docs/steganographic_iff.md`. |
| `team/` | Per-teammate folders + cross-agent context system (changelogs, suggestions). |
| `CONTEXT.md` | Read-me-first prompt for any AI agent working in this repo. |
| `AGENTS.md` | Safety boundaries + agent rules. |
| `HANDOFF.md` | Coordination log. |

## Quick start

```bash
# 1. Python core + fusion
pip install -e ".[dev]"
pytest tests/                                   # 12/12 should pass

# 2. Generate the demo's pre-computed detector output
python scripts/generate_feeds.py                # writes dashboard/public/feeds.json

# 3. Open the dashboard
cd dashboard && npm install && npm run dev      # http://localhost:5174
```

Optional, for Sebastian's ML track:

```bash
pip install -e ".[ml]"                          # onnxruntime + ultralytics + pillow
python scripts/run_visual_classifier.py         # writes demo_assets/visual_profile_overrides.json
                                                # (currently emits simulated values; real ONNX hookup is a TODO)
python scripts/generate_feeds.py                # regenerates feeds.json with real visual scores
```

## Hackathon scope (what's real vs simulated)

- **Real:** the cryptographic HMAC primitive, the 5-state fusion logic, the dashboard, the schemas, the test coverage.
- **Simulated:** the analog video pipeline. We don't actually inject into VBI or extract from a live capture in the demo — the bytes from `generate_feeds.py` stand in for what a real receiver would produce. Production deployment requires the Betaflight firmware fork + commodity capture rig. See `docs/steganographic_iff.md`.

## Pitch

Cheap FPVs can't carry IFF hardware. Visible watermarks become enemy targeting beacons. BlueMark hides cryptographic IFF in VBI — invisible to enemy, unforgeable, deployable via firmware flash. ~$50 receiver hardware. ~$0 added per drone.

## Safety

- Identification aid only. Human-in-the-loop is required (hard hackathon-judging constraint).
- No autonomous targeting / engagement / jamming / evasion / weaponization.
- No "foe" label is ever produced. The system says "friendly" or "not-confirmed-friendly" — never "hostile."

See `AGENTS.md` for the full safety boundary.
