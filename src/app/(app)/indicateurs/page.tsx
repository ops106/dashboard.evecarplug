import { redirect } from "next/navigation";
import { getUsageLog } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { StatCard } from "@/components/ui/StatCard";
import { BoltIcon, CheckBadgeIcon, ClockIcon, InboxIcon } from "@/components/ui/icons";
import { StatusCountTable } from "@/components/kpi/StatusCountTable";

const DAY_MS = 24 * 60 * 60 * 1000;

// Isolé du composant : la règle react-hooks/purity interdit d'appeler
// Date.now() directement dans le corps d'un composant.
function filterLast7Days<T extends { date?: string }>(entries: T[]): T[] {
  const now = Date.now();
  return entries.filter((e) => e.date && now - new Date(e.date).getTime() <= 7 * DAY_MS);
}

function countBy(items: (string | undefined)[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item) continue;
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// Page reservee au persona interne : usage reel de l'outil (clics
// enregistres via logUsage — voir usage-log.ts), pas des comptages de
// statuts Airtable. Volume par fonctionnalite, utilisateurs actifs, et taux
// de refus/validation par flux.
export default async function IndicateursPage() {
  const session = await getSessionUser();
  if (session?.role !== "interne") redirect("/");

  const log = await getUsageLog();

  const last7Days = filterLast7Days(log);

  const activeUsers = new Set(log.map((e) => e.actor)).size;
  const activeUsers7Days = new Set(last7Days.map((e) => e.actor)).size;

  const featureRows = countBy(log.map((e) => e.feature));
  const actionRows = countBy(log.map((e) => e.action));
  const userRows = countBy(log.map((e) => e.actor)).slice(0, 10);

  function pairCount(validateAction: string, refuseAction: string) {
    const validated = log.filter((e) => e.action === validateAction).length;
    const refused = log.filter((e) => e.action === refuseAction).length;
    const total = validated + refused;
    return { validated, refused, refusalRate: total > 0 ? `${Math.round((refused / total) * 100)}%` : "—" };
  }

  const funnels = [
    { label: "Déménagement", ...pairCount("Accepter déménagement", "Refuser déménagement") },
    { label: "Résiliation", ...pairCount("Accepter résiliation", "Refuser résiliation") },
    { label: "Validation externe", ...pairCount("Valider demande externe", "Refuser demande externe") },
    { label: "Devis", ...pairCount("Valider devis", "Refuser devis") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontSize: 25 }}>KPI utilisation</h2>
        <p className="mt-1 text-sm text-muted">
          Usage réel de l&apos;outil : actions effectuées, utilisateurs actifs, taux de traitement par fonctionnalité.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Actions totales" value={log.length} icon={<InboxIcon />} />
        <StatCard label="Actions (7 derniers jours)" value={last7Days.length} icon={<ClockIcon />} />
        <StatCard label="Utilisateurs actifs (total)" value={activeUsers} icon={<CheckBadgeIcon />} />
        <StatCard label="Utilisateurs actifs (7 derniers jours)" value={activeUsers7Days} icon={<BoltIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusCountTable
          title="Usage par fonctionnalité"
          sub="Nombre d'actions enregistrées, par fonctionnalité."
          rows={featureRows}
          labelHeader="Fonctionnalité"
        />
        <StatusCountTable
          title="Usage par action"
          sub="Détail action par action."
          rows={actionRows}
          labelHeader="Action"
        />
        <StatusCountTable
          title="Utilisateurs les plus actifs"
          sub="Top 10, toutes fonctionnalités confondues."
          rows={userRows}
          labelHeader="Utilisateur"
        />
      </div>

      <div>
        <h4 className="mb-3">Taux de traitement par fonctionnalité</h4>
        <div className="card overflow-x-auto p-0">
          <table className="table min-w-[600px]">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th style={{ textAlign: "right" }}>Validés</th>
                <th style={{ textAlign: "right" }}>Refusés</th>
                <th style={{ textAlign: "right" }}>Taux de refus</th>
              </tr>
            </thead>
            <tbody>
              {funnels.map((f) => (
                <tr key={f.label}>
                  <td className="font-medium">{f.label}</td>
                  <td style={{ textAlign: "right" }}>{f.validated}</td>
                  <td style={{ textAlign: "right" }}>{f.refused}</td>
                  <td style={{ textAlign: "right" }}>{f.refusalRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
