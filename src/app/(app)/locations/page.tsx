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
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, partnerId } = await getViewAsContext(session);

  const allLocations = await getAllLocations(isPartner ? { partnerId } : undefined);

  const activeCount = allLocations.filter((l) => l.isActive && l.firstFarodConnectionDate).length;
  const relocatingCount = allLocations.filter(isRelocationPending).length;
  const terminatingCount = allLocations.filter(isTerminationPending).length;

  const filtered = allLocations.filter((l) => {
    if (!l.firstFarodConnectionDate) return false;
    if (!l.isActive) return false;
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
          Locations actuellement en cours (bornes installées). {filtered.length} résultat
          {filtered.length > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Bornes actives" value={activeCount} icon={<BoltIcon />} />
        <StatCard label="Déménagements en cours" value={relocatingCount} icon={<MapPinIcon />} />
        <StatCard label="Résiliations en cours" value={terminatingCount} icon={<StopOctagonIcon />} />
      </div>

      <LocationFilters values={params} />

      <LocationsTable locations={filtered} linkable={!isPartner} />
    </div>
  );
}
