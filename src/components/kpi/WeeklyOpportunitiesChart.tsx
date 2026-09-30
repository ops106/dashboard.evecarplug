import { Card } from "@/components/ui/Card";

// Reutilise les classes .funnel-* (deja utilisees par le tableau de bord
// Apporteur d'affaires) pour rester visuellement coherent sans dupliquer de
// CSS pour une simple liste de barres horizontales.
export function WeeklyOpportunitiesChart({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <Card>
      <h4 className="mb-1">Opportunités créées par semaine</h4>
      <p className="mb-4 text-sm text-muted">Année en cours, du lundi au dimanche.</p>
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {rows.map((r) => (
          <div key={r.label} className="funnel-row">
            <div className="funnel-label" style={{ width: 130 }}>
              {r.label}
            </div>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
            <div className="funnel-count">{r.count}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
