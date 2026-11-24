import { redirect } from "next/navigation";
import { getAllAcquisitionLocations, getPartnerFarodMap } from "@/lib/airtable/queries";
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

  const [allLocations, farodMap] = await Promise.all([
    getAllAcquisitionLocations(isFacturationEntreprise ? { partnerId } : undefined),
    getPartnerFarodMap(),
  ]);
  // Farod = "Non" sur le Partenaire : pas de bornes connectees, donc jamais
  // de date de 1ere connexion farod — une installation terminee compte comme
  // active sans l'exiger (voir getPartnerFarodMap).
  const activeLocations = allLocations.filter(
    (l) => l.isActive && (farodMap.get(l.clientId ?? "") === "Non" || l.firstFarodConnectionDate),
  );
  // Vue scopee a une seule societe (persona partenaire_facturation) : masque
  // la colonne farod entierement si elle ne s'applique pas a elle. En vue
  // interne (plusieurs societes), on la garde — pertinente pour les autres.
  const hideFarodColumn = isFacturationEntreprise && farodMap.get(partnerId ?? "") === "Non";

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
        showFarodColumn={!hideFarodColumn}
      />
    </div>
  );
}
