import type { DisplayFeed } from "../types";
import { STATE_LABEL, NEEDS_REVIEW, ALL_SIGNALS, classifySignal } from "./stateMeta";
import StateGlyph from "./StateGlyph";
import VideoTile from "./VideoTile";

interface Props {
  feed: DisplayFeed;
  showVideo: boolean;
}

export default function FeedDetail({ feed, showVideo }: Props) {
  const pct = Math.round(feed.confidence * 100);
  const isReview = NEEDS_REVIEW.has(feed.state);
  const isNoSignal = feed.state === "NO_SIGNAL";
  const stateClass = `fd-state-${feed.state.toLowerCase()}`;
  const lastSeen = feed.last_seen_s ?? 0;

  // Full signal trace — every possible signal, marked PASS / FAIL / MISSING.
  // For NO_SIGNAL all rows are MISSING by definition.
  const signalRows = ALL_SIGNALS.map((s) => ({
    ...s,
    status: classifySignal(feed.signals_used, s.id),
  }));
  const okCount   = signalRows.filter((s) => s.status === "ok").length;
  const failCount = signalRows.filter((s) => s.status === "fail").length;
  const missCount = signalRows.filter((s) => s.status === "missing").length;

  return (
    <div className={`fd ${stateClass} ${isReview ? "fd-review" : ""}`}>
      <div className="fd-head">
        {showVideo && !isNoSignal && <VideoTile feed={feed} className="fd-video" showReticle />}
        {showVideo && isNoSignal && <div className="fd-video fd-video-nosignal">NO SIGNAL</div>}
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

      {/* Signal trace — full list. Every possible signal is shown so the
          operator can see at a glance which checks fired, which failed, and
          which never produced data. */}
      <section className="fd-section">
        <div className="fd-signals-head">
          <span className="fd-label">Signal trace · all {ALL_SIGNALS.length}</span>
          <span className="fd-signals-counts">
            <span className="fd-signals-ok">✓ {okCount}</span>
            <span className="fd-signals-fail">✕ {failCount}</span>
            <span className="fd-signals-miss">– {missCount}</span>
          </span>
        </div>
        <div className="fd-signals">
          {signalRows.map((s) => {
            const mark = s.status === "ok" ? "✓" : s.status === "fail" ? "✕" : "–";
            const tag = s.status === "ok" ? "PASS" : s.status === "fail" ? "FAIL" : "MISSING";
            return (
              <div key={s.id} className={`fd-signal fd-signal-${s.status}`}>
                <span className="fd-signal-mark">{mark}</span>
                <div className="fd-signal-body">
                  <div className="fd-signal-label">{s.label}</div>
                  <div className="fd-signal-desc">{s.desc}</div>
                </div>
                <span className="fd-signal-tag">{tag}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fd-warning" role="note">Identification aid only. Human decision required.</div>
    </div>
  );
}
