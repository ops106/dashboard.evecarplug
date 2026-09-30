import { ETAPE_INSTALLATION_TERMINEE, ETAPE_PROJET_ANNULE, ETAPE_VENTE_ORDER } from "@/lib/airtable/fields";
import type { Location } from "@/lib/airtable/mappers";
import { Card } from "@/components/ui/Card";

// Retire le numero d'ordre ("01. ", "02. "...) devenu redondant une fois les
// etapes affichees dans l'ordre, sous forme de barres plutot que de liste.
function stageLabel(stage: string): string {
  return stage.replace(/^\d+\.\s*/, "");
}

function fillClass(stage: string): string {
  if (stage === ETAPE_INSTALLATION_TERMINEE) return "funnel-fill funnel-fill-success";
  if (stage === ETAPE_PROJET_ANNULE) return "funnel-fill funnel-fill-danger";
  return "funnel-fill";
}

// Persona Apporteur d'affaires : combien de ses demandes sont a chaque etape
// du pipeline de vente, pour reperer ou elles coincent le plus souvent.
export function StageFunnelChart({ locations }: { locations: Location[] }) {
  const counts = ETAPE_VENTE_ORDER.map((stage) => ({
    stage,
    count: locations.filter((l) => l.stage === stage).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card className="h-full">
      <h4 className="mb-4">Vos demandes par étape</h4>
      <div>
        {counts.map(({ stage, count }) => (
          <div key={stage} className="funnel-row">
            <div className="funnel-label">{stageLabel(stage)}</div>
            <div className="funnel-track">
              <div className={fillClass(stage)} style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <div className="funnel-count">{count}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
