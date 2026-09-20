import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatusVariant = "listening" | "warning" | "error" | "idle";

const STATUS_STYLES: Record<StatusVariant, string> = {
  listening: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-red-400",
  idle: "text-muted-foreground",
};

interface HeaderProps {
  statusText: string;
  statusVariant: StatusVariant;
  recording: boolean;
  onToggle: () => void;
}

export function Header({ statusText, statusVariant, recording, onToggle }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-5 py-3">
      <h1 className="text-lg font-bold tracking-wide text-primary">PLUMB</h1>
      <span className="hidden flex-1 text-sm text-muted-foreground sm:block">Vérifiez ce qui se dit, à mesure.</span>
      <span className={cn("rounded-full bg-muted px-2.5 py-1 text-xs font-medium", STATUS_STYLES[statusVariant])}>
        {statusText}
      </span>
      <Button variant={recording ? "destructive" : "default"} onClick={onToggle}>
        {recording ? "⏸ Arrêter" : "▶ Écouter"}
      </Button>
    </header>
  );
}
