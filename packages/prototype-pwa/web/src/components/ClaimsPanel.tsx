import type { ClaimWithMeta } from "@/lib/types";
import { ClaimCard } from "./ClaimCard";

export function ClaimsPanel({ claims }: { claims: ClaimWithMeta[] }) {
  if (claims.length === 0) {
    return <div className="p-6 text-center text-sm text-muted-foreground">En attente d'affirmations…</div>;
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      {claims.map((claim) => (
        <ClaimCard key={claim.claim_id} claim={claim} />
      ))}
    </div>
  );
}
