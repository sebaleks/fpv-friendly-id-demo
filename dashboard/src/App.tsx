import { useEffect, useState } from "react";
import type { FeedsBundle, FusionResult, MissionManifest } from "./types";
import { sortFeeds, NEEDS_REVIEW, type SortMode } from "./components/stateMeta";
import FeedListItem from "./components/FeedListItem";
import FeedDetail from "./components/FeedDetail";
import MissionOverview from "./components/MissionOverview";
import TacticalMap from "./components/TacticalMap";

type Density = "compact" | "comfortable" | "spacious";

export default function App() {
  const [bundle, setBundle] = useState<FeedsBundle | null>(null);
  const [manifest, setManifest] = useState<MissionManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("severity");
  const [density, setDensity] = useState<Density>("compact");
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    fetch("/feeds.json", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: FeedsBundle) => setBundle(data))
      .catch((e) => setError(String(e)));
    fetch("/mission_manifest.json", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((m: MissionManifest | null) => setManifest(m))
      .catch(() => setManifest(null));
  }, []);

  if (error) return <div className="app-error">Failed to load feeds.json — {error}. Run <code>python scripts/generate_feeds.py</code>.</div>;
  if (!bundle) return <div className="app-loading">Loading feeds…</div>;

  const sorted = sortFeeds(bundle.feeds, sort) as FusionResult[];
  const selected = selectedId ? sorted.find((f) => f.feed_id === selectedId) ?? null : null;
  const reviewCount = bundle.feeds.filter((f) => NEEDS_REVIEW.has(f.state)).length;

  const generatedTime = new Date(bundle.generated_at * 1000).toLocaleTimeString();

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-left">
          <span className="app-bar-dot" />
          <span className="app-bar-title">BLUEMARK / FPV-ID</span>
          <span className="app-bar-mission">{bundle.mission_id}</span>
        </div>
        <div className="app-bar-right">
          <span><span className="app-bar-warn">{reviewCount}</span> review</span>
          <span>{bundle.feeds.length - reviewCount} verified</span>
          <span>{generatedTime}</span>
          {/* Mission Control button — returns to overview. Highlighted when a
              feed is selected (i.e. there's somewhere to navigate back to). */}
          <button
            className={`app-bar-mc ${selected ? "app-bar-mc-active" : ""}`}
            onClick={() => setSelectedId(null)}
            disabled={!selected}
            title={selected ? "Return to mission control" : "Already on mission control"}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <rect x="1" y="1" width="3" height="3" fill="currentColor" />
              <rect x="6" y="1" width="3" height="3" fill="currentColor" />
              <rect x="1" y="6" width="3" height="3" fill="currentColor" />
              <rect x="6" y="6" width="3" height="3" fill="currentColor" />
            </svg>
            Mission Control
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-list">
          <div className="app-list-toolbar">
            <span className="app-list-label">Feeds · sorted by {sort === "feed_id" ? "ID" : sort}</span>
            <select className="app-select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="severity">Severity</option>
              <option value="feed_id">Feed ID</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
          <div className="app-list-items">
            {sorted.map((f) => (
              <FeedListItem
                key={f.feed_id}
                feed={f}
                selected={f.feed_id === selectedId}
                onClick={() => setSelectedId(f.feed_id === selectedId ? null : f.feed_id)}
                showVideo={showVideo}
                density={density}
              />
            ))}
          </div>
        </aside>

        <main className="app-main">
          {selected
            ? <FeedDetail feed={selected} showVideo={showVideo} onClose={() => setSelectedId(null)} />
            : <MissionOverview feeds={sorted} manifest={manifest} generatedAt={bundle.generated_at} onPick={setSelectedId} />
          }
          {/* Floating tactical map — bottom-right. Selection syncs both ways. */}
          <TacticalMap
            feeds={bundle.feeds}
            selectedId={selectedId}
            onPick={setSelectedId}
          />
        </main>
      </div>

      <footer className="app-foot">
        <span className="app-foot-canonical">Identification aid only. Human decision required. Not production IFF.</span>
        <span className="app-foot-tweaks">
          <label><input type="checkbox" checked={showVideo} onChange={(e) => setShowVideo(e.target.checked)} /> video</label>
          <label>density:&nbsp;
            <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
              <option value="compact">compact</option>
              <option value="comfortable">comfortable</option>
              <option value="spacious">spacious</option>
            </select>
          </label>
        </span>
      </footer>
    </div>
  );
}
