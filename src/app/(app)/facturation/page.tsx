import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllExternalValidationHistory, getAllFacturationRequests, getAllLocations } from "@/lib/airtable/queries";
import { ETAPE_INSTALLATION_TERMINEE, QUOTE_STATUS_VALIDE } from "@/lib/airtable/fields";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { FacturationTable } from "@/components/locations/FacturationTable";
import { ExternalValidationHistoryTable } from "@/components/locations/ExternalValidationHistoryTable";
import { PendingFarodConnectionTable } from "@/components/locations/PendingFarodConnectionTable";
// Note : la page "Historique" (/historique) reprend ce meme affichage
// (devis valides + demandes validees par l'entreprise) pour le persona
// interne, tous partenaires confondus — voir ce fichier pour le contenu
// equivalent cote interne, en plus de la Facturation ci-dessous (jamais a la
// place).
import { PartnerFilter } from "@/components/locations/PartnerFilter";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Réservée aux personas Interne, Partenaire location et Société à contrat
// cadre — un Apporteur d'affaires n'a accès qu'au Tableau de bord et au Suivi
// des demandes.
export default async function FacturationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; client?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const { isPartner, isApporteur, isFacturationEntreprise, partnerId } = await getViewAsContext(session);
  if (isApporteur) redirect("/");

  // Partenaire location ou société à contrat cadre : même affichage
  // "Historique" (devis validés + demandes validées), pipeline-agnostic (voir
  // getAllFacturationRequests/getAllExternalValidationHistory) — seul
  // l'interne voit la Facturation/suivi Farod ci-dessous.
  const isHistoriquePersona = isPartner || isFacturationEntreprise;

  // "Ajouts supplémentaires" (montants de devis) : réservé aux personas
  // partenaires — l'interne suit plutôt les connexions Farod ci-dessous.
  const filtered = isHistoriquePersona
    ? (await getAllFacturationRequests({ partnerId })).filter((l) => l.quoteStatus === QUOTE_STATUS_VALIDE)
    : [];

  // Demandes dont la validation externe a ete acceptee (qui/quand, voir
  // validationFields dans external-validation-actions.ts) — meme logique que
  // les devis valides ci-dessus. Réservé aux personas partenaires ici ; côté
  // interne, l'équivalent tous partenaires confondus vit sur /historique.
  // Filtre sur la date de validation : les demandes validées avant
  // l'ajout de ce champ n'ont pas de date, on ne les affiche pas.
  const externalValidations = isHistoriquePersona
    ? (await getAllExternalValidationHistory({ partnerId })).filter((l) => l.externalValidationDate)
    : [];

  // Chantiers installés sans date de 1ère connexion Farod — réservé au
  // persona interne, jamais visible en mode "voir comme partenaire".
  const allLocations = isHistoriquePersona ? [] : await getAllLocations();

  const clientOptions = Array.from(
    new Map(allLocations.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const pendingFarodConnection = allLocations.filter(
    (l) =>
      l.stage === ETAPE_INSTALLATION_TERMINEE &&
      !l.firstFarodConnectionDate &&
      (!params.client || l.clientId === params.client),
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
        <h2 style={{ fontSize: 25 }}>{isHistoriquePersona ? "Historique" : "Facturation"}</h2>
        <p className="mt-1 text-sm text-muted">
          {isHistoriquePersona
            ? `Suivi des montants de devis. ${filtered.length} résultat${filtered.length > 1 ? "s" : ""}.`
            : "Suivi des connexions Farod en attente."}
        </p>
      </div>

      {isHistoriquePersona && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h4>Travaux supplémentaires validés</h4>
            <span className="tag tag-accent">{filtered.length}</span>
          </div>
          <FacturationTable locations={filtered} />
        </div>
      )}

      {isHistoriquePersona && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4>Demandes validées</h4>
            <span className="tag tag-accent">{externalValidations.length}</span>
          </div>
          <ExternalValidationHistoryTable locations={externalValidations} />
        </div>
      )}

      {!isHistoriquePersona && (
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

      {!isHistoriquePersona && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h4>Installations terminées sans 1ère connexion Farod</h4>
            <span className="tag tag-accent">{pendingFarodConnection.length}</span>
          </div>
          <PartnerFilter clients={clientOptions} value={params.client} resetHref="/facturation" />
          <PendingFarodConnectionTable locations={pendingFarodConnection} />
        </div>
      )}
    </div>
  );
}
