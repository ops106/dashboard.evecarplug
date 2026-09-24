import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { PARTENAIRE_AUDIKA_RECORD_ID, PARTENAIRE_SOFIP_RECORD_ID } from "@/lib/airtable/fields";
import { EmptyState } from "@/components/ui/EmptyState";
import { ValidateExternalRequestButton } from "@/components/locations/ValidateExternalRequestButton";
import { ValidateEngagementDurationButton } from "@/components/locations/ValidateEngagementDurationButton";
import { ValidateExternalRequestSimpleButton } from "@/components/locations/ValidateExternalRequestSimpleButton";
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
              <td className="font-medium">{location.clientName}</td>
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
                  {location.clientId === PARTENAIRE_AUDIKA_RECORD_ID ? (
                    <ValidateExternalRequestButton
                      locationId={location.id}
                      availableEntities={location.clientId ? (entitiesByClient[location.clientId] ?? []) : []}
                    />
                  ) : location.clientId === PARTENAIRE_SOFIP_RECORD_ID ? (
                    <ValidateEngagementDurationButton locationId={location.id} />
                  ) : (
                    <ValidateExternalRequestSimpleButton locationId={location.id} />
                  )}
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
