import { getAllLocations, getPartnerCommissionInfo, getPendingQuoteRequests, getReferredLocations } from "@/lib/airtable/queries";
import {
  isCancelled,
  isNotYetInstalled,
  isRelocationPending,
  isTerminationPending,
  needsExternalValidation,
} from "@/lib/airtable/mappers";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { StatCard } from "@/components/ui/StatCard";
import {
  BoltIcon,
  CheckBadgeIcon,
  ClockIcon,
  CoinsIcon,
  InboxIcon,
  MapPinIcon,
  StopOctagonIcon,
} from "@/components/ui/icons";
import { ExternalValidationTable } from "@/components/locations/ExternalValidationTable";
import { QuoteValidationTable } from "@/components/locations/QuoteValidationTable";
import { DashboardActionTabs } from "@/components/locations/DashboardActionTabs";
import { PartnerFilter } from "@/components/locations/PartnerFilter";
import { StageFunnelChart } from "@/components/locations/StageFunnelChart";
import { MonthlyOutcomeChart } from "@/components/locations/MonthlyOutcomeChart";

// Persona interne : trie par société pour regrouper les demandes d'un même
// client, plus facile à traiter que l'ordre d'arrivée brut d'Airtable.
function sortByClient<T extends { clientName: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.clientName.localeCompare(b.clientName));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, isApporteur, partnerId } = await getViewAsContext(session);

  // Persona Apporteur d'affaires (ou interne "voir comme" un apporteur) : ses
  // demandes vivent hors du pipeline Location (voir getReferredLocations) et
  // n'ont ni changement d'adresse ni arrêt de location — juste un résumé de
  // son propre entonnoir commercial.
  if (isApporteur) {
    const [referred, commissionInfo] = await Promise.all([
      partnerId ? getReferredLocations(partnerId) : Promise.resolve([]),
      partnerId ? getPartnerCommissionInfo(partnerId) : Promise.resolve(null),
    ]);
    const inProgress = referred.filter((l) => isNotYetInstalled(l) && !isCancelled(l)).length;
    const installed = referred.length - referred.filter(isNotYetInstalled).length;
    const lost = referred.filter(isCancelled).length;
    const formatEuros = (amount: number) => `${amount.toLocaleString("fr-FR")} €`;

    return (
      <div className="space-y-8">
        <div>
          <h2 style={{ fontSize: 25 }}>Tableau de bord</h2>
          <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble de vos demandes apportées.</p>
        </div>

        {commissionInfo && (
          <div className="commission-hero">
            <div className="commission-hero-icon">
              <CoinsIcon />
            </div>
            <div className="commission-hero-item">
              <span className="commission-hero-label">Commission acquise</span>
              <span className="commission-hero-value">{formatEuros(commissionInfo.commission)}</span>
            </div>
            <div className="commission-hero-divider" />
            <div className="commission-hero-item">
              <span className="commission-hero-label">Commission potentielle</span>
              <span className="commission-hero-value">{formatEuros(commissionInfo.potentialCommission)}</span>
              <span className="commission-hero-hint">Si les demandes en cours aboutissent</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="En cours" value={inProgress} icon={<ClockIcon />} />
          <StatCard label="Installées" value={installed} icon={<BoltIcon />} />
          <StatCard label="Perdues" value={lost} icon={<StopOctagonIcon />} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <StageFunnelChart locations={referred} />
          </div>
          <div className="lg:col-span-3">
            <MonthlyOutcomeChart locations={referred} />
          </div>
        </div>
      </div>
    );
  }

  const [allLocations, allQuoteRequests] = await Promise.all([
    getAllLocations(isPartner ? { partnerId } : undefined),
    getPendingQuoteRequests(isPartner ? { partnerId } : undefined),
  ]);

  const clientOptions = Array.from(
    new Map(
      allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName]),
    ),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const locations = params.client && !isPartner
    ? allLocations.filter((l) => l.clientId === params.client)
    : allLocations;

  const pendingRelocations = locations.filter(isRelocationPending);
  const pendingTerminations = locations.filter(isTerminationPending);
  const pendingExternalValidation = locations.filter(needsExternalValidation);
  const pendingQuoteValidation =
    params.client && !isPartner
      ? allQuoteRequests.filter((l) => l.clientId === params.client)
      : allQuoteRequests;

  // Entités partenaire déjà utilisées par société (toutes locations
  // confondues), pour filtrer les choix proposés dans la popup de validation.
  const entitiesByClient: Record<string, string[]> = {};
  for (const l of allLocations) {
    if (!l.clientId || !l.partnerEntity) continue;
    const existing = entitiesByClient[l.clientId] ?? [];
    if (!existing.includes(l.partnerEntity)) entitiesByClient[l.clientId] = [...existing, l.partnerEntity];
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontSize: 25 }}>Tableau de bord</h2>
        <p className="mt-1 text-sm text-muted">
          Vue d&apos;ensemble des locations de bornes électriques.
        </p>
      </div>

      {!isPartner && <PartnerFilter clients={clientOptions} value={params.client} resetHref="/" />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!isPartner && (
          <>
            <StatCard
              label="Changements d'adresse en attente"
              value={pendingRelocations.length}
              icon={<MapPinIcon />}
            />
            <StatCard
              label="Arrêts de location en attente"
              value={pendingTerminations.length}
              icon={<StopOctagonIcon />}
            />
          </>
        )}
        <StatCard
          label="Validations en attente"
          value={pendingExternalValidation.length}
          icon={<CheckBadgeIcon />}
        />
        <StatCard
          label="Ajouts supplémentaires à valider"
          value={pendingQuoteValidation.length}
          icon={<InboxIcon />}
        />
      </div>

      {!isPartner && (
        <DashboardActionTabs
          relocations={sortByClient(pendingRelocations)}
          terminations={sortByClient(pendingTerminations)}
          externalValidation={sortByClient(pendingExternalValidation)}
          entitiesByClient={entitiesByClient}
          quoteValidation={sortByClient(pendingQuoteValidation)}
        />
      )}

      {isPartner && (
        <>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h4>En attente de validation par l&apos;entreprise</h4>
              <span className="tag tag-accent">{pendingExternalValidation.length}</span>
            </div>
            <ExternalValidationTable locations={pendingExternalValidation} entitiesByClient={entitiesByClient} />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <h4>Travaux supplémentaires à valider</h4>
              <span className="tag tag-accent">{pendingQuoteValidation.length}</span>
            </div>
            <QuoteValidationTable locations={pendingQuoteValidation} />
          </div>
        </>
      )}
    </div>
  );
}
