"use server";

import { revalidatePath } from "next/cache";
import { updateLocation } from "@/lib/airtable/queries";
import type { DemandeFields } from "@/lib/airtable/types";

export async function updateLocationAction(id: string, formData: FormData) {
  const patch: Partial<DemandeFields> = {};

  const prenom = formData.get("prenom");
  if (typeof prenom === "string" && prenom) patch["Prénom"] = prenom;
  const nom = formData.get("nom");
  if (typeof nom === "string" && nom) patch["Nom"] = nom;
  const telephone = formData.get("telephone");
  if (typeof telephone === "string" && telephone) patch["Téléphone"] = telephone;
  const email = formData.get("email");
  if (typeof email === "string" && email) patch["Email"] = email;

  const adresse = formData.get("adresse");
  if (typeof adresse === "string" && adresse) patch["Adresse"] = adresse;
  const codePostal = formData.get("codePostal");
  if (typeof codePostal === "string" && codePostal) patch["Code postal"] = codePostal;
  const ville = formData.get("ville");
  if (typeof ville === "string" && ville) patch["Ville"] = ville;
  const adresseComplete = formData.get("adresseComplete");
  if (typeof adresseComplete === "string" && adresseComplete) patch["Adresse complète"] = adresseComplete;

  const entitePartenaire = formData.get("entitePartenaire");
  if (typeof entitePartenaire === "string" && entitePartenaire) {
    patch["Entité partenaire"] = entitePartenaire as DemandeFields["Entité partenaire"];
  }
  const typeDeClient = formData.get("typeDeClient");
  if (typeof typeDeClient === "string" && typeDeClient) {
    patch["Type de client"] = typeDeClient as DemandeFields["Type de client"];
  }

  const dateDeChantier = formData.get("dateDeChantier");
  if (typeof dateDeChantier === "string" && dateDeChantier) patch["Date de chantier"] = dateDeChantier;
  const datePremiereConnexionFarod = formData.get("datePremiereConnexionFarod");
  if (typeof datePremiereConnexionFarod === "string" && datePremiereConnexionFarod) {
    patch["Date de premiere connexion faroad"] = datePremiereConnexionFarod;
  }

  const numBorne = formData.get("numBorne");
  if (typeof numBorne === "string" && numBorne) patch["N° Borne"] = numBorne;
  const modeleDeBorne = formData.get("modeleDeBorne");
  if (typeof modeleDeBorne === "string" && modeleDeBorne) {
    patch["Modèle de borne"] = modeleDeBorne as DemandeFields["Modèle de borne"];
  }
  const puissanceDeBorne = formData.get("puissanceDeBorne");
  if (typeof puissanceDeBorne === "string" && puissanceDeBorne) {
    patch["Puissance de borne"] = puissanceDeBorne as DemandeFields["Puissance de borne"];
  }
  const typeDeCourant = formData.get("typeDeCourant");
  if (typeof typeDeCourant === "string" && typeDeCourant) {
    patch["Type de courant"] = typeDeCourant as DemandeFields["Type de courant"];
  }
  const nbPointDeCharge = formData.get("nbPointDeCharge");
  if (typeof nbPointDeCharge === "string" && nbPointDeCharge) {
    patch["Nb point de charge"] = Number(nbPointDeCharge);
  }
  const nombreDeBornes = formData.get("nombreDeBornes");
  if (typeof nombreDeBornes === "string" && nombreDeBornes) {
    patch["Nombre de bornes"] = nombreDeBornes as DemandeFields["Nombre de bornes"];
  }
  const centreDeCout = formData.get("centreDeCout");
  if (typeof centreDeCout === "string" && centreDeCout) patch["Centre de cout"] = centreDeCout;

  const statut = formData.get("statut");
  if (typeof statut === "string" && statut) {
    patch["Statut"] = statut as DemandeFields["Statut"];
  }
  const etapeDeVente = formData.get("etapeDeVente");
  if (typeof etapeDeVente === "string" && etapeDeVente) {
    patch["Etape de vente"] = etapeDeVente as DemandeFields["Etape de vente"];
  }
  const dateDeLaDemande = formData.get("dateDeLaDemande");
  if (typeof dateDeLaDemande === "string" && dateDeLaDemande) patch["Date de la demande"] = dateDeLaDemande;
  const dateInstallationTerminee = formData.get("dateInstallationTerminee");
  if (typeof dateInstallationTerminee === "string" && dateInstallationTerminee) {
    patch["Date Installation terminée"] = dateInstallationTerminee;
  }

  const statutModificationAdresse = formData.get("statutModificationAdresse");
  if (typeof statutModificationAdresse === "string" && statutModificationAdresse) {
    patch["Statut modification adresse (Location)"] =
      statutModificationAdresse as DemandeFields["Statut modification adresse (Location)"];
  }

  const nouvelleAdresse = formData.get("nouvelleAdresse");
  if (typeof nouvelleAdresse === "string" && nouvelleAdresse) {
    patch["Nouvelle adresse (Location)"] = nouvelleAdresse;
  }
  const nouveauCp = formData.get("nouveauCp");
  if (typeof nouveauCp === "string" && nouveauCp) {
    patch["Nouveau CP (Location)"] = nouveauCp;
  }
  const nouvelleVille = formData.get("nouvelleVille");
  if (typeof nouvelleVille === "string" && nouvelleVille) {
    patch["Nouvelle Ville (Location)"] = nouvelleVille;
  }

  const statutArretLocation = formData.get("statutArretLocation");
  if (typeof statutArretLocation === "string" && statutArretLocation) {
    patch["Statut résiliation (Location)"] =
      statutArretLocation as DemandeFields["Statut résiliation (Location)"];
  }
  const dateDemandeArret = formData.get("dateDemandeArret");
  if (typeof dateDemandeArret === "string" && dateDemandeArret) {
    patch["Date demande arrêt"] = dateDemandeArret;
  }

  await updateLocation(id, patch);

  revalidatePath(`/locations/${id}`);
  revalidatePath("/locations");
  revalidatePath("/");
}
