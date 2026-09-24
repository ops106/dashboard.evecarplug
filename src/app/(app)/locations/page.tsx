import { getAllLocations } from "@/lib/airtable/queries";
import { isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { LocationFilters } from "@/components/locations/LocationFilters";
import { LocationsTable } from "@/components/locations/LocationsTable";
import { StatCard } from "@/components/ui/StatCard";
import { BoltIcon, MapPinIcon, StopOctagonIcon } from "@/components/ui/icons";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string;
    ville?: string;
    courant?: string;
    q?: string;
    all?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, partnerId } = await getViewAsContext(session);

  const allLocations = await getAllLocations(isPartner ? { partnerId } : undefined);

  const clientOptions = Array.from(
    new Map(
      allLocations
        .filter((l) => l.clientId)
        .map((l) => [l.clientId as string, l.clientName]),
    ),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const cities = Array.from(
    new Set(allLocations.map((l) => l.city).filter((v): v is string => Boolean(v))),
  ).sort((a, b) => a.localeCompare(b));

  const currentTypes: string[] = Array.from(
    new Set(
      allLocations
        .map((l) => l.currentType)
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    ),
  ).sort();

  const scoped = params.client && !isPartner ? allLocations.filter((l) => l.clientId === params.client) : allLocations;
  // Même définition que le tableau par défaut (voir `filtered` plus bas) :
  // actif et avec une date de 1ère connexion Farod renseignée.
  const activeCount = scoped.filter((l) => l.isActive && l.firstFarodConnectionDate).length;
  const relocatingCount = scoped.filter(isRelocationPending).length;
  const terminatingCount = scoped.filter(isTerminationPending).length;

  const showAll = params.all === "1";

  const filtered = allLocations.filter((l) => {
    if (!l.firstFarodConnectionDate) return false;
    if (!showAll && !l.isActive) return false;
    if (!isPartner && params.client && l.clientId !== params.client) return false;
    if (params.ville && l.city !== params.ville) return false;
    if (params.courant && l.currentType !== params.courant) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      const haystack = [l.clientName, l.siteName, l.chargerSerial, l.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Locations</h2>
        <p className="mt-1 text-sm text-muted">
          {showAll
            ? "Toutes les demandes, tous statuts confondus."
            : "Locations actuellement en cours (bornes installées)."}{" "}
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Bornes actives" value={activeCount} icon={<BoltIcon />} />
        <StatCard label="Déménagements en cours" value={relocatingCount} icon={<MapPinIcon />} />
        <StatCard label="Résiliations en cours" value={terminatingCount} icon={<StopOctagonIcon />} />
      </div>

      <LocationFilters
        clients={clientOptions}
        cities={cities}
        currentTypes={currentTypes}
        values={params}
        showClientFilter={!isPartner}
      />

      <LocationsTable locations={filtered} linkable={!isPartner} />
    </div>
  );
}
