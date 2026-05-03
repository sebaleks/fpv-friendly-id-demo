# Demo Script

## 2-Minute Live Narration

> *Suggested presenter language for Problem Statement 2 (Edge Deployments). Sebastian as integrator can accept, edit, or replace.*

"BlueMark FPV is edge-on-edge software-only IFF for cheap analog FPV drones — the most numerous platforms in the conflict and the ones least served by traditional IFF hardware. Marker generation runs on the drone's existing flight controller. Detection runs on a backpack-portable receiver — a Pi and a fifteen-dollar capture card, or a laptop. No cloud. No central server. Zero added hardware on the drone. The system is an identification aid only — it never recommends engagement; the operator decides."

"Here the dashboard shows three incoming simulated FPV feeds. Feed A is a friendly signed feed, Feed B is unsigned and unknown, and Feed C is a friendly feed where the marker has been degraded by noise."

"Feed A has a readable OSD-like authenticated marker, so the dashboard marks it Friendly Verified. Feed B has no valid marker, so it stays Unknown. Feed C has marker-like data, but not enough clean signal to verify, so it is Signature Corrupted and needs human review."

"Every state keeps the same warning visible: Identification aid only. Human decision required. A production system would need real integration, testing, secure key management, and validation under analog-video degradation."

## Step-by-Step Click Path

1. Open the BlueMark FPV dashboard.
2. Confirm three feed panels are visible: Feed A, Feed B, Feed C.
3. Start or reset the demo sequence.
4. Point to Feed A: status should be `Friendly Verified`.
5. Point to Feed B: status should be `Unknown`.
6. Point to Feed C: status should be `Signature Corrupted / Needs Human Review`.
7. Point to confidence, signal quality, and the persistent human decision warning.
8. If available, toggle degradation or spoof view only after the MVP flow is shown.

## What To Say For Each State

- `Friendly Verified`: "The marker sequence is valid across enough windows. This suggests friendly, but it is still only an identification aid."
- `Unknown`: "No valid marker was found. The system does not guess; it leaves this feed unknown."
- `Signature Corrupted`: "Marker-like data exists, but degradation prevents verification. The operator needs to review it."
- `Possible Spoof`: "The feed has marker-like data, but timing or authentication checks fail. This should be treated as suspicious, not automatically acted on."

## 30-Second Emergency Version

"BlueMark FPV helps a human operator classify simulated FPV feeds. Feed A has a valid signed marker and shows Friendly Verified. Feed B has no marker and shows Unknown. Feed C has degraded marker data and shows Signature Corrupted / Needs Human Review. The dashboard always says: Identification aid only. Human decision required. This is not targeting, not weaponization, and not production-grade IFF."

## Closing Sentence

"The value is clearer human deconfliction at the tactical edge — running entirely on hardware already in the field, in the austere, EW-contested, disconnected environments where IFF actually has to work."
