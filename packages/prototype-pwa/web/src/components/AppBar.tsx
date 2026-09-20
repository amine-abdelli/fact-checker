import { Button } from "@/components/ui/button";
import { SpeakerAvatar } from "@/components/SpeakerAvatar";
import { getSpeakerMeta } from "@/lib/speakers";
import { cn } from "@/lib/utils";

export type StatusVariant = "listening" | "warning" | "error" | "idle";

const STATUS_DOT_STYLES: Record<StatusVariant, string> = {
  listening: "bg-red-500",
  warning: "bg-amber-600",
  error: "bg-red-600",
  idle: "bg-muted-foreground",
};

const STATUS_TEXT_STYLES: Record<StatusVariant, string> = {
  listening: "text-red-600",
  warning: "text-amber-700",
  error: "text-red-700",
  idle: "text-muted-foreground",
};

interface AppBarProps {
  statusText: string;
  statusVariant: StatusVariant;
  recording: boolean;
  onToggle: () => void;
  speakerIds: string[];
  claimCount: number;
  clockText: string;
}

export function AppBar({
  statusText,
  statusVariant,
  recording,
  onToggle,
  speakerIds,
  claimCount,
  clockText,
}: AppBarProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <h1 className="font-display text-lg italic text-foreground">Plumb</h1>
        <div className="flex flex-1 items-center gap-1.5 text-sm">
          <span
            className={cn("h-2 w-2 rounded-full", recording && statusVariant === "listening" && "animate-pulse", recording && STATUS_DOT_STYLES[statusVariant])}
          />
          <span className={cn("font-medium", STATUS_TEXT_STYLES[statusVariant])}>{statusText}</span>
          <span className="font-mono text-xs text-muted-foreground">
            · {clockText} · FR
          </span>
        </div>
        <Button
          variant={recording ? "destructive" : "default"}
          size="sm"
          onClick={onToggle}
          aria-label={recording ? "Arrêter l'écoute" : "Démarrer l'écoute"}
        >
          {recording ? "⏸ Arrêter" : "▶ Écouter"}
        </Button>
      </div>

      {speakerIds.length > 0 && (
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {speakerIds.map((id) => {
              const meta = getSpeakerMeta(id);
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <SpeakerAvatar meta={meta} size="sm" />
                  <span className="text-xs text-muted-foreground">{meta.label}</span>
                </div>
              );
            })}
          </div>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {claimCount} vérification{claimCount === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </header>
  );
}
