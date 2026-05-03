import type { FusionResult, MissionManifest, FusionState } from "../types";
import { STATE_LABEL, NEEDS_REVIEW } from "./stateMeta";

interface Props {
  feeds: FusionResult[];
  manifest: MissionManifest | null;
  generatedAt: number;
  onPick: (id: string) => void;
}

const STATE_ORDER: FusionState[] = [
  "POSSIBLE_SPOOF",
  "SIGNATURE_CORRUPTED",
  "UNKNOWN_NEEDS_REVIEW",
  "LIKELY_FRIENDLY",
  "FRIENDLY_VERIFIED",
];

function fmtCountdown(deltaS: number): string {
  if (deltaS <= 0) return "EXPIRED";
  const m = Math.floor(deltaS / 60);
  const s = Math.floor(deltaS % 60);
  return `T-${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function evtTime(generatedAtUnix: number, offsetS: number): string {
  const d = new Date((generatedAtUnix - offsetS) * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MissionOverview({ feeds, manifest, generatedAt, onPick }: Props) {
  const total = feeds.length;
  const reviewCount = feeds.filter((f) => NEEDS_REVIEW.has(f.state)).length;

  const dist: Partial<Record<FusionState, number>> = {};
  for (const f of feeds) dist[f.state] = (dist[f.state] || 0) + 1;

  const seenIds = new Set(feeds.map((f) => f.feed_id));
  const declared = manifest?.friendly_drone_ids ?? [];
  const manifestRows = declared.map((id) => {
    const f = feeds.find((x) => x.feed_id === id);
    return { id, seen: seenIds.has(id), state: f?.state, last_seen_s: f?.last_seen_s };
  });

  const expiry = manifest ? fmtCountdown(manifest.valid_until_unix - generatedAt) : "—";

  return (
    <div className="mo">
      <div className="mo-eyebrow">
        <span>Mission control</span>
        <span>select a feed at left to inspect</span>
      </div>
      <h2 className="mo-title">{manifest?.mission_id ?? "—"}</h2>

      <div className="mo-stats">
        <Stat label="Feeds active" value={total} />
        <Stat label="Needs review" value={reviewCount} tone={reviewCount > 0 ? "warn" : undefined} />
        {manifest && <Stat label="Manifest seen" value={`${manifestRows.filter((r) => r.seen).length}/${declared.length}`} />}
        <Stat label="Mission expires" value={expiry} tone="dim" />
      </div>

      <div className="mo-section">
        <SectionLabel>State distribution</SectionLabel>
        <div className="mo-distbar">
          {STATE_ORDER.map((s) => {
            const n = dist[s] || 0;
            if (!n) return null;
            return <div key={s} className={`mo-distseg mo-seg-${s.toLowerCase()}`} style={{ width: `${(n / total) * 100}%` }} title={`${STATE_LABEL[s]} · ${n}`} />;
          })}
        </div>
        <div className="mo-distlegend">
          {STATE_ORDER.map((s) => {
            const n = dist[s] || 0;
            if (!n) return null;
            return (
              <div key={s} className="mo-distkey">
                <span className={`mo-distdot mo-seg-${s.toLowerCase()}`} />
                <span className="mo-distname">{STATE_LABEL[s]}</span>
                <span className="mo-distn">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mo-warning" role="note">Identification aid only. Human decision required.</div>

      <div className="mo-cols">
        {manifest && (
          <div className="mo-section">
            <SectionLabel count={`${manifestRows.filter((r) => r.seen).length}/${declared.length}`}>Declared friendlies</SectionLabel>
            <div className="mo-list">
              {manifestRows.map((r) => {
                const reviewing = r.seen && r.state && NEEDS_REVIEW.has(r.state);
                const tone = !r.seen ? "missing" : reviewing ? "warn" : "ok";
                const dotChar = !r.seen ? "○" : reviewing ? "!" : "✓";
                return (
                  <button
                    key={r.id}
                    className={`mo-row mo-row-${tone}`}
                    onClick={() => r.seen && onPick(r.id)}
                    disabled={!r.seen}
                  >
                    <span className="mo-row-mark">{dotChar}</span>
                    <span className="mo-row-id">{r.id}</span>
                    <span className="mo-row-time">
                      {!r.seen ? "not seen" : (r.last_seen_s ?? 0) === 0 ? "live" : `T-${r.last_seen_s}s`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mo-section">
          <SectionLabel>Recent state transitions</SectionLabel>
          <div className="mo-list">
            {/* Synthetic — wire to real event log when available. IDs are kept consistent with feeds.json so clicks resolve. */}
            <Event t={evtTime(generatedAt, 12)} id="FEED-E" msg="→ POSSIBLE_SPOOF"     tone="danger" onPick={onPick} />
            <Event t={evtTime(generatedAt, 30)} id="FEED-D" msg="HMAC decode failed"   tone="warn"   onPick={onPick} />
            <Event t={evtTime(generatedAt, 48)} id="FEED-B" msg="→ LIKELY_FRIENDLY"    tone="ok"     onPick={onPick} />
            <Event t={evtTime(generatedAt, 60)} id="FEED-C" msg="no marker observed"   tone="warn"   onPick={onPick} />
            <Event t={evtTime(generatedAt, 95)} id="FEED-A" msg="→ FRIENDLY_VERIFIED"  tone="dim"    onPick={onPick} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "warn" | "dim" }) {
  return (
    <div className={`mo-stat ${tone ? `mo-stat-${tone}` : ""}`}>
      <div className="mo-stat-label">{label}</div>
      <div className="mo-stat-value">{value}</div>
    </div>
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: React.ReactNode }) {
  return (
    <div className="mo-seclabel">
      <span>{children}{count != null && <span className="mo-seclabel-count"> · {count}</span>}</span>
      <div className="mo-seclabel-rule" />
    </div>
  );
}

function Event({ t, id, msg, tone, onPick }: { t: string; id: string; msg: string; tone: string; onPick: (id: string) => void }) {
  return (
    <button className={`mo-event mo-event-${tone}`} onClick={() => onPick(id)}>
      <span className="mo-event-t">{t}</span>
      <span className="mo-event-id">{id}</span>
      <span className="mo-event-msg">{msg}</span>
    </button>
  );
}
