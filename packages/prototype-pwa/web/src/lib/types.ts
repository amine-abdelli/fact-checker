// Mirrors .claude/skills/plumb/references/contracts.md — field names must stay identical.

export interface TranscriptSegment {
  segment_id: string;
  session_id: string;
  speaker_id: string | null;
  start_ms: number;
  end_ms: number;
  text: string;
  language: string;
  confidence: number;
  is_final: boolean;
}

export interface Claim {
  claim_id: string;
  session_id: string;
  speaker_id: string | null;
  start_ms: number;
  end_ms: number;
  raw_quote: string;
  canonical: string;
  context: string;
  category: string;
  verifiability_score: number;
  state: string;
}

export interface SessionInfo {
  session_id: string;
  source_type: string;
  language: string;
}

export type ServerEvent =
  | { type: "session"; data: SessionInfo }
  | { type: "transcript"; data: TranscriptSegment }
  | { type: "claim"; data: Claim }
  | { type: "status"; data: { text: string; color: string } };

// UI-only view models, not part of the wire contract.

export interface DisplaySegment extends TranscriptSegment {
  id: string; // stable React key: reused while a segment is interim, replaced on finalization
}

export interface ClaimWithMeta extends Claim {
  latencyMs: number | null;
  receivedAt: number;
}
