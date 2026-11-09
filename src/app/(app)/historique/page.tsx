import { redirect } from "next/navigation";
import { getAllExternalValidationHistory, getAllFacturationRequests } from "@/lib/airtable/queries";
import { QUOTE_STATUS_VALIDE } from "@/lib/airtable/fields";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { FacturationTable } from "@/components/locations/FacturationTable";
import { ExternalValidationHistoryTable } from "@/components/locations/ExternalValidationHistoryTable";

// Réservée au persona Interne : reprend le même affichage que la page
// Facturation/Historique du persona partenaire (voir (app)/facturation),
// mais tous partenaires confondus — vient en plus de la Facturation
// existante côté interne, jamais à la place.
export default async function HistoriquePage() {
  const session = await getSessionUser();
  const { isPartner, isApporteur, isFacturationEntreprise } = await getViewAsContext(session);
  if (isPartner || isApporteur || isFacturationEntreprise) redirect("/");

  const [quotes, externalValidationHistory] = await Promise.all([
    getAllFacturationRequests(),
    getAllExternalValidationHistory(),
  ]);
  const filtered = quotes.filter((l) => l.quoteStatus === QUOTE_STATUS_VALIDE);
  // Filtre sur la date de validation : les demandes validées avant l'ajout
  // de ce champ n'ont pas de date, on ne les affiche pas.
  const externalValidations = externalValidationHistory.filter((l) => l.externalValidationDate);

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Historique</h2>
        <p className="mt-1 text-sm text-muted">
          Suivi des montants de devis, tous partenaires confondus. {filtered.length} résultat
          {filtered.length > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h4>Travaux supplémentaires validés</h4>
          <span className="tag tag-accent">{filtered.length}</span>
        </div>
        <FacturationTable locations={filtered} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h4>Demandes validées</h4>
          <span className="tag tag-accent">{externalValidations.length}</span>
        </div>
        <ExternalValidationHistoryTable locations={externalValidations} />
      </div>
    </div>
  );
}
