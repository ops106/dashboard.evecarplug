import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { groupLocationsByStage } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

export function PendingRequestsTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande en cours d'installation." />;
  }

  const groups = groupLocationsByStage(locations);

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[780px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Date de la demande</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.status}>
              <tr className="status-group-row">
                <td colSpan={5}>
                  {group.status} · {group.locations.length}
                </td>
              </tr>
              {group.locations.map((location) => (
                <tr key={location.id}>
                  <td className="font-medium">
                    <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                      {location.clientName}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                      {location.contact || "—"}
                    </Link>
                  </td>
                  <td>{location.email || "—"}</td>
                  <td>{location.phone || "—"}</td>
                  <td>{formatDate(location.requestDate)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
