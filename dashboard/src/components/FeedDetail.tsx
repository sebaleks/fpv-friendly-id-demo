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
        {/* Confidence — big prominent number, right of video. Replaces the
            old fill-bar treatment. The number IS the readout. */}
        <div className="fd-confidence" aria-label={`Confidence ${pct} percent`}>
          <div className="fd-confidence-label">Confidence</div>
          <div className="fd-confidence-value">
            {isNoSignal ? <span className="fd-confidence-dash">—</span> : (
              <>
                <span className="fd-confidence-num">{pct}</span>
                <span className="fd-confidence-pct">%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Countermeasures — three engagement options. NOT auto-fire; this is
          a human-in-the-loop dispatch surface. Disabled for verified friendlies. */}
      <section className="fd-section fd-countermeasures">
        <div className="fd-label">
          <span>Countermeasures</span>
          <span className="fd-cm-hint">Human authorization required</span>
        </div>
        <div className="fd-cm-grid">
          <button className="fd-cm fd-cm-jam" disabled={isNoSignal}>
            <span className="fd-cm-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M3 9 Q 5 4 9 4 Q 13 4 15 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M5 11 Q 6.5 8 9 8 Q 11.5 8 13 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="9" cy="13" r="1.4" fill="currentColor" />
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="fd-cm-body">
              <span className="fd-cm-name">Jamming</span>
              <span className="fd-cm-sub">RF / GNSS denial</span>
            </span>
          </button>
          <button className="fd-cm fd-cm-energy" disabled={isNoSignal}>
            <span className="fd-cm-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M2 9 L 14 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M11 5 L 16 9 L 11 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="3" cy="9" r="1.2" fill="currentColor" />
              </svg>
            </span>
            <span className="fd-cm-body">
              <span className="fd-cm-name">Energy</span>
              <span className="fd-cm-sub">Directed laser</span>
            </span>
          </button>
          <button className="fd-cm fd-cm-kinetic" disabled={isNoSignal}>
            <span className="fd-cm-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="9" cy="9" r="1.2" fill="currentColor" />
                <line x1="9" y1="1" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="9" y1="14.5" x2="9" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="1" y1="9" x2="3.5" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="14.5" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="fd-cm-body">
              <span className="fd-cm-name">Kinetic</span>
              <span className="fd-cm-sub">Interceptor</span>
            </span>
          </button>
        </div>
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
