import { useEffect, useRef } from "react";

import type { DisplaySegment } from "@/lib/types";
import { TranscriptBubble } from "./TranscriptBubble";

export function TranscriptPanel({ segments }: { segments: DisplaySegment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [segments]);

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto p-4">
      {segments.map((segment) => (
        <TranscriptBubble key={segment.id} segment={segment} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
