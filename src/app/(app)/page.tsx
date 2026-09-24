import { getAllLocations, getPendingQuoteRequests } from "@/lib/airtable/queries";
import { isRelocationPending, isTerminationPending, needsExternalValidation } from "@/lib/airtable/mappers";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { StatCard } from "@/components/ui/StatCard";
import { CheckBadgeIcon, InboxIcon, MapPinIcon, StopOctagonIcon } from "@/components/ui/icons";
import { RelocationRequestsTable } from "@/components/locations/RelocationRequestsTable";
import { TerminationRequestsTable } from "@/components/locations/TerminationRequestsTable";
import { ExternalValidationTable } from "@/components/locations/ExternalValidationTable";
import { QuoteValidationTable } from "@/components/locations/QuoteValidationTable";
import { PartnerFilter } from "@/components/locations/PartnerFilter";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, partnerId } = await getViewAsContext(session);

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
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4>Changements d&apos;adresse à traiter</h4>
            <span className="tag tag-accent">{pendingRelocations.length}</span>
          </div>
          <RelocationRequestsTable locations={pendingRelocations} />
        </div>
      )}

      {!isPartner && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4>Arrêts de location à traiter</h4>
            <span className="tag tag-accent">{pendingTerminations.length}</span>
          </div>
          <TerminationRequestsTable locations={pendingTerminations} />
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h4>En attente de validation par l&apos;entreprise</h4>
          <span className="tag tag-accent">{pendingExternalValidation.length}</span>
        </div>
        <ExternalValidationTable
          locations={pendingExternalValidation}
          entitiesByClient={entitiesByClient}
          linkable={!isPartner}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h4>Travaux supplémentaires à valider</h4>
          <span className="tag tag-accent">{pendingQuoteValidation.length}</span>
        </div>
        <QuoteValidationTable locations={pendingQuoteValidation} />
      </div>
    </div>
  );
}
