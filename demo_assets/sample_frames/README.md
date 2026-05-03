# Sample Frames

`scripts/run_visual_classifier.py` reads frames from this directory and writes per-feed visual scores into `demo_assets/visual_profile_overrides.json`.

## File naming convention

One image per feed_id, lowercased: `feed_a.jpg`, `feed_b.jpg`, `feed_c.jpg`, `feed_d.jpg`, `feed_e.jpg`. PNG also accepted.

If a feed_id has no matching frame, the classifier does not write an override for it — `scripts/generate_feeds.py` falls back to its simulated visual_profile values for that feed.

## What's checked in

- `placeholder.png` — synthetic crude drone silhouette on sky background. Used for smoke testing the pipeline. **Replace with real footage before the live demo.**

`*.jpg` / `*.jpeg` / `*.png` (other than `placeholder.png`) are gitignored — do not commit real FPV footage to the public repo.

## Safety

A pretrained off-the-shelf YOLO trained on COCO **cannot** distinguish "a friendly Ukrainian FPV" from "any drone in the sky." The classifier maps any drone-like detection to `unknown_drone_like` by default. The `known_friendly_*` labels only come from `demo_assets/friendly_overrides.json` (hand-labeled, marker-authenticated feeds). The HMAC marker is the source of truth for friendliness; the visual signal is supporting evidence only.
