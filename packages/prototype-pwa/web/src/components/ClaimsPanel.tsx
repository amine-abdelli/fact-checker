import { ALL_SPEAKERS } from "@/components/FilterTabs";
import type { ClaimWithMeta } from "@/lib/types";
import { ClaimCard } from "./ClaimCard";

interface ClaimsPanelProps {
  claims: ClaimWithMeta[];
  filterSpeaker: string;
}

export function ClaimsPanel({ claims, filterSpeaker }: ClaimsPanelProps) {
  const visible =
    filterSpeaker === ALL_SPEAKERS ? claims : claims.filter((c) => (c.speaker_id ?? "unknown") === filterSpeaker);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {visible.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          En attente d'affirmations…
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {visible.map((claim) => (
            <ClaimCard key={claim.claim_id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
