import { getSpeakerMeta } from "@/lib/speakers";
import type { DisplaySegment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TranscriptBubble({ segment }: { segment: DisplaySegment }) {
  const meta = getSpeakerMeta(segment.speaker_id);

  return (
    <div
      className={cn(
        "max-w-[70%] rounded-xl border bg-card px-3 py-2",
        meta.side === "right" ? "self-end" : "self-start",
        !segment.is_final && "italic opacity-60",
      )}
      style={{ borderColor: meta.color }}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        {meta.label}
      </div>
      <div className="text-sm leading-snug">{segment.text}</div>
    </div>
  );
}
