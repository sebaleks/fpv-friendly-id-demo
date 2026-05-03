import type { FusionResult } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";
import StateGlyph from "./StateGlyph";
import VideoTile from "./VideoTile";

interface Props {
  feed: FusionResult & { last_seen_s?: number; callsign?: string; grid?: string };
  showVideo: boolean;
  onClose: () => void;
}

// Known signal IDs — anything else falls through to a generic row.
const SIGNAL_LABELS: Record<string, { label: string; bad?: boolean }> = {
  firmware_marker:           { label: "Firmware marker" },
  firmware_marker_mismatch:  { label: "Firmware marker mismatch", bad: true },
  steg_iff_token:            { label: "Steganographic IFF token" },
  steg_iff_token_partial:    { label: "IFF token (partial / CRC fail)", bad: true },
  manifest_match:            { label: "Manifest match" },
  manifest_miss:             { label: "Manifest miss", bad: true },
  visual_classifier:         { label: "Visual classifier" },
};

export default function FeedDetail({ feed, showVideo, onClose }: Props) {
  const pct = Math.round(feed.confidence * 100);
  const isReview = NEEDS_REVIEW.has(feed.state);
  const stateClass = `fd-state-${feed.state.toLowerCase()}`;
  const lastSeen = feed.last_seen_s ?? 0;

  return (
    <div className={`fd ${stateClass} ${isReview ? "fd-review" : ""}`}>
      <div className="fd-head">
        {showVideo && <VideoTile feed={feed} className="fd-video" showReticle />}
        <div className="fd-titles">
          <div className="fd-state">
            <StateGlyph state={feed.state} /> <span>{STATE_LABEL[feed.state]}</span>
          </div>
          <div className="fd-id">{feed.feed_id}</div>
          <div className="fd-meta">
            {feed.callsign && <span>{feed.callsign}</span>}
            {feed.grid && <span> · {feed.grid}</span>}
            <span> · {lastSeen === 0 ? "LIVE" : `T-${lastSeen}s`}</span>
          </div>
        </div>
        <button className="fd-close" onClick={onClose} title="Back to mission overview">×</button>
      </div>

      <section className="fd-section">
        <div className="fd-label">
          <span>Confidence</span><span className="fd-label-val">{pct}%</span>
        </div>
        <div className="fd-bar"><div className="fd-bar-fill" style={{ width: `${pct}%` }} /></div>
      </section>

      <section className="fd-section">
        <div className="fd-label">Reason</div>
        <p className="fd-reason">{feed.reason}</p>
      </section>

      <section className="fd-section">
        <div className="fd-label">Signals · {feed.signals_used.length}</div>
        <div className="fd-signals">
          {feed.signals_used.map((id) => {
            const meta = SIGNAL_LABELS[id] || { label: id };
            return (
              <div key={id} className={`fd-signal ${meta.bad ? "fd-signal-bad" : "fd-signal-ok"}`}>
                <span className="fd-signal-mark">{meta.bad ? "✕" : "✓"}</span>
                <span className="fd-signal-label">{meta.label}</span>
                <code className="fd-signal-id">{id}</code>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fd-actions">
        <button className="fd-btn fd-btn-secondary">Acknowledge</button>
        <button className="fd-btn fd-btn-primary">Mark Reviewed</button>
      </div>
    </div>
  );
}
