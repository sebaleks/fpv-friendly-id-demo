import { useState, useMemo } from "react";
import type { DisplayFeed } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";
import SfBasemap, { latLngToXY, FOB_LATLNG } from "./SfBasemap";

interface Props {
  feeds: DisplayFeed[];
  selectedId: string | null;
  onPick: (id: string) => void;
  // Layout mode:
  //   "primary"  — fills the main pane (overview / no feed selected)
  //   "docked"   — right-column peer of FeedDetail
  //   "fullscreen" — modal overlay maximized over everything
  mode: "primary" | "docked" | "fullscreen";
  onMaximize?: () => void;
  onMinimize?: () => void;
}

// Fixed engagement / threat radius rendered around POSSIBLE_SPOOF markers.
// In 0..1 map space; ~0.10 ≈ 350m given the synthetic AO scale.
const THREAT_RING_R = 0.10;

// Project a feed onto the map. Prefers real lat/lng (SF basemap); falls back
// to MGRS grid string; final fallback is a deterministic FNV-1a hash so even
// telemetry-less synth rows (NO_SIGNAL placeholders) scatter.
function feedToMapXY(feed: DisplayFeed): [number, number] {
  if (feed.lat != null && feed.lng != null) {
    const [x, y] = latLngToXY(feed.lat, feed.lng);
    return [clamp(x, 0.05, 0.95), clamp(y, 0.08, 0.92)];
  }
  if (feed.grid) {
    const parts = feed.grid.split(" ");
    const e = parseInt(parts[1], 10);
    const n = parseInt(parts[2], 10);
    if (!Number.isNaN(e) && !Number.isNaN(n)) {
      const x = (e - 1800) / 350;
      const y = 1 - (n - 9250) / 200;
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

// Synthesized heading per feed (degrees, 0=N, clockwise). Deterministic from
// feed_id so the chevron doesn't flicker. TODO(agent): replace with real
// `heading_deg` field on FusionResult once the firmware/telemetry pipeline
// surfaces it. Add `heading_deg?: number` to types.ts and prefer it here
// when present.
function feedHeading(feed: DisplayFeed): number {
  if ((feed as { heading_deg?: number }).heading_deg != null) {
    return (feed as { heading_deg?: number }).heading_deg!;
  }
  let h = 0;
  for (let i = 0; i < feed.feed_id.length; i++) h = (h * 33 + feed.feed_id.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
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
  return "review";
}

// FOB anchored at a real SF coordinate (Pier 33 area).
const FOB_XY: [number, number] = latLngToXY(FOB_LATLNG[0], FOB_LATLNG[1]);
// AO width in km — Embarcadero/FiDi bbox ≈ 2.7km E-W at this latitude.
const AO_KM = 2.7;

function bearingDegFromFOB(x: number, y: number): number {
  const dx = x - FOB_XY[0];
  const dy = -(y - FOB_XY[1]); // screen Y is inverted vs north-up
  const rad = Math.atan2(dx, dy);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function distanceKmFromFOB(x: number, y: number): number {
  const dx = x - FOB_XY[0];
  const dy = y - FOB_XY[1];
  return Math.hypot(dx, dy) * AO_KM;
}

export default function TacticalMap({ feeds, selectedId, onPick, mode, onMaximize, onMinimize }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positions = useMemo(() => relaxPositions(feeds.map(feedToMapXY)), [feeds]);

  const hoveredIdx = hoveredId ? feeds.findIndex((f) => f.feed_id === hoveredId) : -1;
  const hovered = hoveredIdx >= 0 ? feeds[hoveredIdx] : null;
  const hoveredXY = hoveredIdx >= 0 ? positions[hoveredIdx] : null;

  return (
    <div className={`tmap tmap-${mode}`}>
      <div className="tmap-head">
        <div className="tmap-title">
          <span className="tmap-dot" />
          Tactical map
          <span className="tmap-zone">· 37TFL · {AO_KM}km AO</span>
        </div>
        <div className="tmap-actions">
          {mode !== "fullscreen" && onMaximize && (
            <button className="tmap-toggle" onClick={onMaximize} title="Maximize map">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M1 4 V1 H4 M8 1 H11 V4 M11 8 V11 H8 M4 11 H1 V8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          )}
          {mode === "fullscreen" && onMinimize && (
            <button className="tmap-toggle" onClick={onMinimize} title="Close (Esc)">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="tmap-body">
        <SfBasemap />
        <svg className="tmap-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
          ))}
          <rect x="8" y="10" width="84" height="80" fill="none" stroke="rgba(77,143,245,0.25)" strokeWidth="0.3" strokeDasharray="2 2" />
          <g transform={`translate(${FOB_XY[0] * 100}, ${FOB_XY[1] * 100})`}>
            <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="rgba(77,143,245,0.7)" strokeWidth="0.4" />
            <text x="6" y="2" fill="rgba(154,163,175,0.7)" fontSize="3" fontFamily="JetBrains Mono, monospace">FOB</text>
          </g>
          {/* North arrow + scale bar */}
          <g transform="translate(94, 10)">
            <line x1="0" y1="0" x2="0" y2="-6" stroke="rgba(154,163,175,0.7)" strokeWidth="0.4" />
            <path d="M-1.2 -4 L0 -6 L1.2 -4 Z" fill="rgba(154,163,175,0.7)" />
            <text x="-1.2" y="2.2" fill="rgba(154,163,175,0.7)" fontSize="3" fontFamily="JetBrains Mono, monospace">N</text>
          </g>
          {/* Threat range rings — only on spoof markers. SVG so they
              scale cleanly with the map regardless of layout mode. */}
          {feeds.map((f, i) => {
            if (f.state !== "POSSIBLE_SPOOF") return null;
            const [x, y] = positions[i];
            return (
              <g key={`ring-${f.feed_id}`} className="tmap-threat-ring" transform={`translate(${x * 100}, ${y * 100})`}>
                <circle r={THREAT_RING_R * 100} fill="none" stroke="rgba(213,72,72,0.35)" strokeWidth="0.4" strokeDasharray="1.5 1.2" />
                <circle r={THREAT_RING_R * 60} fill="rgba(213,72,72,0.06)" stroke="rgba(213,72,72,0.25)" strokeWidth="0.3" />
              </g>
            );
          })}
        </svg>

        {feeds.map((f, i) => {
          const [x, y] = positions[i];
          const isSelected = f.feed_id === selectedId;
          const isHovered = f.feed_id === hoveredId;
          const kind = classify(f.state);
          const reviewing = NEEDS_REVIEW.has(f.state) && kind !== "nosignal";
          const showHeading = kind === "friendly";
          const heading = showHeading ? feedHeading(f) : 0;
          return (
            <button
              key={f.feed_id}
              className={[
                "tmap-marker",
                `tmap-marker-${kind}`,
                isSelected && "tmap-marker-selected",
                isHovered && "tmap-marker-hovered",
                reviewing && "tmap-marker-review",
              ].filter(Boolean).join(" ")}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              onClick={() => onPick(f.feed_id)}
              onMouseEnter={() => setHoveredId(f.feed_id)}
              onMouseLeave={() => setHoveredId((h) => (h === f.feed_id ? null : h))}
              title={`${f.feed_id} · ${STATE_LABEL[f.state]}`}
            >
              {isSelected && <span className="tmap-pulse" />}
              {showHeading ? (
                <span className="tmap-chevron" style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}>
                  <svg width="100%" height="100%" viewBox="0 0 10 10" aria-hidden>
                    <path d="M5 1 L8.5 8.5 L5 7 L1.5 8.5 Z" fill="currentColor" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : (
                <span className="tmap-glyph" />
              )}
              {(isSelected || isHovered) && <span className="tmap-marker-label">{f.feed_id}</span>}
            </button>
          );
        })}

        {/* Bearing/distance readout — top-left HUD pill. Shows hovered marker;
            falls back to selected when nothing is hovered. */}
        {(() => {
          const target = hovered ? { f: hovered, xy: hoveredXY! } : (() => {
            if (!selectedId) return null;
            const idx = feeds.findIndex((x) => x.feed_id === selectedId);
            return idx >= 0 ? { f: feeds[idx], xy: positions[idx] } : null;
          })();
          if (!target) return null;
          const [tx, ty] = target.xy;
          const brg = Math.round(bearingDegFromFOB(tx, ty));
          const dist = distanceKmFromFOB(tx, ty);
          return (
            <div className="tmap-readout">
              <span className="tmap-readout-id">{target.f.feed_id}</span>
              <span className="tmap-readout-sep">·</span>
              <span className="tmap-readout-grid">{target.f.grid ?? "—"}</span>
              <span className="tmap-readout-sep">·</span>
              <span className="tmap-readout-brg">brg {String(brg).padStart(3, "0")}°</span>
              <span className="tmap-readout-sep">·</span>
              <span className="tmap-readout-dist">{dist.toFixed(1)} km</span>
            </div>
          );
        })()}

        <div className="tmap-legend">
          <span className="tmap-legend-key tmap-legend-friendly"><span className="tmap-legend-swatch" /> Friendly</span>
          <span className="tmap-legend-key tmap-legend-review"><span className="tmap-legend-swatch" /> Unknown</span>
          <span className="tmap-legend-key tmap-legend-spoof"><span className="tmap-legend-swatch" /> Spoof</span>
          <span className="tmap-legend-key tmap-legend-nosignal"><span className="tmap-legend-swatch" /> No signal</span>
        </div>
      </div>
    </div>
  );
}
