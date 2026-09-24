import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { canAcceptRelocation, canRefuseRelocation, groupRelocationsByStatus, relocationAcceptLabel } from "@/lib/airtable/mappers";
import { acceptRelocationAction, refuseRelocationAction } from "@/lib/airtable/relocation-actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";

export function RelocationRequestsTable({
  locations,
  linkable = true,
  canManage = true,
}: {
  locations: Location[];
  linkable?: boolean;
  canManage?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de changement d'adresse en cours." />;
  }

  const groups = groupRelocationsByStatus(locations);
  // Statut et Actions sont mutuellement exclusifs (l'un ou l'autre selon
  // canManage) : la colonne compte toujours 6.
  const columnCount = 6;

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[920px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            {!canManage && <th>Statut</th>}
            <th>Nouvelle adresse</th>
            <th>Nouveau CP</th>
            <th>Nouvelle ville</th>
            {canManage && <th style={{ textAlign: "right" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.status}>
              <tr className="status-group-row">
                <td colSpan={columnCount}>
                  {group.status} · {group.locations.length}
                </td>
              </tr>
              {group.locations.map((location) => (
                <tr key={location.id}>
                  <td className="font-medium">
                    {linkable ? (
                      <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                        {location.clientName}
                      </Link>
                    ) : (
                      location.clientName
                    )}
                  </td>
                  <td>
                    {linkable ? (
                      <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                        {location.requesterName}
                      </Link>
                    ) : (
                      location.requesterName
                    )}
                  </td>
                  {!canManage && (
                    <td>
                      <StatusBadge value={location.relocation.status} />
                    </td>
                  )}
                  <td>{location.relocation.newAddress || "—"}</td>
                  <td>{location.relocation.newPostalCode || "—"}</td>
                  <td>{location.relocation.newCity || "—"}</td>
                  {canManage && (
                    <td className="whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        {canAcceptRelocation(location.relocation.status) && (
                          <form action={acceptRelocationAction.bind(null, location.id)}>
                            <button type="submit" className="btn btn-secondary btn-wide">
                              {relocationAcceptLabel(location.relocation.status)}
                            </button>
                          </form>
                        )}
                        {canRefuseRelocation(location.relocation.status) && (
                          <form action={refuseRelocationAction.bind(null, location.id)}>
                            <button type="submit" className="btn btn-danger btn-sm">
                              Refuser
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
