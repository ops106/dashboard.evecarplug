import { redirect } from "next/navigation";
import { getAllOpportunities, getUsageLog } from "@/lib/airtable/queries";
import { ETAPE_INSTALLATION_TERMINEE, ETAPE_PROJET_ANNULE } from "@/lib/airtable/fields";
import type { OpportunityRecord } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { StatCard } from "@/components/ui/StatCard";
import { BoltIcon, CheckBadgeIcon, ClockIcon, InboxIcon } from "@/components/ui/icons";
import { StatusCountTable } from "@/components/kpi/StatusCountTable";
import { OpenOpportunitiesTable } from "@/components/kpi/OpenOpportunitiesTable";
import { WeeklyOpportunitiesChart } from "@/components/kpi/WeeklyOpportunitiesChart";
import { KpiTabs } from "@/components/kpi/KpiTabs";

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

// Lundi (UTC) de la semaine contenant `date` — sert de clé de regroupement,
// plus simple que le numéro de semaine ISO pour un rapport "par semaine".
function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

function weekKey(date: Date): string {
  return mondayOf(date).toISOString().slice(0, 10);
}

function weekLabel(key: string): string {
  const monday = new Date(`${key}T00:00:00Z`);
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// Une ligne par semaine depuis le 1er janvier de l'année en cours jusqu'à
// aujourd'hui (même les semaines sans aucune création, à 0).
function weeksSinceStartOfYear(now: Date): string[] {
  const start = mondayOf(new Date(Date.UTC(now.getFullYear(), 0, 1)));
  const end = mondayOf(now);
  const weeks: string[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    weeks.push(cursor.toISOString().slice(0, 10));
  }
  return weeks;
}

// "Ouverte" = étape de vente pas encore à un stade terminal (installée ou
// projet annulé) — plus fiable que "Statut", pas toujours renseigné de façon
// cohérente selon le pipeline.
function isOpenOpportunity(o: OpportunityRecord): boolean {
  return Boolean(o.stage) && o.stage !== ETAPE_INSTALLATION_TERMINEE && o.stage !== ETAPE_PROJET_ANNULE;
}

// Nombre d'opportunités ouvertes créées ces 2 dernières semaines / ces 2
// derniers mois, groupées par `groupBy(o)` (société ou pipeline).
function openCountsByGroup(
  opportunities: OpportunityRecord[],
  groupBy: (o: OpportunityRecord) => string,
  since2Weeks: Date,
  since2Months: Date,
): { label: string; last2Weeks: number; last2Months: number }[] {
  const counts = new Map<string, { last2Weeks: number; last2Months: number }>();
  for (const o of opportunities) {
    if (!isOpenOpportunity(o) || !o.createdAt) continue;
    const createdAt = new Date(o.createdAt);
    if (createdAt < since2Months) continue;
    const label = groupBy(o);
    const entry = counts.get(label) ?? { last2Weeks: 0, last2Months: 0 };
    entry.last2Months += 1;
    if (createdAt >= since2Weeks) entry.last2Weeks += 1;
    counts.set(label, entry);
  }
  return Array.from(counts.entries())
    .map(([label, c]) => ({ label, ...c }))
    .sort((a, b) => b.last2Months - a.last2Months);
}

// Page reservee au persona interne : usage reel de l'outil (clics
// enregistres via logUsage — voir usage-log.ts), pas des comptages de
// statuts Airtable. Volume par fonctionnalite, utilisateurs actifs, et taux
// de refus/validation par flux.
export default async function IndicateursPage() {
  const session = await getSessionUser();
  if (session?.role !== "interne") redirect("/");

  const [log, opportunities] = await Promise.all([getUsageLog(), getAllOpportunities()]);

  const last7Days = filterLast7Days(log);

  const now = new Date();
  const since2Weeks = new Date(now.getTime() - 14 * DAY_MS);
  const since2Months = new Date(now.getTime() - 60 * DAY_MS);

  const weeklyOpportunityRows = weeksSinceStartOfYear(now).map((key) => ({
    label: weekLabel(key),
    count: opportunities.filter((o) => o.createdAt && weekKey(new Date(o.createdAt)) === key).length,
  }));

  const openByPartner = openCountsByGroup(opportunities, (o) => o.partnerName, since2Weeks, since2Months);
  const openByPipeline = openCountsByGroup(opportunities, (o) => o.pipelineName, since2Weeks, since2Months);

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

  const usageTab = (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Usage réel de l&apos;outil : actions effectuées, utilisateurs actifs, taux de traitement par fonctionnalité.
      </p>

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

  const opportunitiesTab = (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Toutes les demandes de la base, tous pipelines confondus (pas seulement Location).
      </p>

      <WeeklyOpportunitiesChart rows={weeklyOpportunityRows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OpenOpportunitiesTable
          title="Opportunités ouvertes par société"
          sub="Créées récemment, étape de vente pas encore installée ni annulée."
          labelHeader="Société"
          rows={openByPartner}
        />
        <OpenOpportunitiesTable
          title="Opportunités ouvertes par pipeline"
          sub="Créées récemment, étape de vente pas encore installée ni annulée."
          labelHeader="Pipeline"
          rows={openByPipeline}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 25 }}>KPI</h2>
      </div>

      <KpiTabs usage={usageTab} opportunities={opportunitiesTab} />
    </div>
  );
}
