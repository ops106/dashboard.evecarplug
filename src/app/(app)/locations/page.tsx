import { getAllLocations, getPartnerLocationContactByEmail, getPartnerLocationContacts } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { LocationFilters } from "@/components/locations/LocationFilters";
import { LocationsTable } from "@/components/locations/LocationsTable";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string;
    ville?: string;
    courant?: string;
    q?: string;
    all?: string;
    viewAs?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const isInterne = session?.role === "interne";

  let isPartner = session?.role === "partenaire_location";
  let partnerId = session?.partnerId;
  let viewAsEmail: string | undefined;

  if (isInterne && params.viewAs) {
    const contact = await getPartnerLocationContactByEmail(params.viewAs);
    if (contact) {
      isPartner = true;
      partnerId = contact.partnerId;
      viewAsEmail = contact.email;
    }
  }

  const partnerContacts = isInterne ? await getPartnerLocationContacts() : [];

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

  const showAll = params.all === "1";

  const filtered = allLocations.filter((l) => {
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

      <LocationFilters
        clients={clientOptions}
        cities={cities}
        currentTypes={currentTypes}
        values={{ ...params, viewAs: viewAsEmail }}
        showClientFilter={!isPartner}
        partnerContacts={
          isInterne
            ? partnerContacts.map((c) => ({ value: c.email, label: `${c.partnerName} — ${c.name} (${c.email})` }))
            : undefined
        }
      />

      <LocationsTable locations={filtered} linkable={!isPartner} />
    </div>
  );
}
