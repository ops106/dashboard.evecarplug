import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";
import { ViewQuoteButton } from "@/components/locations/ViewQuoteButton";
import { formatDate } from "@/lib/format";

function toExportRows(locations: Location[]) {
  return locations.map((l) => ({
    Société: l.clientName,
    Client: l.contact || "—",
    Email: l.email || "—",
    Téléphone: l.phone || "—",
    Adresse: l.fullAddress || l.address || "—",
    "Étape de vente": l.stage ?? "—",
    "Date de chantier": toExportDate(l.constructionDate),
    "Date de première connexion farod": toExportDate(l.firstFarodConnectionDate),
    "Nouvelle adresse": l.relocation.newAddress || "—",
    "Montant HT": l.quoteAmount ?? "—",
    "Date d'acceptation": toExportDate(l.quoteValidatedDate),
  }));
}

// Ces demandes appartiennent au pipeline "Facturation entreprise", distinct
// de celui des locations (voir getAllFacturationRequests) : pas de page
// /locations/[id] a lier — le nom du client renvoie donc vers la fiche de
// cette demande (/facturation/[id]).
export function FacturationTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de facturation validée ne correspond à ces critères." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(locations)} filename="facturation.xlsx" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[880px]">
          <thead>
            <tr>
              <th>Société</th>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Montant HT</th>
              <th>Date d&apos;acceptation</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="font-medium">{location.clientName}</td>
                <td>
                  <Link href={`/facturation/${location.id}`} className="text-inherit no-underline hover:underline">
                    {location.contact || "—"}
                  </Link>
                </td>
                <td>{location.email || "—"}</td>
                <td>{location.phone || "—"}</td>
                <td>{location.quoteAmount != null ? `${location.quoteAmount.toLocaleString("fr-FR")} €` : "—"}</td>
                <td>{formatDate(location.quoteValidatedDate)}</td>
                <td className="whitespace-nowrap">
                  <div className="flex justify-end">
                    <ViewQuoteButton locationId={location.id} quoteLink={location.quoteLink} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
