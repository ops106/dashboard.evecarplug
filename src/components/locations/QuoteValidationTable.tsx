import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { ViewQuoteButton } from "@/components/locations/ViewQuoteButton";
import { ValidateQuoteButton } from "@/components/locations/ValidateQuoteButton";
import { RefuseQuoteButton } from "@/components/locations/RefuseQuoteButton";

// Ces demandes appartiennent a un autre pipeline Airtable que les locations
// (voir getPendingQuoteRequests) : pas de page /locations/[id] a lier — le nom
// du client renvoie donc vers sa fiche societe (/clients/[id]).
export function QuoteValidationTable({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="Aucun ajout supplémentaire en attente de validation." />;
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
              <td>
                {location.clientId ? (
                  <Link href={`/clients/${location.clientId}`} className="text-inherit no-underline hover:underline">
                    {location.contact || "—"}
                  </Link>
                ) : (
                  location.contact || "—"
                )}
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
  );
}
