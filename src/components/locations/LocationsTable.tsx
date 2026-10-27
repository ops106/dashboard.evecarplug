import Link from "next/link";
import { type Location, isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";
import { RelocationRequestButton } from "@/components/locations/RelocationRequestButton";
import { TerminationRequestButton } from "@/components/locations/TerminationRequestButton";

function toExportRows(locations: Location[], showClient: boolean) {
  return locations.map((l) => ({
    ...(showClient ? { Société: l.clientName } : {}),
    Client: l.contact || "—",
    Email: l.email || "—",
    Téléphone: l.phone || "—",
    Adresse: l.fullAddress || l.address || "—",
    "Étape de vente": l.stage ?? "—",
    "Date de chantier": toExportDate(l.constructionDate),
    "Date de première connexion farod": toExportDate(l.firstFarodConnectionDate),
    "Nouvelle adresse": l.relocation.newAddress || "—",
    "Entité partenaire": l.partnerEntity || "—",
  }));
}

export function LocationsTable({
  locations,
  showClient = true,
  linkable = true,
}: {
  locations: Location[];
  showClient?: boolean;
  linkable?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune location ne correspond à ces critères." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(locations, showClient)} filename="locations.xlsx" />
      </div>
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
                {showClient && <td className="font-medium">{location.clientName}</td>}
                <td>
                  {linkable ? (
                    <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                      {location.contact || "—"}
                    </Link>
                  ) : (
                    location.contact || "—"
                  )}
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
    </div>
  );
}
