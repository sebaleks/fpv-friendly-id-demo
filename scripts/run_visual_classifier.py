"""Run a pretrained drone-detection YOLO model on demo images and emit
visual_profile overrides per feed.

**Owner:** Sebastian (he has GPU, but CPU inference is fine for the demo).

**Recommended weights:** `doguilmak/Drone-Detection-YOLOv8x` from HuggingFace.
Export to ONNX via Ultralytics, then run with `onnxruntime`. No fine-tuning;
no training data; no GPU strictly required.

```bash
pip install -e .[ml]                                                      # install ml extras
huggingface-cli download doguilmak/Drone-Detection-YOLOv8x --local-dir weights/
python -c "from ultralytics import YOLO; YOLO('weights/best.pt').export(format='onnx')"
python scripts/run_visual_classifier.py
```

**Output contract:** writes `demo_assets/visual_profile_overrides.json`
mapping `feed_id` → `{"score": float, "label": str}`. The label must be one
of `known_friendly_fpv` / `known_friendly_fixedwing` /
`known_friendly_mavic_style` / `unknown_drone_like` / `background_or_noise`
(see `docs/fusion_architecture.md`). Pretrained YOLO outputs are mapped to
`unknown_drone_like` by default; per-feed overrides for `known_friendly_*`
come from `demo_assets/friendly_overrides.json` (a hand-labeled file that
says "in this clip, the drone we authenticated *via marker* is FPV-class").

**Why hand-labels for known_friendly:** an off-the-shelf YOLO can't distinguish
"a friendly Ukrainian FPV" from "any drone in the sky." The HMAC marker is
the authoritative friendly signal; visual_profile is supporting evidence and
is allowed to be coarse.

`scripts/generate_feeds.py` reads this file when present and prefers it over
simulated values; falls back to simulated values when absent.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "demo_assets" / "visual_profile_overrides.json"


def run_real_inference() -> dict[str, dict] | None:
    """TODO(Sebastian): wire the pretrained YOLO via onnxruntime here.

    Pseudocode:
        import onnxruntime as ort
        from PIL import Image
        session = ort.InferenceSession("weights/drone-detection-yolov8x.onnx",
                                       providers=["CPUExecutionProvider"])
        results = {}
        for feed_id, image_path in DEMO_IMAGES.items():
            img = preprocess(Image.open(image_path))
            output = session.run(None, {"images": img})
            score, _bbox = top_drone_detection(output)
            label = friendly_overrides.get(feed_id, "unknown_drone_like")
            results[feed_id] = {"score": float(score), "label": label}
        return results

    Until wired, return None so the caller falls back to simulated values.
    """
    return None


# Simulated values used until real inference is wired. Mirrors the
# defaults inside scripts/generate_feeds.py so the dashboard looks
# identical whether or not Sebastian has run the model yet.
SIMULATED_OVERRIDES = {
    "FEED-A": {"score": 0.92, "label": "known_friendly_fpv"},
    "FEED-B": {"score": 0.55, "label": "unknown_drone_like"},
    "FEED-C": {"score": 0.00, "label": "background_or_noise"},
    "FEED-D": {"score": 0.30, "label": "unknown_drone_like"},
    "FEED-E": {"score": 0.61, "label": "unknown_drone_like"},
}


def main() -> None:
    real = run_real_inference()
    overrides = real if real is not None else SIMULATED_OVERRIDES
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(overrides, indent=2) + "\n")
    source = "real ONNX inference" if real is not None else "simulated values (model not wired yet)"
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(overrides)} entries) — {source}.")


if __name__ == "__main__":
    main()
