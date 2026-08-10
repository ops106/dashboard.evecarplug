import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { canAcceptRelocation, canRefuseRelocation, groupRelocationsByStatus, relocationAcceptLabel } from "@/lib/airtable/mappers";
import { acceptRelocationAction, refuseRelocationAction } from "@/lib/airtable/relocation-actions";
import { EmptyState } from "@/components/ui/EmptyState";

const ACCEPT_BUTTON_STYLE: React.CSSProperties = {
  width: 210,
  padding: "6px 8px",
  textAlign: "center",
};

export function RelocationRequestsTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de changement d'adresse en cours." />;
  }

  const groups = groupRelocationsByStatus(locations);

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[920px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Nouvelle adresse</th>
            <th>Nouveau CP</th>
            <th>Nouvelle ville</th>
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
                  <td>{location.relocation.newAddress || "—"}</td>
                  <td>{location.relocation.newPostalCode || "—"}</td>
                  <td>{location.relocation.newCity || "—"}</td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-2">
                      {canAcceptRelocation(location.relocation.status) && (
                        <form action={acceptRelocationAction.bind(null, location.id)}>
                          <button type="submit" className="btn btn-secondary" style={ACCEPT_BUTTON_STYLE}>
                            {relocationAcceptLabel(location.relocation.status)}
                          </button>
                        </form>
                      )}
                      {canRefuseRelocation(location.relocation.status) && (
                        <form action={refuseRelocationAction.bind(null, location.id)}>
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
