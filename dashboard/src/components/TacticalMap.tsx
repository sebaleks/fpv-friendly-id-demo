import { useState } from "react";
import type { FusionResult } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";

interface Props {
  feeds: FusionResult[];
  selectedId: string | null;
  onPick: (id: string) => void;
}

// Parse a feed's MGRS grid string ("37TFL 1842 9374") into normalized [x, y]
// in 0..1 within the AO. Mission AO is roughly 18xx–21xx easting, 92xx–94xx
// northing per the synthetic data. Falls back to deterministic hash if grid
// is missing.
function feedToMapXY(feed: FusionResult): [number, number] {
  if (feed.grid) {
    const parts = feed.grid.split(" ");
    const e = parseInt(parts[1], 10);
    const n = parseInt(parts[2], 10);
    if (!Number.isNaN(e) && !Number.isNaN(n)) {
      const x = (e - 1800) / 350;
      const y = 1 - (n - 9250) / 200; // invert: north is up
      return [clamp(x, 0.05, 0.95), clamp(y, 0.08, 0.92)];
    }
  }
  // Deterministic fallback from feed_id hash
  let h = 0;
  for (let i = 0; i < feed.feed_id.length; i++) h = (h * 31 + feed.feed_id.charCodeAt(i)) | 0;
  const x = ((Math.abs(h) % 1000) / 1000) * 0.9 + 0.05;
  const y = ((Math.abs(h >> 10) % 1000) / 1000) * 0.84 + 0.08;
  return [x, y];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function classify(state: FusionResult["state"]): "friendly" | "review" | "spoof" {
  if (state === "POSSIBLE_SPOOF") return "spoof";
  if (state === "FRIENDLY_VERIFIED" || state === "LIKELY_FRIENDLY") return "friendly";
  return "review"; // UNKNOWN_NEEDS_REVIEW + SIGNATURE_CORRUPTED
}

export default function TacticalMap({ feeds, selectedId, onPick }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`tmap ${collapsed ? "tmap-collapsed" : ""}`}>
      <div className="tmap-head">
        <div className="tmap-title">
          <span className="tmap-dot" />
          Tactical map
          <span className="tmap-zone">· 37TFL</span>
        </div>
        <button className="tmap-toggle" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? "▲" : "▼"}
        </button>
      </div>

      {!collapsed && (
        <div className="tmap-body">
          <div className="tmap-terrain" />
          <svg className="tmap-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
            ))}
            <rect x="8" y="10" width="84" height="80" fill="none" stroke="rgba(77,143,245,0.25)" strokeWidth="0.3" strokeDasharray="2 2" />
            <g transform="translate(14, 86)">
              <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="rgba(77,143,245,0.7)" strokeWidth="0.4" />
              <text x="6" y="2" fill="rgba(154,163,175,0.7)" fontSize="3" fontFamily="JetBrains Mono, monospace">FOB</text>
            </g>
          </svg>

          {feeds.map((f) => {
            const [x, y] = feedToMapXY(f);
            const isSelected = f.feed_id === selectedId;
            const kind = classify(f.state);
            const reviewing = NEEDS_REVIEW.has(f.state);
            return (
              <button
                key={f.feed_id}
                className={[
                  "tmap-marker",
                  `tmap-marker-${kind}`,
                  isSelected && "tmap-marker-selected",
                  reviewing && "tmap-marker-review",
                ].filter(Boolean).join(" ")}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                onClick={() => onPick(f.feed_id)}
                title={`${f.feed_id} · ${STATE_LABEL[f.state]}`}
              >
                {isSelected && <span className="tmap-pulse" />}
                <span className="tmap-glyph" />
                {isSelected && <span className="tmap-marker-label">{f.feed_id}</span>}
              </button>
            );
          })}

          <div className="tmap-legend">
            <span className="tmap-legend-key tmap-legend-friendly"><span className="tmap-legend-swatch" /> Friendly</span>
            <span className="tmap-legend-key tmap-legend-review"><span className="tmap-legend-swatch" /> Unknown</span>
            <span className="tmap-legend-key tmap-legend-spoof"><span className="tmap-legend-swatch" /> Spoof</span>
          </div>
        </div>
      )}
    </div>
  );
}
