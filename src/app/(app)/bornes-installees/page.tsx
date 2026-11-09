import { redirect } from "next/navigation";
import { getAllAcquisitionLocations } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { LocationsExplorer } from "@/components/locations/LocationsExplorer";

// Réservée aux personas Interne et Société à contrat cadre (pipeline
// "Facturation entreprise") — l'équivalent de /locations pour ces sociétés,
// qui sont facturées à l'usage plutôt que locataires de bornes (pas de
// section "Locations" pour elles, voir Nav.tsx).
export default async function BornesInstalleesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, isApporteur, isFacturationEntreprise, partnerId } = await getViewAsContext(session);
  if (isPartner || isApporteur) redirect("/");

  const allLocations = await getAllAcquisitionLocations(isFacturationEntreprise ? { partnerId } : undefined);
  const activeLocations = allLocations.filter((l) => l.isActive && l.firstFarodConnectionDate);

  const clientOptions = Array.from(
    new Map(allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Bornes installées</h2>
        <p className="mt-1 text-sm text-muted">Installations terminées (pipeline Facturation entreprise).</p>
      </div>

      <LocationsExplorer
        locations={activeLocations}
        clientOptions={clientOptions}
        initialClient={!isFacturationEntreprise ? params.client : undefined}
        isPartner={isFacturationEntreprise}
        detailBasePath="/facturation"
        showMovementActions={false}
      />
    </div>
  );
}
