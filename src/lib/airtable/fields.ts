export const BASE_ID = process.env.AIRTABLE_BASE_ID ?? "appRythCfjOaMXADS";

export const TABLE_IDS = {
  demande: "tblP1GcqsxrBCrm3u",
  partenaire: "tblxylwUVgIX5rzmV",
  lieux: "tblV7sKUIaq4lSomd",
} as const;

// Une seule source de verite pour les noms de champs Airtable : si un champ
// est renomme dans Airtable, seule cette liste doit etre mise a jour.
export const DEMANDE_FIELDS = {
  contact: "Contact",
  partenaire: "Partenaire",
  lieux: "Lieux",
  nom: "Nom",
  prenom: "Prénom",
  telephone: "Téléphone",
  email: "Email",
  adresse: "Adresse",
  codePostal: "Code postal",
  ville: "Ville",
  adresseComplete: "Adresse complète",
  dateDemande: "Date de la demande",
  statut: "Statut",
  etapeDeVente: "Etape de vente",
  typeDeClient: "Type de client",
  nombreDeBornes: "Nombre de bornes",
  typeDeCourant: "Type de courant",
  puissanceDeBorne: "Puissance de borne",
  modeleDeBorne: "Modèle de borne",
  nbPointDeCharge: "Nb point de charge",
  numBorne: "N° Borne",
  centreDeCout: "Centre de cout",
  nouvelleAdresse: "Nouvelle adresse (Location)",
  nouveauCp: "Nouveau CP (Location)",
  nouvelleVille: "Nouvelle Ville (Location)",
  statutModificationAdresse: "Statut modification adresse (Location)",
  statutResiliation: "Statut résiliation (Location)",
  dateDemandeArret: "Date demande arrêt",
  dateInstallationTerminee: "Date Installation terminée",
  dateProjetAnnule: "Date Projet annulé",
  validationExterne: "EXTERNAL - Validation demande ",
} as const;

export const PARTENAIRE_FIELDS = {
  nomEntreprise: "Nom de l'entreprise",
  emailPrincipal: "Email principal",
  type: "Type",
} as const;

export const LIEUX_FIELDS = {
  nomDuSite: "Nom du site",
} as const;

// La table Demande contient plusieurs pipelines commerciaux (TESLA, CELLNEX,
// PROSPECTION, ...) ; seul celui-ci correspond a la location de bornes.
export const PIPELINE_LOCATION = "B2B AT HOME - LOCATION";
export const PIPELINE_LOCATION_RECORD_ID = "recs7nwMjjGjFg7YZ";

export const ETAPE_INSTALLATION_TERMINEE = "08. Installation terminée";
export const ETAPE_PROJET_ANNULE = "09. Projet annulé";
export const STATUTS_INACTIFS = ["Lost", "Cancelled"] as const;

// Ordre du champ "Etape de vente" tel que defini dans Airtable (config du
// champ singleSelect) — utilise pour trier/grouper la page Suivi des demandes.
export const ETAPE_VENTE_ORDER = [
  "01. Demande reçue",
  "02. Client contacté",
  "03. Visite technique en cours",
  "04. Documents techniques reçus",
  "05. Devis envoyé / Autorisation d’intervention envoyée",
  "06. Devis validé / Autorisation d’intervention validée",
  "07. Chantier en cours",
  "08. Installation terminée",
  "09. Projet annulé",
] as const;

// Pipeline du champ "Statut modification adresse (Location)" : le bouton
// Accepter fait avancer d'une etape, Refuser bascule directement vers le
// statut terminal ci-dessous.
// L'ordre suit celui defini dans Airtable (config du champ, pas de prefixe
// numerique visible — l'utilisateur ne veut pas de "1. " dans les libelles).
export const RELOCATION_STATUS_ORDER = ["En attente", "Validé", "Chantier en cours", "Terminé"] as const;
export const RELOCATION_STATUS_REFUSED = "Refusé";
// "Nécessite un suivi côté interne" pour les changements d'adresse : tout
// statut renseigné qui n'est pas encore dans un état terminal.
export const RELOCATION_STATUS_TERMINAL = ["Terminé", "Refusé"] as const;

// Pipeline du champ "Statut résiliation (Location)" : memes boutons
// Accepter/Refuser que pour les adresses, mais un champ dedie.
export const TERMINATION_STATUS_ORDER = [
  "Nouvelle demande",
  "Acceptée",
  "En cours de desinstallation",
  "Résilié",
] as const;
export const TERMINATION_STATUS_REFUSED = "Refusé";
// "Nécessite un suivi côté interne" pour les arrêts de location : tout statut
// renseigné qui n'est pas encore dans un état terminal.
export const TERMINATION_STATUS_TERMINAL = ["Résilié", "Refusé"] as const;

// Champ "EXTERNAL - Validation demande " (espace final inclus dans le nom
// Airtable) : demandes en attente d'un accord de l'entreprise partenaire.
export const EXTERNAL_VALIDATION_A_VALIDER = "A valider";
export const EXTERNAL_VALIDATION_VALIDE = "Validé";
export const EXTERNAL_VALIDATION_REFUSE = "Refusé";
