import { Fragment } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { groupLocationsByStage } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";
import { RequestDetailsButton } from "@/components/locations/RequestDetailsButton";

function toExportRows(locations: Location[], showReferrerColumns: boolean) {
  return locations.map((l) => ({
    Société: l.clientName,
    Client: l.contact || "—",
    Email: l.email || "—",
    Téléphone: l.phone || "—",
    Adresse: l.fullAddress || l.address || "—",
    "Étape de vente": l.stage ?? "—",
    "Date de chantier": toExportDate(l.constructionDate),
    "Date de première connexion farod": toExportDate(l.firstFarodConnectionDate),
    "Date de la demande": toExportDate(l.requestDate),
    "Nouvelle adresse": l.relocation.newAddress || "—",
    ...(showReferrerColumns ? { Commercial: l.referrer || "—", Lieu: l.siteName || "—" } : {}),
  }));
}

export function PendingRequestsTable({
  locations,
  linkable = true,
}: {
  locations: Location[];
  linkable?: boolean;
}) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande en cours d'installation." />;
  }

  const groups = groupLocationsByStage(locations);
  // Contact partenaire qui a transmis la demande + lieu correspondant :
  // renseigne uniquement pour Groupe Rossi (voir PARTENAIRE_ROSSI_RECORD_ID
  // / getReferredLocations) — colonnes ajoutees seulement quand pertinentes,
  // pas pour les locations du reste de l'app ou ces champs sont toujours vides.
  const showReferrerColumns = locations.some((l) => l.referrer);
  const columnCount = showReferrerColumns ? 7 : 5;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(locations, showReferrerColumns)} filename="suivi-demandes.xlsx" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[780px]">
        <thead>
          <tr>
            <th>Société</th>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Date de la demande</th>
            {showReferrerColumns && (
              <>
                <th>Commercial</th>
                <th>Lieu</th>
              </>
            )}
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
                  <td className="font-medium">{location.clientName}</td>
                  <td>
                    {linkable ? (
                      <Link href={`/locations/${location.id}`} className="text-inherit no-underline hover:underline">
                        {location.contact || "—"}
                      </Link>
                    ) : (
                      <RequestDetailsButton location={location} />
                    )}
                  </td>
                  <td>{location.email || "—"}</td>
                  <td>{location.phone || "—"}</td>
                  <td>{formatDate(location.requestDate)}</td>
                  {showReferrerColumns && (
                    <>
                      <td>{location.referrer || "—"}</td>
                      <td>{location.siteName || "—"}</td>
                    </>
                  )}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
