import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById, getLocationsByClientId } from "@/lib/airtable/queries";
import { Card } from "@/components/ui/Card";
import { LocationsTable } from "@/components/locations/LocationsTable";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const locations = await getLocationsByClientId(id);
  const activeLocations = locations.filter((l) => l.isActive);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clients" className="text-sm text-muted hover:text-[var(--color-accent)]">
          ← Retour aux clients
        </Link>
        <h2 className="mt-2" style={{ fontSize: 25 }}>{client.name}</h2>
      </div>

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
            <dt className="text-xs uppercase tracking-wide text-muted">
              Locations actives
            </dt>
            <dd className="mt-0.5 text-sm">{activeLocations.length}</dd>
          </div>
        </dl>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4>Locations actives</h4>
          <Link
            href={`/locations?client=${id}&all=1`}
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
