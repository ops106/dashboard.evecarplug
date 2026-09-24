import Link from "next/link";
import { getAllFacturationRequests, getAllLocations } from "@/lib/airtable/queries";
import { ETAPE_INSTALLATION_TERMINEE, QUOTE_STATUS_VALIDE } from "@/lib/airtable/fields";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { FacturationTable } from "@/components/locations/FacturationTable";
import { PendingFarodConnectionTable } from "@/components/locations/PendingFarodConnectionTable";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function FacturationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, partnerId } = await getViewAsContext(session);

  // "Ajouts supplémentaires" (montants de devis) : réservé au persona
  // partenaire — l'interne suit plutôt les connexions Farod ci-dessous.
  const filtered = isPartner
    ? (await getAllFacturationRequests({ partnerId })).filter((l) => l.quoteStatus === QUOTE_STATUS_VALIDE)
    : [];

  // Chantiers installés sans date de 1ère connexion Farod — réservé au
  // persona interne, jamais visible en mode "voir comme partenaire".
  const allLocations = isPartner ? [] : await getAllLocations();
  const pendingFarodConnection = allLocations.filter(
    (l) => l.stage === ETAPE_INSTALLATION_TERMINEE && !l.firstFarodConnectionDate,
  );

  // Correction manuelle : retrouver un chantier qui n'est pas encore au
  // statut "Installation terminée" pour lui renseigner quand même sa date de
  // 1ère connexion Farod (voir setFirstFarodConnectionDateAction, qui bascule
  // alors l'étape de vente automatiquement).
  const searchQuery = params.q?.trim().toLowerCase() ?? "";
  const searchResults = searchQuery
    ? allLocations.filter((l) =>
        [l.clientName, l.siteName, l.contact].filter(Boolean).join(" ").toLowerCase().includes(searchQuery),
      )
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Facturation</h2>
        <p className="mt-1 text-sm text-muted">
          {isPartner
            ? `Suivi des montants de devis. ${filtered.length} résultat${filtered.length > 1 ? "s" : ""}.`
            : "Suivi des connexions Farod en attente."}
        </p>
      </div>

      {isPartner && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <h4>Travaux supplémentaires</h4>
            <span className="tag tag-accent">{filtered.length}</span>
          </div>
          <FacturationTable locations={filtered} />
        </>
      )}

      {!isPartner && (
        <div className="mb-8">
          <div className="mb-3">
            <h4>Ajouter une date de première connexion Farod pour un chantier absent de la liste ci-dessous</h4>
          </div>
          <Card className="mb-6">
            <form method="GET" className="flex flex-wrap items-end gap-3">
              <div className="field" style={{ minWidth: 260 }}>
                <label htmlFor="q">Client, site ou contact</label>
                <input id="q" name="q" type="text" defaultValue={params.q ?? ""} className="input" />
              </div>
              <button type="submit" className="btn btn-primary">
                Rechercher
              </button>
              {params.q && (
                <Link href="/facturation" className="btn btn-ghost">
                  Réinitialiser
                </Link>
              )}
            </form>
          </Card>

          {searchQuery &&
            (searchResults.length === 0 ? (
              <EmptyState message="Aucun chantier ne correspond à cette recherche." />
            ) : (
              <PendingFarodConnectionTable locations={searchResults} />
            ))}
        </div>
      )}

      {!isPartner && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4>Installations terminées sans 1ère connexion Farod</h4>
            <span className="tag tag-accent">{pendingFarodConnection.length}</span>
          </div>
          <PendingFarodConnectionTable locations={pendingFarodConnection} />
        </div>
      )}
    </div>
  );
}
