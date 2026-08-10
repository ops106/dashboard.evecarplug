import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { canAcceptTermination, canRefuseTermination, groupTerminationsByStatus, terminationAcceptLabel } from "@/lib/airtable/mappers";
import { acceptTerminationAction, refuseTerminationAction } from "@/lib/airtable/termination-actions";
import { EmptyState } from "@/components/ui/EmptyState";

const ACCEPT_BUTTON_STYLE: React.CSSProperties = {
  width: 210,
  padding: "6px 8px",
  textAlign: "center",
};

export function TerminationRequestsTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande d'arrêt de location en cours." />;
  }

  const groups = groupTerminationsByStatus(locations);

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[860px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Adresse</th>
            <th>Code postal</th>
            <th>Ville</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.status}>
              <tr className="status-group-row">
                <td colSpan={6}>
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
                      {location.requesterName}
                    </Link>
                  </td>
                  <td>{location.address || "—"}</td>
                  <td>{location.postalCode || "—"}</td>
                  <td>{location.city || "—"}</td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-2">
                      {canAcceptTermination(location.termination.status) && (
                        <form action={acceptTerminationAction.bind(null, location.id)}>
                          <button type="submit" className="btn btn-secondary" style={ACCEPT_BUTTON_STYLE}>
                            {terminationAcceptLabel(location.termination.status)}
                          </button>
                        </form>
                      )}
                      {canRefuseTermination(location.termination.status) && (
                        <form action={refuseTerminationAction.bind(null, location.id)}>
                          <button type="submit" className="btn btn-ghost" style={{ padding: "6px 14px" }}>
                            Refuser
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
