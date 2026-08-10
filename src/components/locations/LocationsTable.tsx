import Link from "next/link";
import { type Location, isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { RelocationRequestButton } from "@/components/locations/RelocationRequestButton";
import { TerminationRequestButton } from "@/components/locations/TerminationRequestButton";

export function LocationsTable({
  locations,
  showClient = true,
}: {
  locations: Location[];
  showClient?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune location ne correspond à ces critères." />;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[860px]">
        <thead>
          <tr>
            {showClient && <th>Société</th>}
            <th>Client</th>
            <th>Date de chantier</th>
            <th>Date de première connexion farod</th>
            <th>Entité partenaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              {showClient && (
                <td className="font-medium">
                  <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                    {location.clientName}
                  </Link>
                </td>
              )}
              <td>
                <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                  {location.contact || "—"}
                </Link>
              </td>
              <td>{formatDate(location.constructionDate)}</td>
              <td>{formatDate(location.firstFarodConnectionDate)}</td>
              <td>{location.partnerEntity || "—"}</td>
              <td className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <RelocationRequestButton locationId={location.id} disabled={isRelocationPending(location)} />
                  <div className="ml-auto">
                    <TerminationRequestButton locationId={location.id} disabled={isTerminationPending(location)} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
