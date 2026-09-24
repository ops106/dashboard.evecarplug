"use client";

import { useTransition, Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { groupRelocationsByStatus } from "@/lib/airtable/mappers";
import { RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED } from "@/lib/airtable/fields";
import { setRelocationStatusAction } from "@/lib/airtable/relocation-actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusProgressBar } from "@/components/ui/StatusProgressBar";

const STATUS_OPTIONS = [...RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED];

// Alternative au kanban (glisser-déposer) : même liberté de changer de statut
// dans n'importe quel sens, via un menu déroulant par ligne plutôt qu'un
// drag-and-drop — même Server Action (setRelocationStatusAction) derrière.
export function RelocationStatusTable({ locations }: { locations: Location[] }) {
  const [, startTransition] = useTransition();

  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de changement d'adresse en cours." />;
  }

  const groups = groupRelocationsByStatus(locations);

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[780px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Nouvelle adresse</th>
            <th>Progression</th>
            <th style={{ textAlign: "right" }}>Statut</th>
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
                  <td className="font-medium">{location.clientName}</td>
                  <td>
                    <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                      {location.requesterName}
                    </Link>
                  </td>
                  <td>
                    {location.relocation.newAddress || "—"}
                    {location.relocation.newPostalCode ? ` · ${location.relocation.newPostalCode}` : ""}
                    {location.relocation.newCity ? ` ${location.relocation.newCity}` : ""}
                  </td>
                  <td>
                    <StatusProgressBar
                      order={RELOCATION_STATUS_ORDER}
                      refusedStatus={RELOCATION_STATUS_REFUSED}
                      status={location.relocation.status}
                    />
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <select
                        className="input"
                        style={{ minHeight: 32, padding: "4px 8px", fontSize: 13, width: "auto" }}
                        defaultValue={location.relocation.status ?? ""}
                        onChange={(e) => {
                          const status = e.target.value;
                          startTransition(() => {
                            setRelocationStatusAction(location.id, status);
                          });
                        }}
                      >
                        {!location.relocation.status && <option value="">Sans statut</option>}
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
