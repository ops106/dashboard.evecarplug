import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ViewQuoteButton } from "@/components/locations/ViewQuoteButton";

// Ces demandes appartiennent au pipeline "Facturation entreprise", distinct
// de celui des locations (voir getAllFacturationRequests) : pas de page
// /locations/[id] a lier.
export function FacturationTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de facturation validée ne correspond à ces critères." />;
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
            <th>Montant HT</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td className="font-medium">{location.clientName}</td>
              <td>{location.contact || "—"}</td>
              <td>{location.email || "—"}</td>
              <td>{location.phone || "—"}</td>
              <td>{location.quoteAmount != null ? `${location.quoteAmount.toLocaleString("fr-FR")} €` : "—"}</td>
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
  );
}
