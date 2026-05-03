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
