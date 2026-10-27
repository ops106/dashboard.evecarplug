import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";
import { ViewQuoteButton } from "@/components/locations/ViewQuoteButton";
import { ValidateQuoteButton } from "@/components/locations/ValidateQuoteButton";
import { RefuseQuoteButton } from "@/components/locations/RefuseQuoteButton";

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
  }));
}

// Ces demandes appartiennent a un autre pipeline Airtable que les locations
// (voir getPendingQuoteRequests) : pas de page /locations/[id] a lier — le nom
// du client renvoie donc vers la fiche de cette demande (/facturation/[id]).
export function QuoteValidationTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucun ajout supplémentaire en attente de validation." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(locations)} filename="travaux-supplementaires.xlsx" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[780px]">
          <thead>
            <tr>
              <th>Société</th>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Montant HT</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location, index) => (
              <tr key={location.id} className={index > 0 && location.clientName !== locations[index - 1].clientName ? "client-group-start" : undefined}>
                <td className="font-medium">{location.clientName}</td>
                <td>
                  <Link href={`/facturation/${location.id}`} className="text-inherit no-underline hover:underline">
                    {location.contact || "—"}
                  </Link>
                </td>
                <td>{location.email || "—"}</td>
                <td>{location.phone || "—"}</td>
                <td>{location.quoteAmount != null ? `${location.quoteAmount.toLocaleString("fr-FR")} €` : "—"}</td>
                <td className="whitespace-nowrap">
                  <div className="flex gap-2 justify-end">
                    <ViewQuoteButton locationId={location.id} quoteLink={location.quoteLink} />
                    <ValidateQuoteButton locationId={location.id} />
                    <RefuseQuoteButton locationId={location.id} />
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
