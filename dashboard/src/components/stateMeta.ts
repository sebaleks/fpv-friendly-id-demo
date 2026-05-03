import type { FusionState } from "../types";

export const STATE_LABEL: Record<FusionState, string> = {
  FRIENDLY_VERIFIED: "Friendly · Verified",
  LIKELY_FRIENDLY: "Likely Friendly",
  UNKNOWN_NEEDS_REVIEW: "Unknown · Review",
  SIGNATURE_CORRUPTED: "Signature Corrupted",
  POSSIBLE_SPOOF: "Possible Spoof",
};

// Triage severity — higher = more urgent.
export const STATE_SEVERITY: Record<FusionState, number> = {
  POSSIBLE_SPOOF: 4,
  SIGNATURE_CORRUPTED: 3,
  UNKNOWN_NEEDS_REVIEW: 2,
  LIKELY_FRIENDLY: 1,
  FRIENDLY_VERIFIED: 0,
};

export const NEEDS_REVIEW = new Set<FusionState>([
  "POSSIBLE_SPOOF",
  "SIGNATURE_CORRUPTED",
  "UNKNOWN_NEEDS_REVIEW",
]);

export type SortMode = "severity" | "feed_id" | "confidence";

export function sortFeeds<T extends { state: FusionState; confidence: number; feed_id: string }>(
  feeds: T[],
  mode: SortMode
): T[] {
  const arr = [...feeds];
  if (mode === "severity") {
    arr.sort((a, b) => STATE_SEVERITY[b.state] - STATE_SEVERITY[a.state] || a.confidence - b.confidence);
  } else if (mode === "confidence") {
    arr.sort((a, b) => b.confidence - a.confidence);
  } else {
    arr.sort((a, b) => a.feed_id.localeCompare(b.feed_id));
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────
// Signal taxonomy — single source of truth for the FULL signal list.
// Used by FeedDetail to render every possible signal per drone, with
// PASS / FAIL / MISSING per row.
// ─────────────────────────────────────────────────────────────────────

export interface SignalSpec {
  id: string;
  label: string;
  desc: string;
}

// Every signal the fusion pipeline knows about. Order is canonical.
export const ALL_SIGNALS: SignalSpec[] = [
  { id: "firmware_marker",   label: "Firmware marker",          desc: "Magic bytes in firmware header" },
  { id: "steg_iff_token",    label: "Steganographic IFF token", desc: "Hidden ID token in video stream" },
  { id: "manifest_match",    label: "Mission manifest match",   desc: "Airframe ID listed in manifest" },
  { id: "visual_classifier", label: "Visual classifier",        desc: "ML profile of airframe shape" },
  { id: "rc_session",        label: "RC session pairing",       desc: "Active control link to friendly GCS" },
  { id: "time_window",       label: "Token freshness",          desc: "IFF token timestamp within window" },
  { id: "hmac_verify",       label: "HMAC verification",        desc: "Cryptographic signature on token" },
];

// Failure variants emitted by the pipeline — these mark a signal as
// PRESENT-BUT-BAD rather than missing.
const FAILURE_TO_SIGNAL: Record<string, string> = {
  firmware_marker_mismatch: "firmware_marker",
  steg_iff_token_partial:   "steg_iff_token",
  manifest_miss:            "manifest_match",
};

export type SignalStatus = "ok" | "fail" | "missing";

export function classifySignal(signalsUsed: string[], sigId: string): SignalStatus {
  if (signalsUsed.includes(sigId)) return "ok";
  for (const [failureId, canonical] of Object.entries(FAILURE_TO_SIGNAL)) {
    if (canonical === sigId && signalsUsed.includes(failureId)) return "fail";
  }
  return "missing";
}
