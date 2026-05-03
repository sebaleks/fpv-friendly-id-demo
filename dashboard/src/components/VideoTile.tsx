// Stable hash → deterministic visual placeholder per feed.
function feedHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Props {
  // Only feed_id + last_seen_s are read; takes any feed-shaped row.
  feed: { feed_id: string; last_seen_s?: number };
  accent?: string;
  showReticle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// SVG/CSS placeholder for a video frame — no actual video stream wired up
// yet. Striped diagonal pattern, callsign + status overlay, faint scan line.
export default function VideoTile({ feed, accent = "#a3a39a", showReticle = false, className, style }: Props) {
  const h = feedHash(feed.feed_id);
  const dark = `oklch(0.18 0.01 ${h % 360})`;
  const darker = `oklch(0.13 0.01 ${h % 360})`;
  const lastSeen = feed.last_seen_s ?? 0;
  return (
    <div
      className={className}
      style={{
        position: "relative",
        background: `repeating-linear-gradient(135deg, ${dark} 0 8px, ${darker} 8px 16px)`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: `${(h % 80) + 10}%`, height: 1, background: "rgba(255,255,255,0.08)" }} />
      {showReticle && (
        <div style={{
          position: "absolute", left: "50%", top: "50%", width: 24, height: 24,
          transform: "translate(-50%,-50%)", border: `1px solid ${accent}`, borderRadius: "50%", opacity: 0.6,
        }} />
      )}
      <div className="vt-callsign">{feed.feed_id}</div>
      <div className="vt-status">{lastSeen === 0 ? "LIVE" : `T-${lastSeen}s`}</div>
    </div>
  );
}
