import { getAllLocations } from "@/lib/airtable/queries";
import { isRelocationPending, isTerminationPending, needsExternalValidation } from "@/lib/airtable/mappers";
import { StatCard } from "@/components/ui/StatCard";
import { RelocationRequestsTable } from "@/components/locations/RelocationRequestsTable";
import { TerminationRequestsTable } from "@/components/locations/TerminationRequestsTable";
import { ExternalValidationTable } from "@/components/locations/ExternalValidationTable";
import { PartnerFilter } from "@/components/locations/PartnerFilter";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const allLocations = await getAllLocations();

  const clientOptions = Array.from(
    new Map(
      allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName]),
    ),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const locations = params.client
    ? allLocations.filter((l) => l.clientId === params.client)
    : allLocations;

  const activeCount = locations.filter((l) => l.isActive).length;
  const pendingRelocations = locations.filter(isRelocationPending);
  const pendingTerminations = locations.filter(isTerminationPending);
  const pendingExternalValidation = locations.filter(needsExternalValidation);

  // Entités partenaire déjà utilisées par société (toutes locations
  // confondues), pour filtrer les choix proposés dans la popup de validation.
  const entitiesByClient: Record<string, string[]> = {};
  for (const l of allLocations) {
    if (!l.clientId || !l.partnerEntity) continue;
    const existing = entitiesByClient[l.clientId] ?? [];
    if (!existing.includes(l.partnerEntity)) entitiesByClient[l.clientId] = [...existing, l.partnerEntity];
  }

  const activeHref = params.client ? `/locations?client=${params.client}&all=1` : "/locations";

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontSize: 25 }}>Tableau de bord</h2>
        <p className="mt-1 text-sm text-muted">
          Vue d&apos;ensemble des locations de bornes électriques.
        </p>
      </div>

      <PartnerFilter clients={clientOptions} value={params.client} resetHref="/" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Locations actives" value={activeCount} href={activeHref} />
        <StatCard label="Changements d'adresse en attente" value={pendingRelocations.length} />
        <StatCard label="Arrêts de location en attente" value={pendingTerminations.length} />
      </div>

      <div>
        <div className="mb-3">
          <h4>Changements d&apos;adresse à traiter</h4>
        </div>
        <RelocationRequestsTable locations={pendingRelocations} />
      </div>

      <div>
        <div className="mb-3">
          <h4>Arrêts de location à traiter</h4>
        </div>
        <TerminationRequestsTable locations={pendingTerminations} />
      </div>

      <div>
        <div className="mb-3">
          <h4>En attente de validation par l&apos;entreprise</h4>
        </div>
        <ExternalValidationTable locations={pendingExternalValidation} entitiesByClient={entitiesByClient} />
      </div>
    </div>
  );
}
