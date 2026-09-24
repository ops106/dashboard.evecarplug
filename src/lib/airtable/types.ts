export interface DemandeFields {
  Contact?: string;
  Partenaire?: string[];
  Lieux?: string[];
  Pipeline?: string[];
  Nom?: string;
  Prénom?: string;
  Téléphone?: string;
  Email?: string;
  Adresse?: string;
  "Code postal"?: string;
  Ville?: string;
  "Adresse complète"?: string;
  "Date de la demande"?: string;
  Statut?: "Open" | "Won" | "Lost" | "Late" | "Cancelled" | "Closed";
  "Etape de vente"?:
    | "01. Demande reçue"
    | "02. Client contacté"
    | "03. Visite technique en cours"
    | "04. Documents techniques reçus"
    | "05. Devis envoyé / Autorisation d’intervention envoyée"
    | "06. Devis validé / Autorisation d’intervention validée"
    | "07. Chantier en cours"
    | "08. Installation terminée"
    | "09. Projet annulé";
  "Type de client"?: "Particulier" | "Professionnel";
  "Nombre de bornes"?: "Une borne" | "Plusieurs bornes";
  "Type de courant"?: "monophase" | "triphase" | "Non définie";
  "Puissance de borne"?: "7.4" | "22" | "11" | "0" | "3.7";
  "Modèle de borne"?: "Alfen mono rfid" | "Autel 3G" | "Autre" | "Autel mono sans 3G";
  "Nb point de charge"?: number;
  "N° Borne"?: string;
  "Centre de cout"?: string;
  "Nouvelle adresse (Location)"?: string;
  "Nouveau CP (Location)"?: string;
  "Nouvelle Ville (Location)"?: string;
  "Statut modification adresse (Location)"?:
    | "En attente"
    | "Validé"
    | "Chantier en cours"
    | "Terminé"
    | "Refusé";
  "Statut résiliation (Location)"?:
    | "Nouvelle demande"
    | "Acceptée"
    | "En cours de desinstallation"
    | "Résilié"
    | "Refusé";
  "Date demande arrêt"?: string;
  "Date Installation terminée"?: string;
  "Date Projet annulé"?: string;
  // string libre : de nouvelles entites peuvent etre creees a la volee via
  // typecast (voir validateExternalRequestAction), en plus des choix connus
  // (Sogeca, Elivie, Asdia, Audika, E Horus, Audika Groupe, Santé & Cie,
  // Alliance Soins, Urgence Med).
  "Entité partenaire"?: string;
  "Date de chantier"?: string;
  "Date de premiere connexion faroad"?: string;
  "EXTERNAL - Validation demande "?: "A valider" | "Validé" | "Refusé";
  "Statut devis"?: "A valider" | "Validé" | "Refusé";
  "Lien du devis"?: string;
  "Raison refus devis"?: string;
  "Montant du devis entreprise"?: number;
  "Date de validation du devis"?: string;
  // Lookup (tableau, meme pour un lien simple) sur le champ Email de la
  // table Commerciaux via le champ "Commercial" — permet d'alerter le
  // commercial en charge de la demande dans les webhooks Make.
  "Email (from Commercial)"?: string[];
}

export interface PartenaireFields {
  "Nom de l'entreprise"?: string;
  "Email principal"?: string;
  Type?: string;
}

export interface ContactFields {
  Nom?: string;
  Prénom?: string;
  Email?: string;
  // Champ formule : "Interne" (aucun Partenaire lié), "Partenaire location"
  // ou "Partenaire" selon le pipeline du Partenaire lié.
  Persona?: string;
  Partenaire?: string[];
  // Hash PBKDF2 (jamais le mot de passe en clair) — voir src/lib/password.ts.
  "Mot de passe (hash)"?: string;
}

export interface LieuxFields {
  "Nom du site"?: string;
}

export interface HistoriqueMouvementFields {
  "Résumé"?: string;
  Demande?: string[];
  Partenaire?: string[];
  "Type de mouvement"?: "Déménagement" | "Résiliation";
  Action?: "Nouvelle demande" | "Progression" | "Refus";
  "Ancien statut"?: string;
  "Nouveau statut"?: string;
  "Détail"?: string;
  "Effectué par"?: string;
  "Rôle de l'auteur"?: "Interne" | "Partenaire location";
  Date?: string;
}

// Table "Journal d'utilisation" : trace chaque clic sur une action métier clé
// (voir usage-log.ts) pour la page KPI utilisation.
export interface UsageLogFields {
  "Résumé"?: string;
  Action?:
    | "Créer demande déménagement"
    | "Accepter déménagement"
    | "Refuser déménagement"
    | "Déplacer déménagement (kanban)"
    | "Créer demande résiliation"
    | "Accepter résiliation"
    | "Refuser résiliation"
    | "Déplacer résiliation (kanban)"
    | "Valider demande externe"
    | "Refuser demande externe"
    | "Valider devis"
    | "Refuser devis"
    | "Ajouter date connexion Farod";
  "Fonctionnalité"?: "Déménagement" | "Résiliation" | "Validation externe" | "Devis" | "Connexion Farod";
  Utilisateur?: string;
  "Rôle"?: "Interne" | "Partenaire location";
  "Détail"?: string;
  Date?: string;
}

export interface AirtableRecord<TFields> {
  id: string;
  createdTime: string;
  fields: TFields;
}

export interface AirtableListResponse<TFields> {
  records: AirtableRecord<TFields>[];
  offset?: string;
}
