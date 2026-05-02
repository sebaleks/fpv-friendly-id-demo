# Demo Storyboard

## 1. Setup

Show a simulated FPV video feed and a simple receiver dashboard.

## 2. Friendly Signal

The feed includes an authenticated OSD-style marker. The receiver detects it and shows `Friendly Verified`.

## 3. Degraded Signal

Noise, compression artifacts, or partial obstruction make the marker harder to read. The receiver shows `Corrupted` or `Unknown`.

## 4. Unknown Signal

A feed without a valid marker appears. The receiver shows `Unknown`.

## 5. Possible Spoof

A suspicious or malformed marker appears. The receiver shows `Possible Spoof` and highlights that a human must decide what to do.

## 6. Closing Message

BlueMark FPV is an identification aid for deconfliction. It does not automate engagement or provide operational drone guidance.
