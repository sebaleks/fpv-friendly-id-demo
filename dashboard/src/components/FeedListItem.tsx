import type { FusionResult } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";
import StateGlyph from "./StateGlyph";
import VideoTile from "./VideoTile";

interface Props {
  feed: FusionResult;
  selected: boolean;
  onClick: () => void;
  showVideo: boolean;
  density: "compact" | "comfortable" | "spacious";
}

export default function FeedListItem({ feed, selected, onClick, showVideo, density }: Props) {
  const pct = Math.round(feed.confidence * 100);
  const isReview = NEEDS_REVIEW.has(feed.state);
  const cls = ["fli", `fli-${density}`, selected && "fli-selected", isReview && "fli-review", `fli-${feed.state.toLowerCase()}`]
    .filter(Boolean).join(" ");
  const lastSeen = feed.last_seen_s ?? 0;

  return (
    <button className={cls} onClick={onClick}>
      {showVideo && <VideoTile feed={feed} className="fli-thumb" />}
      <div className="fli-body">
        <div className="fli-head">
          <span className="fli-glyph"><StateGlyph state={feed.state} /></span>
          <span className="fli-id">{feed.feed_id}</span>
        </div>
        <div className="fli-state">{STATE_LABEL[feed.state]}</div>
      </div>
      <div className="fli-meta">
        <div className="fli-pct">{pct}%</div>
        <div className="fli-time">{lastSeen === 0 ? "LIVE" : `T-${lastSeen}`}</div>
      </div>
    </button>
  );
}
