import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddFarodConnectionDateButton } from "@/components/locations/AddFarodConnectionDateButton";

export function PendingFarodConnectionTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucun chantier en attente d'une date de 1ère connexion Farod." />;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[780px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Date de chantier</th>
            <th>Date installation terminée</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td className="font-medium">{location.clientName}</td>
              <td>
                <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                  {location.contact || "—"}
                </Link>
              </td>
              <td>{formatDate(location.constructionDate)}</td>
              <td>{formatDate(location.installationDate)}</td>
              <td className="whitespace-nowrap">
                <div className="flex justify-end">
                  <AddFarodConnectionDateButton locationId={location.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
