import { cn } from "@/lib/utils";

export type MobileView = "flux" | "transcription";

interface BottomNavProps {
  view: MobileView;
  onChange: (view: MobileView) => void;
}

export function BottomNav({ view, onChange }: BottomNavProps) {
  return (
    <nav className="flex justify-center bg-background p-3 md:hidden">
      <div className="flex gap-1 rounded-full bg-primary p-1.5 shadow-lg">
        <NavButton label="Flux" active={view === "flux"} onClick={() => onChange("flux")} />
        <NavButton label="Transcription" active={view === "transcription"} onClick={() => onChange("transcription")} />
      </div>
    </nav>
  );
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 font-ui text-xs font-medium transition-colors",
        active ? "bg-primary-foreground/15 text-primary-foreground" : "text-primary-foreground/60",
      )}
    >
      {label}
    </button>
  );
}
