import type { SpeakerMeta } from "@/lib/speakers";
import { cn } from "@/lib/utils";

interface SpeakerAvatarProps {
  meta: SpeakerMeta;
  size?: "sm" | "md";
}

export function SpeakerAvatar({ meta, size = "md" }: SpeakerAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-xs",
      )}
      style={{ background: meta.color }}
    >
      {meta.initial}
    </span>
  );
}
