import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SpeakerAvatar } from "@/components/SpeakerAvatar";
import { getSpeakerMeta } from "@/lib/speakers";
import type { ClaimWithMeta } from "@/lib/types";

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
  });
  const latencyLabel = claim.latencyMs !== null ? `${(claim.latencyMs / 1000).toFixed(1)} s` : "?";

  return (
    <Card className="border-l-4" style={{ borderLeftColor: meta.color }}>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <SpeakerAvatar meta={meta} size="sm" />
        <span className="font-ui text-xs font-medium">{meta.label}</span>
        <span className="font-mono text-xs text-muted-foreground">· {time}</span>
        <Badge className="ml-auto" variant="secondary">
          {categoryLabel}
        </Badge>
      </CardHeader>
      <CardContent className="py-0">
        <p className="font-display text-[16.5px] leading-snug">« {claim.raw_quote} »</p>
        <p className="mt-1.5 font-display text-sm leading-snug text-muted-foreground">{claim.canonical}</p>
      </CardContent>
      <CardFooter className="mt-2 justify-between border-t border-border/60 pt-2.5 font-ui text-xs text-muted-foreground">
        <span>À vérifier</span>
        <span className="font-mono text-emerald-700" title="Délai phrase → carte">
          ⏱ {latencyLabel}
        </span>
      </CardFooter>
    </Card>
  );
}
