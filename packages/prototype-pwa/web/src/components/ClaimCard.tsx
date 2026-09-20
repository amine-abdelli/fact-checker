import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSpeakerMeta } from "@/lib/speakers";
import type { ClaimWithMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  statistique_publique: "Statistique",
  evenement_recent: "Actualité",
  citation: "Citation",
  donnee_scientifique: "Science",
  historique: "Historique",
  juridique: "Juridique",
  attribution_personnelle: "Attribution",
  opinion: "Opinion",
  projection: "Projection",
};

export function ClaimCard({ claim }: { claim: ClaimWithMeta }) {
  const meta = getSpeakerMeta(claim.speaker_id);
  const categoryLabel = CATEGORY_LABELS[claim.category] ?? claim.category;
  const time = new Date(claim.receivedAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const latencyLabel = claim.latencyMs !== null ? `${(claim.latencyMs / 1000).toFixed(1)} s` : "?";

  return (
    <Card
      className={cn("border-l-4", meta.side === "right" && "self-end border-l-0 border-r-4")}
      style={{
        borderLeftColor: meta.side !== "right" ? meta.color : undefined,
        borderRightColor: meta.side === "right" ? meta.color : undefined,
      }}
    >
      <CardContent className="pt-4">
        <p className="mb-1.5 text-sm font-semibold">{claim.canonical}</p>
        <p className="text-xs italic text-muted-foreground">« {claim.raw_quote} »</p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge>{categoryLabel}</Badge>
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        <span>{meta.label}</span>
        <span className="ml-auto">{time}</span>
        <span className="text-emerald-400" title="Délai phrase → carte">
          ⏱ {latencyLabel}
        </span>
      </CardFooter>
    </Card>
  );
}
