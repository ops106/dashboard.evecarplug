import Link from "next/link";
import type { Client, Location } from "@/lib/airtable/mappers";
import { Card } from "@/components/ui/Card";
import { LocationsTable } from "@/components/locations/LocationsTable";

// Contenu partagé par la page complète (src/app/(app)/clients/[id]/page.tsx)
// et la modale glissante (src/app/(app)/@modal/(.)clients/[id]/page.tsx) —
// même logique que LocationDetailForm pour la fiche location.
export function ClientDetailContent({
  client,
  activeLocations,
}: {
  client: Client;
  activeLocations: Location[];
}) {
  return (
    <div className="space-y-6">
      <h2 style={{ fontSize: 25 }}>{client.name}</h2>

      <Card>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
            <dd className="mt-0.5 text-sm">{client.type ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-0.5 text-sm">{client.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Locations actives</dt>
            <dd className="mt-0.5 text-sm">{activeLocations.length}</dd>
          </div>
        </dl>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4>Locations actives</h4>
          <Link
            href={`/locations?client=${client.id}&all=1`}
            className="text-sm text-muted hover:text-[var(--color-accent)]"
          >
            Voir tout dans Locations →
          </Link>
        </div>
        <LocationsTable locations={activeLocations} showClient={false} />
      </div>
    </div>
  );
}
