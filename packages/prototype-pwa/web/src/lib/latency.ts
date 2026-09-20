// Heuristic latency measurement for T-012: time between the spoken sentence ending and its
// claim card appearing. We can't get true spoken-end wall-clock time from the ASR provider
// in this prototype, so we approximate it with the client's receipt time of the last final
// transcript segment that overlaps the claim's raw_quote. Caveat documented in the finding.

interface ReceivedSegment {
  text: string;
  receivedAt: number;
}

const MAX_TRACKED = 60;

export class LatencyTracker {
  private segments: ReceivedSegment[] = [];

  recordFinalSegment(text: string): void {
    this.segments.push({ text: text.trim(), receivedAt: Date.now() });
    if (this.segments.length > MAX_TRACKED) {
      this.segments.shift();
    }
  }

  /** Returns milliseconds elapsed, or null if no matching segment could be found. */
  estimateForClaim(rawQuote: string): number | null {
    const quote = rawQuote.trim().toLowerCase();
    if (!quote) return null;

    for (let i = this.segments.length - 1; i >= 0; i--) {
      const segment = this.segments[i];
      const text = segment.text.toLowerCase();
      if (!text) continue;
      if (quote.includes(text) || text.includes(quote)) {
        return Date.now() - segment.receivedAt;
      }
    }
    return null;
  }
}
