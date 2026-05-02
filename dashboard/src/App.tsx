import { useEffect, useState } from "react";
import type { FeedsBundle } from "./types";
import FeedCard from "./components/FeedCard";

export default function App() {
  const [bundle, setBundle] = useState<FeedsBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/feeds.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: FeedsBundle) => setBundle(data))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>BlueMark FPV</h1>
          <p className="subtitle">Receiver-side identification aid for friendly FPV video.</p>
        </div>
        {bundle && (
          <div className="meta">
            <div>Mission: <code>{bundle.mission_id}</code></div>
            <div>Generated: {new Date(bundle.generated_at * 1000).toLocaleTimeString()}</div>
          </div>
        )}
      </header>

      <div className="warning-banner" role="alert">
        Identification aid only. Human decision required.
      </div>

      <main className="grid">
        {error && <div className="error">Failed to load feeds.json — {error}. Run <code>python scripts/generate_feeds.py</code>.</div>}
        {!bundle && !error && <div className="loading">Loading feeds…</div>}
        {bundle?.feeds.map((f) => <FeedCard key={f.feed_id} result={f} />)}
      </main>

      <footer className="app-footer">
        Simulated, non-lethal. No autonomous targeting, engagement, jamming, or evasion. Not production-grade IFF.
      </footer>
    </div>
  );
}
