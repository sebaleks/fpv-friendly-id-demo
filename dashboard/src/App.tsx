import { useEffect, useMemo, useState } from "react";
import type { FeedsBundle, DisplayFeed, FusionState, MissionManifest } from "./types";
import { sortFeeds, NEEDS_REVIEW, type SortMode } from "./components/stateMeta";
import FeedListItem from "./components/FeedListItem";
import FeedDetail from "./components/FeedDetail";
import MissionOverview from "./components/MissionOverview";
import TacticalMap from "./components/TacticalMap";

type Density = "compact" | "comfortable" | "spacious";

// Cycle order for the Z-key demo state flip. Hits all 5 fusion states
// in severity order so each press shows a distinct transition.
const STATE_CYCLE: FusionState[] = [
  "FRIENDLY_VERIFIED",
  "LIKELY_FRIENDLY",
  "UNKNOWN_NEEDS_REVIEW",
  "SIGNATURE_CORRUPTED",
  "POSSIBLE_SPOOF",
];

// Per-state simulated payload — confidence, signal trace, and reason all
// flip together so the detail view, signal trace, list status, and map
// marker stay coherent when the presenter cycles a feed live.
// Signal IDs match ALL_SIGNALS in stateMeta.ts (canonical) plus the
// firmware_marker_mismatch failure variant for SIGNATURE_CORRUPTED.
const STATE_SIM: Record<FusionState, { confidence: number; signals_used: string[]; reason: string }> = {
  FRIENDLY_VERIFIED: {
    confidence: 0.95,
    signals_used: ["firmware_marker", "steg_iff_token", "manifest_match", "visual_classifier", "rc_session", "time_window", "hmac_verify"],
    reason: "Marker authenticated and fresh, mission match, all supporting signals present.",
  },
  LIKELY_FRIENDLY: {
    confidence: 0.68,
    signals_used: ["firmware_marker", "manifest_match", "time_window", "hmac_verify"],
    reason: "Marker authenticated and fresh with mission match, but no corroborating supporting signal.",
  },
  UNKNOWN_NEEDS_REVIEW: {
    confidence: 0.20,
    signals_used: [],
    reason: "No valid friendly marker identified. Unknown is not foe — human review required.",
  },
  SIGNATURE_CORRUPTED: {
    confidence: 0.42,
    signals_used: ["firmware_marker_mismatch"],
    reason: "Marker-like data present but too noisy or incomplete to verify.",
  },
  POSSIBLE_SPOOF: {
    confidence: 0.10,
    signals_used: ["firmware_marker", "steg_iff_token", "time_window"],
    reason: "Marker decoded but HMAC verify failed. Possible adversary replay or spoof.",
  },
};

// Synthesize a NO_SIGNAL placeholder for a declared friendly that has no
// feed entry. Birger flagged real-world feed loss (~50% throughput); the
// dashboard infers absence from manifest∖feeds.
function synthNoSignal(feed_id: string): DisplayFeed {
  return {
    feed_id,
    state: "NO_SIGNAL",
    confidence: 0,
    signals_used: [],
    reason: "Declared friendly in mission manifest, no feed received. Cause unknown — link loss, downed airframe, or never launched.",
  };
}

export default function App() {
  const [bundle, setBundle] = useState<FeedsBundle | null>(null);
  const [manifest, setManifest] = useState<MissionManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("severity");
  const [density, setDensity] = useState<Density>("comfortable");
  const [showVideo, setShowVideo] = useState(true);
  // Demo-only: per-feed state overrides driven by Shift+<letter>. Lets the
  // presenter flip a feed live so judges see the state-change animation.
  const [stateOverrides, setStateOverrides] = useState<Record<string, FusionState>>({});

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

  // Hotkeys:
  //   A–I → select FEED-<letter>
  //   Z   → cycle the currently selected feed's state forward (demo flip)
  //   X   → cycle the currently selected feed's state backward
  //   Esc → back to overview
  // Skips when an input/select/textarea has focus so toolbar selects keep working.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") { setSelectedId(null); return; }
      const k = e.key.toUpperCase();
      if (k === "Z" || k === "X") {
        if (!selectedId) return;
        e.preventDefault();
        const dir = k === "Z" ? 1 : -1;
        setStateOverrides((prev) => {
          const baseline = bundle?.feeds.find((f) => f.feed_id === selectedId)?.state;
          const current = prev[selectedId] ?? baseline ?? STATE_CYCLE[0];
          const idx = STATE_CYCLE.indexOf(current as FusionState);
          const len = STATE_CYCLE.length;
          const next = STATE_CYCLE[(idx + dir + len) % len];
          return { ...prev, [selectedId]: next };
        });
        return;
      }
      if (k.length === 1 && k >= "A" && k <= "I") {
        setSelectedId(`FEED-${k}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bundle, selectedId]);

  // Merge real feeds with synthesized NO_SIGNAL rows for declared friendlies
  // that never showed up in feeds.json. Demo state overrides (Shift+<letter>)
  // are applied last so the presenter can flip a feed live.
  const merged: DisplayFeed[] = useMemo(() => {
    if (!bundle) return [];
    const real: DisplayFeed[] = bundle.feeds;
    const seen = new Set(real.map((f) => f.feed_id));
    const declared = manifest?.friendly_drone_ids ?? [];
    const synth = declared.filter((id) => !seen.has(id)).map(synthNoSignal);
    const all = [...real, ...synth];
    return all.map((f) => {
      const ov = stateOverrides[f.feed_id];
      if (!ov) return f;
      const sim = STATE_SIM[ov];
      return { ...f, state: ov, confidence: sim.confidence, signals_used: sim.signals_used, reason: sim.reason };
    });
  }, [bundle, manifest, stateOverrides]);

  if (error) {
    // NICK-047: distinguish 404 (likely missing file) from parse / network errors.
    const isMissing = /HTTP 404/.test(error);
    return (
      <div className="app-error">
        Failed to load feeds.json — {error}.
        {isMissing
          ? <> Run <code>python scripts/generate_feeds.py</code> to regenerate.</>
          : <> Check the dev server output and the <code>dashboard/public/feeds.json</code> contents.</>}
      </div>
    );
  }
  if (!bundle) return <div className="app-loading">Loading feeds…</div>;

  const sorted = sortFeeds(merged, sort);
  const selected = selectedId ? sorted.find((f) => f.feed_id === selectedId) ?? null : null;
  const reviewCount = merged.filter((f) => NEEDS_REVIEW.has(f.state)).length;

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
          <span>{merged.length - reviewCount} verified</span>
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
            ? <FeedDetail feed={selected} showVideo={showVideo} />
            : <MissionOverview feeds={sorted} manifest={manifest} generatedAt={bundle.generated_at} onPick={setSelectedId} />
          }
          {/* Floating tactical map — bottom-right. Selection syncs both ways. */}
          <TacticalMap
            feeds={merged}
            selectedId={selectedId}
            onPick={setSelectedId}
          />
        </main>
      </div>

      <footer className="app-foot">
        <span className="app-foot-canonical">Identification aid only. Human decision required. Not production IFF.</span>
        <span className="app-foot-tweaks">
          <span className="app-foot-hint">
            <kbd>A</kbd>–<kbd>I</kbd> select · <kbd>Esc</kbd> overview
          </span>
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
