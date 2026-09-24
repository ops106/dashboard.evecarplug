import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { canAcceptTermination, canRefuseTermination, groupTerminationsByStatus, terminationAcceptLabel } from "@/lib/airtable/mappers";
import { acceptTerminationAction, refuseTerminationAction } from "@/lib/airtable/termination-actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";

export function TerminationRequestsTable({
  locations,
  linkable = true,
  canManage = true,
}: {
  locations: Location[];
  linkable?: boolean;
  canManage?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande d'arrêt de location en cours." />;
  }

  const groups = groupTerminationsByStatus(locations);
  // Statut et Actions sont mutuellement exclusifs (l'un ou l'autre selon
  // canManage) : la colonne compte toujours 6.
  const columnCount = 6;

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[860px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            {!canManage && <th>Statut</th>}
            <th>Adresse</th>
            <th>Code postal</th>
            <th>Ville</th>
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
                      <StatusBadge value={location.termination.status} />
                    </td>
                  )}
                  <td>{location.address || "—"}</td>
                  <td>{location.postalCode || "—"}</td>
                  <td>{location.city || "—"}</td>
                  {canManage && (
                    <td className="whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        {canAcceptTermination(location.termination.status) && (
                          <form action={acceptTerminationAction.bind(null, location.id)}>
                            <button type="submit" className="btn btn-secondary btn-wide">
                              {terminationAcceptLabel(location.termination.status)}
                            </button>
                          </form>
                        )}
                        {canRefuseTermination(location.termination.status) && (
                          <form action={refuseTerminationAction.bind(null, location.id)}>
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
