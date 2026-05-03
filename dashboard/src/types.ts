// Mirrors src/bluemark/schemas.py — single source of truth lives in Python.
// Keep this file in sync by hand for the hackathon.

export type FusionState =
  | "FRIENDLY_VERIFIED"
  | "LIKELY_FRIENDLY"
  | "UNKNOWN_NEEDS_REVIEW"
  | "SIGNATURE_CORRUPTED"
  | "POSSIBLE_SPOOF";

export interface FusionResult {
  feed_id: string;
  state: FusionState;
  confidence: number;
  signals_used: string[];
  reason: string;
}

export interface FeedsBundle {
  generated_at: number;
  mission_id: string;
  feeds: FusionResult[];
}

export interface MissionManifest {
  mission_id: string;
  valid_from_unix: number;
  valid_until_unix: number;
  friendly_drone_ids: string[];
  issued_by: string;
  notes?: string;
}
