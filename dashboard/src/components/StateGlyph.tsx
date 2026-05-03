import type { FusionState } from "../types";

export default function StateGlyph({ state, size = 10, color }: { state: FusionState; size?: number; color?: string }) {
  const c = color || "currentColor";
  const common = { width: size, height: size, display: "block" as const };
  if (state === "FRIENDLY_VERIFIED")
    return <svg {...common} viewBox="0 0 10 10"><rect x="2" y="2" width="6" height="6" fill={c} /></svg>;
  if (state === "LIKELY_FRIENDLY")
    return <svg {...common} viewBox="0 0 10 10"><rect x="2" y="2" width="6" height="6" fill="none" stroke={c} strokeWidth="1.5" /></svg>;
  if (state === "UNKNOWN_NEEDS_REVIEW")
    return <svg {...common} viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="none" stroke={c} strokeWidth="1.5" /></svg>;
  if (state === "SIGNATURE_CORRUPTED")
    return <svg {...common} viewBox="0 0 10 10"><path d="M5 1 L9 9 L1 9 Z" fill="none" stroke={c} strokeWidth="1.5" /></svg>;
  if (state === "POSSIBLE_SPOOF")
    return <svg {...common} viewBox="0 0 10 10"><path d="M5 1 L9 9 L1 9 Z" fill={c} /></svg>;
  return null;
}
