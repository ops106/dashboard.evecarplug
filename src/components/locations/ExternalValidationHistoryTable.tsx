import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";
import { formatDate } from "@/lib/format";

function toExportRows(locations: Location[]) {
  return locations.map((l) => ({
    Société: l.clientName,
    Client: l.contact || "—",
    Email: l.email || "—",
    Téléphone: l.phone || "—",
    "Date de validation": toExportDate(l.externalValidationDate),
    "Validé par": l.externalValidatedBy || "—",
  }));
}

// Lecture seule (contrairement a ExternalValidationTable, qui porte les
// boutons Valider/Refuser sur le tableau de bord) : historique des demandes
// deja validees, avec qui/quand (voir validationFields dans
// external-validation-actions.ts).
export function ExternalValidationHistoryTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande validée par l'entreprise pour l'instant." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(locations)} filename="validation-externe.xlsx" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[780px]">
          <thead>
            <tr>
              <th>Société</th>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Date de validation</th>
              <th>Validé par</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="font-medium">{location.clientName}</td>
                <td>
                  {/* /facturation/[id] (pas /locations/[id]) : pipeline-agnostic
                      (getQuoteRequestById) — cette liste tous-partenaires melange
                      pipeline Location et Facturation entreprise. */}
                  <Link href={`/facturation/${location.id}`} className="text-inherit no-underline hover:underline">
                    {location.contact || "—"}
                  </Link>
                </td>
                <td>{location.email || "—"}</td>
                <td>{location.phone || "—"}</td>
                <td>{formatDate(location.externalValidationDate)}</td>
                <td>{location.externalValidatedBy || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
