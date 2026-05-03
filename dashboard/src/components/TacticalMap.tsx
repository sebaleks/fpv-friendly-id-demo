import { useState } from "react";
import type { DisplayFeed } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";

interface Props {
  feeds: DisplayFeed[];
  selectedId: string | null;
  onPick: (id: string) => void;
}

// Parse a feed's MGRS grid string ("37TFL 1842 9374") into normalized [x, y]
// in 0..1 within the AO. Mission AO is roughly 18xx–21xx easting, 92xx–94xx
// northing per the synthetic data. Falls back to deterministic hash if grid
// is missing.
function feedToMapXY(feed: DisplayFeed): [number, number] {
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
  // Deterministic fallback: two independent FNV-1a hashes with different seeds,
  // so feed_ids that differ by a single trailing char still scatter across the AO.
  const fnv = (seed: number) => {
    let h = seed >>> 0;
    for (let i = 0; i < feed.feed_id.length; i++) {
      h ^= feed.feed_id.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
  };
  const hx = fnv(0x811c9dc5);
  const hy = fnv(0x9e3779b9);
  const x = ((hx % 10000) / 10000) * 0.9 + 0.05;
  const y = ((hy % 10000) / 10000) * 0.84 + 0.08;
  return [x, y];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Force-relax marker positions so no two end up on top of each other.
// Deterministic given a stable feed order. minDist is in 0..1 map space.
function relaxPositions(
  initial: Array<[number, number]>,
  minDist = 0.09,
  iters = 40,
): Array<[number, number]> {
  const pos = initial.map(([x, y]) => [x, y] as [number, number]);
  for (let it = 0; it < iters; it++) {
    let moved = false;
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let [ax, ay] = pos[i];
        let [bx, by] = pos[j];
        let dx = bx - ax;
        let dy = by - ay;
        let d = Math.hypot(dx, dy);
        if (d === 0) {
          // Identical position — nudge j by a deterministic offset based on j.
          dx = Math.cos(j * 1.7);
          dy = Math.sin(j * 1.7);
          d = 1;
        }
        if (d < minDist) {
          const push = (minDist - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          pos[i] = [ax - nx * push, ay - ny * push];
          pos[j] = [bx + nx * push, by + ny * push];
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return pos.map(([x, y]) => [clamp(x, 0.05, 0.95), clamp(y, 0.08, 0.92)] as [number, number]);
}

function classify(state: DisplayFeed["state"]): "friendly" | "review" | "spoof" | "nosignal" {
  if (state === "POSSIBLE_SPOOF") return "spoof";
  if (state === "FRIENDLY_VERIFIED" || state === "LIKELY_FRIENDLY") return "friendly";
  if (state === "NO_SIGNAL") return "nosignal";
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

          {(() => {
            const positions = relaxPositions(feeds.map(feedToMapXY));
            return feeds.map((f, i) => {
              const [x, y] = positions[i];
              const isSelected = f.feed_id === selectedId;
              const kind = classify(f.state);
              // Suppress generic "review" overlay for NO_SIGNAL — its dashed
              // grey marker has its own visual idiom and shouldn't be tinted
              // amber like UNKNOWN/CORRUPTED feeds.
              const reviewing = NEEDS_REVIEW.has(f.state) && kind !== "nosignal";
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
            });
          })()}

          <div className="tmap-legend">
            <span className="tmap-legend-key tmap-legend-friendly"><span className="tmap-legend-swatch" /> Friendly</span>
            <span className="tmap-legend-key tmap-legend-review"><span className="tmap-legend-swatch" /> Unknown</span>
            <span className="tmap-legend-key tmap-legend-spoof"><span className="tmap-legend-swatch" /> Spoof</span>
            <span className="tmap-legend-key tmap-legend-nosignal"><span className="tmap-legend-swatch" /> No signal</span>
          </div>
        </div>
      )}
    </div>
  );
}
