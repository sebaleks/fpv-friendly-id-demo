# Problem Statement

Cheap FPV drones are now disposable, mass-produced battlefield assets, but friendly identification has not scaled with them.

Higher-end systems may have drone ID, operator-station identification, or dedicated hardware-based IFF. Cheap FPVs usually do not. In contested environments, friendly EW teams may see a video or RF signal but still lack confidence that it belongs to their own pilot.

This can cause accidental self-jamming, lost missions, and confusion.

BlueMark FPV explores a non-lethal proof-of-concept identification aid for simulated FPV video:

- Add an authenticated OSD-like marker to a simulated friendly feed.
- Degrade the feed with realistic demo noise.
- Detect the marker receiver-side.
- Show a clear human-facing status: `Friendly Verified`, `Unknown`, `Corrupted`, or `Possible Spoof`.

The demo does not target, engage, jam, evade, or provide operational deployment guidance.
