import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { QUOTE_STATUS_A_VALIDER } from "@/lib/airtable/fields";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ViewQuoteButton } from "@/components/locations/ViewQuoteButton";
import { ValidateQuoteButton } from "@/components/locations/ValidateQuoteButton";
import { RefuseQuoteButton } from "@/components/locations/RefuseQuoteButton";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{value ?? "—"}</dd>
    </div>
  );
}

// Contenu partagé par la page complète (src/app/(app)/facturation/[id]/page.tsx)
// et la modale glissante (src/app/(app)/@modal/(.)facturation/[id]/page.tsx).
// Ces demandes appartiennent au pipeline "Facturation entreprise" (Travaux
// supplémentaires) : pas de gros formulaire interne comme pour les locations,
// juste la fiche de la demande elle-même (contrairement à la fiche société
// /clients/[id], qui liste toutes les demandes d'un client).
export function QuoteDetailContent({ location, canManage }: { location: Location; canManage: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 style={{ fontSize: 25 }}>{location.contact || location.clientName}</h1>
        <StatusBadge value={location.quoteStatus} />
      </div>

      <Card>
        <h4 className="mb-4">Société & contact</h4>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Société"
            value={
              location.clientId ? (
                <Link href={`/clients/${location.clientId}`} className="hover:underline">
                  {location.clientName}
                </Link>
              ) : (
                location.clientName
              )
            }
          />
          <Field label="Contact" value={location.contact} />
          <Field label="Email" value={location.email} />
          <Field label="Téléphone" value={location.phone} />
          <Field label="Adresse" value={location.fullAddress || location.address} />
          <Field label="Ville" value={location.city} />
        </dl>
      </Card>

      <Card>
        <h4 className="mb-4">Devis</h4>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Montant HT"
            value={location.quoteAmount != null ? `${location.quoteAmount.toLocaleString("fr-FR")} €` : undefined}
          />
          <Field label="Date de validation" value={formatDate(location.quoteValidatedDate)} />
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ViewQuoteButton locationId={location.id} quoteLink={location.quoteLink} />
          {canManage && location.quoteStatus === QUOTE_STATUS_A_VALIDER && (
            <>
              <ValidateQuoteButton locationId={location.id} />
              <RefuseQuoteButton locationId={location.id} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
