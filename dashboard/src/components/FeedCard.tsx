import type { FusionResult, FusionState } from "../types";

const STATE_LABEL: Record<FusionState, string> = {
  FRIENDLY_VERIFIED: "Friendly Verified",
  LIKELY_FRIENDLY: "Likely Friendly",
  UNKNOWN_NEEDS_REVIEW: "Unknown — Needs Review",
  SIGNATURE_CORRUPTED: "Signature Corrupted / Needs Human Review",
  POSSIBLE_SPOOF: "Possible Spoof",
};

const STATE_CLASS: Record<FusionState, string> = {
  FRIENDLY_VERIFIED: "state-verified",
  LIKELY_FRIENDLY: "state-likely",
  UNKNOWN_NEEDS_REVIEW: "state-unknown",
  SIGNATURE_CORRUPTED: "state-corrupted",
  POSSIBLE_SPOOF: "state-spoof",
};

export default function FeedCard({ result }: { result: FusionResult }) {
  const pct = Math.round(result.confidence * 100);
  return (
    <article className={`card ${STATE_CLASS[result.state]}`}>
      <header className="card-header">
        <h2>{result.feed_id}</h2>
        <span className="state-pill">{STATE_LABEL[result.state]}</span>
      </header>

      <div className="confidence">
        <div className="confidence-label">
          <span>Confidence</span>
          <span>{pct}%</span>
        </div>
        <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <p className="reason">{result.reason}</p>

      <details className="signals">
        <summary>Signals used ({result.signals_used.length})</summary>
        <ul>{result.signals_used.map((s) => <li key={s}><code>{s}</code></li>)}</ul>
      </details>

      <footer className="card-footer">Identification aid only. Human decision required.</footer>
    </article>
  );
}
