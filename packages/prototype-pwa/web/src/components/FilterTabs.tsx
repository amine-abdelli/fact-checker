import { getSpeakerMeta } from "@/lib/speakers";
import { cn } from "@/lib/utils";

export const ALL_SPEAKERS = "__all__";

interface FilterTabsProps {
  speakerIds: string[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ speakerIds, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2.5">
      <TabButton label="Tout" selected={active === ALL_SPEAKERS} onClick={() => onChange(ALL_SPEAKERS)} />
      {speakerIds.map((id) => (
        <TabButton key={id} label={getSpeakerMeta(id).label} selected={active === id} onClick={() => onChange(id)} />
      ))}
    </div>
  );
}

function TabButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
