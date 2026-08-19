import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ValidateExternalRequestButton } from "@/components/locations/ValidateExternalRequestButton";
import { RefuseExternalRequestButton } from "@/components/locations/RefuseExternalRequestButton";

export function ExternalValidationTable({
  locations,
  entitiesByClient,
  linkable = true,
}: {
  locations: Location[];
  entitiesByClient: Record<string, string[]>;
  linkable?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande en attente de validation par l'entreprise." />;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[780px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
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
                    {location.contact || "—"}
                  </Link>
                ) : (
                  location.contact || "—"
                )}
              </td>
              <td>{location.email || "—"}</td>
              <td>{location.phone || "—"}</td>
              <td className="whitespace-nowrap">
                <div className="flex gap-2 justify-end">
                  <ValidateExternalRequestButton
                    locationId={location.id}
                    availableEntities={location.clientId ? (entitiesByClient[location.clientId] ?? []) : []}
                  />
                  <RefuseExternalRequestButton locationId={location.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
