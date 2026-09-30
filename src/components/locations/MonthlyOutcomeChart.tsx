import { ETAPE_INSTALLATION_TERMINEE } from "@/lib/airtable/fields";
import { isCancelled } from "@/lib/airtable/mappers";
import type { Location } from "@/lib/airtable/mappers";
import { Card } from "@/components/ui/Card";

const MONTHS_SHOWN = 6;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Les 6 derniers mois (mois courant inclus), du plus ancien au plus recent —
// toujours les memes colonnes meme si un mois n'a aucune demande.
function lastMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { key: monthKey(d), label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
  });
}

// Persona Apporteur d'affaires : rythme de ses demandes mois par mois
// (groupees sur la date de la demande), avec leur issue actuelle — pour voir
// une tendance plutot qu'une simple photo instantanee.
export function MonthlyOutcomeChart({ locations }: { locations: Location[] }) {
  const months = lastMonths(MONTHS_SHOWN);

  const buckets = months.map(({ key, label }) => {
    const inMonth = locations.filter((l) => l.requestDate?.startsWith(key));
    const installed = inMonth.filter((l) => l.stage === ETAPE_INSTALLATION_TERMINEE).length;
    const lost = inMonth.filter(isCancelled).length;
    const inProgress = inMonth.length - installed - lost;
    return { label, installed, inProgress, lost, total: inMonth.length };
  });

  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));

  return (
    <Card className="h-full flex flex-col">
      <h4 className="mb-4">Vos demandes par mois</h4>
      <div className="monthly-chart flex-1">
        {buckets.map((b) => (
          <div key={b.label} className="monthly-chart-col">
            <div className="monthly-chart-total">{b.total || ""}</div>
            <div className="monthly-chart-bar">
              <div className="monthly-chart-track" style={{ height: `${(b.total / maxTotal) * 100}%` }}>
                {b.installed > 0 && (
                  <div className="monthly-seg monthly-seg-success" style={{ height: `${(b.installed / b.total) * 100}%` }} />
                )}
                {b.inProgress > 0 && (
                  <div className="monthly-seg monthly-seg-accent" style={{ height: `${(b.inProgress / b.total) * 100}%` }} />
                )}
                {b.lost > 0 && (
                  <div className="monthly-seg monthly-seg-danger" style={{ height: `${(b.lost / b.total) * 100}%` }} />
                )}
              </div>
            </div>
            <div className="monthly-chart-label text-muted">{b.label}</div>
          </div>
        ))}
      </div>
      <div className="monthly-chart-legend">
        <span>
          <i className="legend-dot legend-dot-accent" /> En cours
        </span>
        <span>
          <i className="legend-dot legend-dot-success" /> Installées
        </span>
        <span>
          <i className="legend-dot legend-dot-danger" /> Perdues
        </span>
      </div>
    </Card>
  );
}
