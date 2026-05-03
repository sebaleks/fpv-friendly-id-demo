"""Run a pretrained YOLO model on per-feed sample frames and emit
visual_profile overrides + a per-feed classifier log.

**Owner:** Sebastian. Stretch task T5. Demo runs without this — graceful
fallback to simulated values when weights or frames are absent.

## Setup (one time)

```bash
pip install -e ".[ml]"
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt').export(format='onnx', opset=12)"
mv yolov8n.onnx weights/
```

YOLOv8n is the deliberate choice over YOLOv8x for the live demo:
~12 MB ONNX, ~15 ms post-warmup CPU inference. Same inference contract,
no awkward stage silence on first click.

## Run

```bash
# drop one frame per feed_id at demo_assets/sample_frames/<feed_id>.jpg
# (e.g. feed_a.jpg, feed_b.jpg). Lowercased ids.
python scripts/run_visual_classifier.py
```

## Output contract

Writes two files:

1. `demo_assets/visual_profile_overrides.json` — consumed by
   `scripts/generate_feeds.py`. Maps `feed_id` -> `{"score": float,
   "label": str}` where label is one of the controlled vocab in
   `docs/fusion_architecture.md`.

2. `demo_assets/classifier_log.json` — machine-readable log of every
   inference: feed_id, source frame, raw top class, raw confidence,
   final mapped label, mapping rationale, inference latency. Intended
   for the dashboard "Last classified" surface (Arpit-coordinated).

## Safety

A pretrained COCO-class YOLO **cannot** distinguish "a friendly Ukrainian
FPV" from "any drone in the sky." This script maps any drone-like
detection to `unknown_drone_like` regardless of how confident YOLO is.
Promotion to `known_friendly_*` MUST come from
`demo_assets/friendly_overrides.json` — a hand-labeled file maintained by
a human who has confirmed the feed is HMAC-marker authenticated. The
HMAC marker is the source of truth; the visual signal is supporting
evidence only. This invariant is enforced by `_resolve_label()`.

## Graceful fallback

If `weights/yolov8n.onnx` is missing OR no frames are present, the script
exits 0 with a clear message and falls back to writing simulated values
identical to `scripts/generate_feeds.py`'s defaults. The demo remains
runnable on a fresh checkout with no ML setup.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
WEIGHTS = ROOT / "weights" / "yolov8n.onnx"
FRAMES_DIR = ROOT / "demo_assets" / "sample_frames"
FRIENDLY_OVERRIDES = ROOT / "demo_assets" / "friendly_overrides.json"
OVERRIDES_OUT = ROOT / "demo_assets" / "visual_profile_overrides.json"
LOG_OUT = ROOT / "demo_assets" / "classifier_log.json"

# COCO class indices for things that look "drone-like" enough to surface as
# unknown_drone_like. YOLOv8 has no native "drone" class; airplane is the
# closest semantic match. Bird is included because small drones at distance
# get misclassified as birds by COCO models — for an *attention-bias*
# signal that's still useful info.
DRONE_LIKE_COCO_IDS = {4, 14}  # airplane, bird

# Simulated fallback values (mirror generate_feeds.py defaults).
SIMULATED_OVERRIDES = {
    "FEED-A": {"score": 0.92, "label": "known_friendly_fpv"},
    "FEED-B": {"score": 0.55, "label": "unknown_drone_like"},
    "FEED-C": {"score": 0.00, "label": "background_or_noise"},
    "FEED-D": {"score": 0.30, "label": "unknown_drone_like"},
    "FEED-E": {"score": 0.61, "label": "unknown_drone_like"},
}


def _load_friendly_overrides() -> dict[str, dict[str, str]]:
    if not FRIENDLY_OVERRIDES.exists():
        return {}
    data = json.loads(FRIENDLY_OVERRIDES.read_text())
    return data.get("overrides", {})


# NICK-029: explicit allow-list for visual_profile labels. Belt-and-suspenders
# alongside the data-flow safety invariant.
ALLOWED_LABELS = frozenset({
    "known_friendly_fpv",
    "known_friendly_fixedwing",
    "known_friendly_mavic_style",
    "unknown_drone_like",
    "background_or_noise",
})


def _resolve_label(feed_id: str, yolo_label: str, friendly: dict[str, dict[str, str]]) -> tuple[str, str]:
    """Return (final_label, rationale).

    SAFETY-CRITICAL: never derive a known_friendly_* label from YOLO output.
    Only the hand-labeled friendly_overrides.json may promote a feed to a
    known_friendly_* class.

    NICK-029: enforce two assertions — (a) hand-label values must be in the
    controlled vocab so a typo doesn't propagate to the dashboard, and (b) the
    YOLO label can never start with "known_friendly_" so the safety invariant
    is enforced at runtime, not just by data flow.
    """
    if feed_id in friendly:
        entry = friendly[feed_id]
        label = entry["label"]
        assert label in ALLOWED_LABELS, (
            f"Hand-label '{label}' for {feed_id} is not in the controlled "
            f"vocabulary {sorted(ALLOWED_LABELS)}; check demo_assets/friendly_overrides.json"
        )
        return label, f"hand-label override: {entry.get('rationale', 'no rationale provided')}"
    assert not yolo_label.startswith("known_friendly_"), (
        f"YOLO produced disallowed friendly label '{yolo_label}' for {feed_id}; "
        "only hand-labels can promote a feed to known_friendly_*"
    )
    assert yolo_label in ALLOWED_LABELS, (
        f"YOLO label '{yolo_label}' for {feed_id} is not in the controlled "
        f"vocabulary {sorted(ALLOWED_LABELS)}"
    )
    return yolo_label, "from pretrained YOLO inference; no hand-label override present"


def _find_frame(feed_id: str) -> Path | None:
    base = feed_id.lower().replace("-", "_")  # FEED-A -> feed_a
    for ext in (".jpg", ".jpeg", ".png"):
        p = FRAMES_DIR / f"{base}{ext}"
        if p.exists():
            return p
    return None


def _preprocess(image_path: Path) -> Any:
    from PIL import Image
    import numpy as np

    img = Image.open(image_path).convert("RGB").resize((640, 640))
    arr = np.asarray(img, dtype=np.float32) / 255.0  # HWC, [0,1]
    arr = arr.transpose(2, 0, 1)[None, ...]  # NCHW
    return np.ascontiguousarray(arr)


def _top_detection(output: Any) -> tuple[int, float]:
    """YOLOv8 raw output is (1, 84, 8400): 4 box coords + 80 class scores per anchor.
    Return (top_class_id, top_score) across all anchors and classes.
    """
    import numpy as np

    raw = output[0][0]  # (84, 8400)
    class_scores = raw[4:, :]  # (80, 8400)
    flat_idx = int(np.argmax(class_scores))
    cls = flat_idx // class_scores.shape[1]
    anchor = flat_idx % class_scores.shape[1]
    score = float(class_scores[cls, anchor])
    return cls, score


def _classify_frame(session: Any, frame: Path) -> tuple[str, float, dict]:
    """Returns (yolo_label, score, raw_record)."""
    inp = _preprocess(frame)
    inp_name = session.get_inputs()[0].name
    t0 = time.time()
    out = session.run(None, {inp_name: inp})
    latency_ms = (time.time() - t0) * 1000.0

    cls, score = _top_detection(out)
    if cls in DRONE_LIKE_COCO_IDS and score >= 0.25:
        yolo_label = "unknown_drone_like"
    elif score < 0.10:
        yolo_label = "background_or_noise"
    else:
        # Detected something with confidence but not drone-like (person, car, etc.)
        # In a real FPV context this is more likely background than friendly.
        yolo_label = "background_or_noise"

    raw = {
        "top_class_id": cls,
        "top_class_score": round(score, 4),
        "latency_ms": round(latency_ms, 1),
        "yolo_label": yolo_label,
    }
    return yolo_label, score, raw


def run_real_inference() -> tuple[dict[str, dict], list[dict]] | None:
    """Returns (overrides, log) when real inference ran; None to fall back.

    Falls back if weights are missing or no frames exist for any feed.
    """
    if not WEIGHTS.exists():
        print(f"  weights not found at {WEIGHTS.relative_to(ROOT)} — falling back to simulated values.", file=sys.stderr)
        return None

    feed_ids = list(SIMULATED_OVERRIDES.keys())
    found_frames = {fid: _find_frame(fid) for fid in feed_ids}
    if not any(found_frames.values()):
        print(f"  no frames found in {FRAMES_DIR.relative_to(ROOT)} — falling back to simulated values.", file=sys.stderr)
        return None

    import onnxruntime as ort

    print(f"  loading {WEIGHTS.relative_to(ROOT)} (CPU provider)...")
    session = ort.InferenceSession(str(WEIGHTS), providers=["CPUExecutionProvider"])

    # Warmup
    import numpy as np
    inp_name = session.get_inputs()[0].name
    session.run(None, {inp_name: np.zeros((1, 3, 640, 640), dtype=np.float32)})

    friendly = _load_friendly_overrides()
    overrides: dict[str, dict] = {}
    log: list[dict] = []

    for feed_id, frame in found_frames.items():
        if frame is None:
            # No frame for this feed — leave it to generate_feeds.py simulated default.
            log.append({"feed_id": feed_id, "status": "no_frame", "fallback": SIMULATED_OVERRIDES[feed_id]})
            continue

        yolo_label, score, raw = _classify_frame(session, frame)
        final_label, rationale = _resolve_label(feed_id, yolo_label, friendly)
        overrides[feed_id] = {"score": round(score, 4), "label": final_label}
        log.append({
            "feed_id": feed_id,
            "frame": str(frame.relative_to(ROOT)),
            "raw": raw,
            "final_label": final_label,
            "rationale": rationale,
            "ts": int(time.time()),
        })
        print(f"  {feed_id}: yolo={yolo_label} score={score:.2f} -> final={final_label} ({raw['latency_ms']}ms)")

    return overrides, log


def main() -> None:
    print(f"run_visual_classifier.py — checking for real inference...")
    real = run_real_inference()
    if real is not None:
        overrides, log = real
        OVERRIDES_OUT.parent.mkdir(parents=True, exist_ok=True)
        OVERRIDES_OUT.write_text(json.dumps(overrides, indent=2) + "\n")
        LOG_OUT.write_text(json.dumps({"generated_at": int(time.time()), "entries": log}, indent=2) + "\n")
        source = f"real ONNX inference ({len(overrides)} feeds)"
    else:
        OVERRIDES_OUT.parent.mkdir(parents=True, exist_ok=True)
        OVERRIDES_OUT.write_text(json.dumps(SIMULATED_OVERRIDES, indent=2) + "\n")
        # Write an empty log so dashboard surface degrades gracefully.
        LOG_OUT.write_text(json.dumps({"generated_at": int(time.time()), "entries": [], "fallback_reason": "weights or frames missing"}, indent=2) + "\n")
        source = "simulated values (graceful fallback)"

    print(f"Wrote {OVERRIDES_OUT.relative_to(ROOT)} — {source}.")
    print(f"Wrote {LOG_OUT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
