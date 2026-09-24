import Link from "next/link";
import { getAllLocations, getMovementHistory } from "@/lib/airtable/queries";
import { isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { RELOCATION_STATUS_ORDER, TERMINATION_STATUS_ORDER } from "@/lib/airtable/fields";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { RelocationRequestsTable } from "@/components/locations/RelocationRequestsTable";
import { TerminationRequestsTable } from "@/components/locations/TerminationRequestsTable";
import { MovementsStatusTabs } from "@/components/locations/MovementsStatusTabs";
import { MovementHistoryTable } from "@/components/locations/MovementHistoryTable";
import { PartnerFilter } from "@/components/locations/PartnerFilter";
import { StatCard } from "@/components/ui/StatCard";
import { MapPinIcon, StopOctagonIcon } from "@/components/ui/icons";

const RELOCATION_STATUS_TERMINE = RELOCATION_STATUS_ORDER[RELOCATION_STATUS_ORDER.length - 1];
const TERMINATION_STATUS_RESILIE = TERMINATION_STATUS_ORDER[TERMINATION_STATUS_ORDER.length - 1];

// Pour l'instant : les deux premiers tableaux de la page Tableau de bord
// (changements d'adresse et arrêts de location à traiter), plus un onglet
// Historique des mouvements aboutis. À enrichir plus tard.
export default async function MouvementsLocatifsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const showHistory = params.tab === "historique";
  const session = await getSessionUser();
  const { isPartner, partnerId } = await getViewAsContext(session);

  const allLocations = await getAllLocations(isPartner ? { partnerId } : undefined);

  const clientOptions = Array.from(
    new Map(allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const locations = params.client && !isPartner ? allLocations.filter((l) => l.clientId === params.client) : allLocations;

  const pendingRelocations = locations.filter(isRelocationPending);
  const pendingTerminations = locations.filter(isTerminationPending);
  const completedRelocations = locations.filter((l) => l.relocation.status === RELOCATION_STATUS_TERMINE);
  const completedTerminations = locations.filter((l) => l.termination.status === TERMINATION_STATUS_RESILIE);

  // La liste interne affiche tout le pipeline, y compris les statuts
  // terminaux (Terminé/Refusé, Résilié/Refusé) — pas seulement ce qui est
  // encore à traiter.
  const allRelocations = locations.filter((l) => Boolean(l.relocation.status));
  const allTerminations = locations.filter((l) => Boolean(l.termination.status));

  const history = showHistory ? await getMovementHistory(isPartner ? { partnerId } : undefined) : [];

  const tabHref = (tab?: string) => {
    const qs = new URLSearchParams();
    if (params.client && !isPartner) qs.set("client", params.client);
    if (tab) qs.set("tab", tab);
    const query = qs.toString();
    return `/mouvements-locatifs${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontSize: 25 }}>Mouvements locatifs</h2>
        <p className="mt-1 text-sm text-muted">
          Changements d&apos;adresse et arrêts de location en cours.
        </p>
      </div>

      {!isPartner && (
        <PartnerFilter
          clients={clientOptions}
          value={params.client}
          resetHref={tabHref(showHistory ? "historique" : undefined)}
          extraParams={showHistory ? { tab: "historique" } : undefined}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Déménagements en cours" value={pendingRelocations.length} icon={<MapPinIcon />} />
        <StatCard label="Résiliations en cours" value={pendingTerminations.length} icon={<StopOctagonIcon />} />
        <StatCard label="Déménagements terminés" value={completedRelocations.length} icon={<MapPinIcon />} />
        <StatCard label="Résiliations réalisées" value={completedTerminations.length} icon={<StopOctagonIcon />} />
      </div>

      <div className="tabs">
        <Link
          href={tabHref()}
          className={`tab ${!showHistory ? "tab-active" : ""}`}
          aria-current={!showHistory ? "page" : undefined}
        >
          Suivi
        </Link>
        <Link
          href={tabHref("historique")}
          className={`tab ${showHistory ? "tab-active" : ""}`}
          aria-current={showHistory ? "page" : undefined}
        >
          Historique
        </Link>
      </div>

      {showHistory ? (
        <MovementHistoryTable entries={history} />
      ) : isPartner ? (
        <>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h4>Changements d&apos;adresse à traiter</h4>
              <span className="tag tag-accent">{pendingRelocations.length}</span>
            </div>
            <RelocationRequestsTable locations={pendingRelocations} linkable={false} canManage={false} />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <h4>Arrêts de location à traiter</h4>
              <span className="tag tag-accent">{pendingTerminations.length}</span>
            </div>
            <TerminationRequestsTable locations={pendingTerminations} linkable={false} canManage={false} />
          </div>
        </>
      ) : (
        <MovementsStatusTabs relocations={allRelocations} terminations={allTerminations} />
      )}
    </div>
  );
}
