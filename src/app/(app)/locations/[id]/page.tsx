import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocationById } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { updateLocationAction } from "./actions";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{value ?? "—"}</dd>
    </div>
  );
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fiche complète interne (specs, statut de vente, pipeline) — non destinée
  // aux partenaires, qui ont déjà tout ce dont ils ont besoin (adresse,
  // actions Déménagement/Résiliation) sur la liste des locations.
  const session = await getSessionUser();
  if (session?.role !== "interne") redirect("/locations");

  const location = await getLocationById(id);
  if (!location) notFound();

  const boundUpdate = updateLocationAction.bind(null, location.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/locations" className="text-sm text-muted hover:text-[var(--color-accent)]">
          ← Retour aux locations
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 style={{ fontSize: 25 }}>
            {location.clientName} — {location.siteName}
          </h1>
          <StatusBadge value={location.stage} />
        </div>
      </div>

      <Card>
        <h4 className="mb-4">Client & site</h4>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Client"
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
          <Field label="Site" value={location.siteName} />
        </dl>
      </Card>

      <form action={boundUpdate} className="space-y-6">
        <Card>
          <h4 className="mb-4">Spécifications de la borne</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>N° Borne</label>
              <input name="numBorne" type="text" defaultValue={location.chargerSerial ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Modèle</label>
              <select name="modeleDeBorne" defaultValue={location.model ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="Alfen mono rfid">Alfen mono rfid</option>
                <option value="Autel 3G">Autel 3G</option>
                <option value="Autre">Autre</option>
                <option value="Autel mono sans 3G">Autel mono sans 3G</option>
              </select>
            </div>
            <div className="field">
              <label>Puissance (kW)</label>
              <select name="puissanceDeBorne" defaultValue={location.power ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="7.4">7.4</option>
                <option value="22">22</option>
                <option value="11">11</option>
                <option value="0">0</option>
                <option value="3.7">3.7</option>
              </select>
            </div>
            <div className="field">
              <label>Type de courant</label>
              <select name="typeDeCourant" defaultValue={location.currentType ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="monophase">monophase</option>
                <option value="triphase">triphase</option>
                <option value="Non définie">Non définie</option>
              </select>
            </div>
            <div className="field">
              <label>Nb points de charge</label>
              <input
                name="nbPointDeCharge"
                type="number"
                defaultValue={location.chargePoints ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label>Nombre de bornes</label>
              <select name="nombreDeBornes" defaultValue={location.chargerCount ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="Une borne">Une borne</option>
                <option value="Plusieurs bornes">Plusieurs bornes</option>
              </select>
            </div>
            <div className="field">
              <label>Centre de coût</label>
              <input name="centreDeCout" type="text" defaultValue={location.costCenter ?? ""} className="input" />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-4">Statut & pipeline</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Statut</label>
              <select name="statut" defaultValue={location.status ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="Open">Open</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Late">Late</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="field">
              <label>Étape de vente</label>
              <select name="etapeDeVente" defaultValue={location.stage ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="01. Demande reçue">01. Demande reçue</option>
                <option value="02. Client contacté">02. Client contacté</option>
                <option value="03. Visite technique en cours">03. Visite technique en cours</option>
                <option value="04. Documents techniques reçus">04. Documents techniques reçus</option>
                <option value="05. Devis envoyé / Autorisation d’intervention envoyée">
                  05. Devis envoyé / Autorisation d’intervention envoyée
                </option>
                <option value="06. Devis validé / Autorisation d’intervention validée">
                  06. Devis validé / Autorisation d’intervention validée
                </option>
                <option value="07. Chantier en cours">07. Chantier en cours</option>
                <option value="08. Installation terminée">08. Installation terminée</option>
                <option value="09. Projet annulé">09. Projet annulé</option>
              </select>
            </div>
            <div className="field">
              <label>Date de la demande</label>
              <input
                name="dateDeLaDemande"
                type="date"
                defaultValue={location.requestDate ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label>Date installation terminée</label>
              <input
                name="dateInstallationTerminee"
                type="date"
                defaultValue={location.installationDate ?? ""}
                className="input"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-4">Contact</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Prénom</label>
              <input name="prenom" type="text" defaultValue={location.firstName ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Nom</label>
              <input name="nom" type="text" defaultValue={location.lastName ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Téléphone</label>
              <input name="telephone" type="text" defaultValue={location.phone ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" defaultValue={location.email ?? ""} className="input" />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-4">Adresse</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Adresse</label>
              <input name="adresse" type="text" defaultValue={location.address ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Code postal</label>
              <input name="codePostal" type="text" defaultValue={location.postalCode ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Ville</label>
              <input name="ville" type="text" defaultValue={location.city ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Adresse complète</label>
              <input name="adresseComplete" type="text" defaultValue={location.fullAddress ?? ""} className="input" />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-4">Partenaire</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Entité partenaire</label>
              <select name="entitePartenaire" defaultValue={location.partnerEntity ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="Sogeca">Sogeca</option>
                <option value="Elivie">Elivie</option>
                <option value="Asdia">Asdia</option>
                <option value="Audika">Audika</option>
                <option value="E Horus">E Horus</option>
                <option value="Audika Groupe">Audika Groupe</option>
                <option value="Santé & Cie">Santé & Cie</option>
                <option value="Alliance Soins">Alliance Soins</option>
                <option value="Urgence Med">Urgence Med</option>
              </select>
            </div>
            <div className="field">
              <label>Type de client</label>
              <select name="typeDeClient" defaultValue={location.clientType ?? ""} className="input">
                <option value="">— Ne pas modifier —</option>
                <option value="Particulier">Particulier</option>
                <option value="Professionnel">Professionnel</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-4">Chantier & connexion</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Date de chantier</label>
              <input name="dateDeChantier" type="date" defaultValue={location.constructionDate ?? ""} className="input" />
            </div>
            <div className="field">
              <label>Date de première connexion farod</label>
              <input
                name="datePremiereConnexionFarod"
                type="date"
                defaultValue={location.firstFarodConnectionDate ?? ""}
                className="input"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-1">Demande de changement d&apos;adresse</h4>
          <p className="mb-4 text-xs text-muted">
            Statut actuel : <StatusBadge value={location.relocation.status} />
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Statut</label>
              <select
                name="statutModificationAdresse"
                defaultValue={location.relocation.status ?? ""}
                className="input"
              >
                <option value="">— Ne pas modifier —</option>
                <option value="En attente">En attente</option>
                <option value="Validé">Validé</option>
                <option value="Chantier en cours">Chantier en cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>
            <div className="field">
              <label>Nouvelle adresse</label>
              <input
                name="nouvelleAdresse"
                type="text"
                defaultValue={location.relocation.newAddress ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label>Nouveau code postal</label>
              <input
                name="nouveauCp"
                type="text"
                defaultValue={location.relocation.newPostalCode ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label>Nouvelle ville</label>
              <input
                name="nouvelleVille"
                type="text"
                defaultValue={location.relocation.newCity ?? ""}
                className="input"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-1">Demande d&apos;arrêt de location</h4>
          <p className="mb-4 text-xs text-muted">
            Statut actuel : <StatusBadge value={location.termination.status} />
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label>Statut</label>
              <select
                name="statutArretLocation"
                defaultValue={location.termination.status ?? ""}
                className="input"
              >
                <option value="">— Ne pas modifier —</option>
                <option value="Nouvelle demande">Nouvelle demande</option>
                <option value="Acceptée">Acceptée</option>
                <option value="En cours de desinstallation">En cours de desinstallation</option>
                <option value="Résilié">Résilié</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>
            <div className="field">
              <label>Date de la demande</label>
              <input
                name="dateDemandeArret"
                type="date"
                defaultValue={location.termination.requestDate ?? ""}
                className="input"
              />
            </div>
          </div>
        </Card>

        <button type="submit" className="btn btn-primary">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
