import { redirect } from "next/navigation";
import { getAllFacturationRequests, getMovementHistory } from "@/lib/airtable/queries";
import { QUOTE_STATUS_VALIDE } from "@/lib/airtable/fields";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { FacturationTable } from "@/components/locations/FacturationTable";
import { MovementHistoryTable } from "@/components/locations/MovementHistoryTable";

// Réservée au persona Interne : reprend le même affichage que la page
// Facturation/Historique du persona partenaire (voir (app)/facturation),
// mais tous partenaires confondus — vient en plus de la Facturation
// existante côté interne, jamais à la place.
export default async function HistoriquePage() {
  const session = await getSessionUser();
  const { isPartner, isApporteur } = await getViewAsContext(session);
  if (isPartner || isApporteur) redirect("/");

  const filtered = (await getAllFacturationRequests()).filter((l) => l.quoteStatus === QUOTE_STATUS_VALIDE);
  const movementHistory = await getMovementHistory();

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
          <h4>Travaux supplémentaires</h4>
          <span className="tag tag-accent">{filtered.length}</span>
        </div>
        <FacturationTable locations={filtered} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h4>Déménagements et résiliations aboutis</h4>
          <span className="tag tag-accent">{movementHistory.length}</span>
        </div>
        <MovementHistoryTable entries={movementHistory} />
      </div>
    </div>
  );
}
