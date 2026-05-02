"""Pydantic schemas for BlueMark FPV fusion. Single source of truth.

The TypeScript dashboard mirrors these in `dashboard/src/types.ts` by hand.
Drift between the two is an accepted hackathon risk.
"""
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class FusionState(str, Enum):
    FRIENDLY_VERIFIED = "FRIENDLY_VERIFIED"
    LIKELY_FRIENDLY = "LIKELY_FRIENDLY"
    UNKNOWN_NEEDS_REVIEW = "UNKNOWN_NEEDS_REVIEW"
    SIGNATURE_CORRUPTED = "SIGNATURE_CORRUPTED"
    POSSIBLE_SPOOF = "POSSIBLE_SPOOF"


class FusionSignal(BaseModel):
    """One identification signal evaluated for a feed.

    score: 0.0–1.0. For binary signals (hmac_valid, mission_match), use 1.0/0.0.
    fresh: whether this signal's evidence is within its applicable window.
    evidence: free-form per-signal details (kept loose; not safety-critical).
    """
    name: str
    score: float = Field(ge=0.0, le=1.0)
    fresh: bool = True
    evidence: dict[str, Any] = Field(default_factory=dict)


class FusionResult(BaseModel):
    """Per-feed fusion output rendered by the dashboard."""
    feed_id: str
    state: FusionState
    confidence: float = Field(ge=0.0, le=1.0)
    signals_used: list[str]
    reason: str


class FeedsBundle(BaseModel):
    """Top-level JSON shape written to dashboard/public/feeds.json."""
    generated_at: int
    mission_id: str
    feeds: list[FusionResult]
