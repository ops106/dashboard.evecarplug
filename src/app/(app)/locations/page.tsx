import { redirect } from "next/navigation";
import { getAllLocations } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { LocationsExplorer } from "@/components/locations/LocationsExplorer";

// Réservée aux personas Interne et Partenaire location — ni un Apporteur
// d'affaires ni une société à contrat cadre (Facturation entreprise, voir
// /bornes-installees) n'ont accès à cette notion de location.
export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, isApporteur, isFacturationEntreprise, partnerId } = await getViewAsContext(session);
  if (isApporteur || isFacturationEntreprise) redirect("/");

  const allLocations = await getAllLocations(isPartner ? { partnerId } : undefined);
  const activeLocations = allLocations.filter((l) => l.isActive && l.firstFarodConnectionDate);

  const clientOptions = Array.from(
    new Map(allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Locations</h2>
        <p className="mt-1 text-sm text-muted">Locations actuellement en cours (bornes installées).</p>
      </div>

      <LocationsExplorer
        locations={activeLocations}
        clientOptions={clientOptions}
        initialClient={!isPartner ? params.client : undefined}
        isPartner={isPartner}
      />
    </div>
  );
}
