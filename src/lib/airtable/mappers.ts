import {
  DEMANDE_FIELDS,
  ETAPE_INSTALLATION_TERMINEE,
  ETAPE_NOUVELLE_DEMANDE,
  ETAPE_PROJET_ANNULE,
  ETAPE_VENTE_ORDER,
  ETAPES_EN_COURS_INSTALLATION,
  ETAPES_QUALIFICATION,
  EXTERNAL_VALIDATION_A_VALIDER,
  PARTENAIRE_FIELDS,
  QUOTE_STATUS_A_VALIDER,
  RELOCATION_STATUS_ORDER,
  RELOCATION_STATUS_REFUSED,
  RELOCATION_STATUS_TERMINAL,
  STATUTS_INACTIFS,
  TERMINATION_STATUS_ORDER,
  TERMINATION_STATUS_REFUSED,
  TERMINATION_STATUS_TERMINAL,
} from "./fields";
import type { AirtableRecord, DemandeFields, LieuxFields, PartenaireFields } from "./types";

export interface RelocationRequest {
  status?: DemandeFields["Statut modification adresse (Location)"];
  newAddress?: string;
  newPostalCode?: string;
  newCity?: string;
}

export interface TerminationRequest {
  status?: DemandeFields["Statut résiliation (Location)"];
  requestDate?: string;
}

export interface Location {
  id: string;
  clientId?: string;
  clientName: string;
  contact?: string;
  partnerEntity?: DemandeFields["Entité partenaire"];
  constructionDate?: string;
  firstFarodConnectionDate?: string;
  siteId?: string;
  siteName: string;
  requesterName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  fullAddress?: string;
  requestDate?: string;
  status?: DemandeFields["Statut"];
  stage?: DemandeFields["Etape de vente"];
  clientType?: DemandeFields["Type de client"];
  chargerCount?: DemandeFields["Nombre de bornes"];
  currentType?: DemandeFields["Type de courant"];
  power?: DemandeFields["Puissance de borne"];
  model?: DemandeFields["Modèle de borne"];
  chargePoints?: number;
  chargerSerial?: string;
  costCenter?: string;
  installationDate?: string;
  cancelledDate?: string;
  isActive: boolean;
  relocation: RelocationRequest;
  hasRelocationRequest: boolean;
  termination: TerminationRequest;
  hasTerminationRequest: boolean;
  externalValidationStatus?: DemandeFields["EXTERNAL - Validation demande "];
  quoteStatus?: DemandeFields["Statut devis"];
  quoteLink?: string;
  quoteRefusalReason?: string;
  quoteAmount?: number;
  quoteValidatedDate?: string;
  engagementDuration?: string;
  salesRepEmail?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  type?: string;
}

function firstLinkedId(ids?: string[]): string | undefined {
  return ids && ids.length > 0 ? ids[0] : undefined;
}

// Valeur de repli quand le champ "Partenaire" de la Demande n'est pas lie (ou
// pointe vers un record introuvable) — voir queries.ts pour le filtrage qui
// masque ces lignes des listes (persona interne).
export const CLIENT_INCONNU = "Client inconnu";

function isLocationActive(fields: DemandeFields): boolean {
  const stage = fields[DEMANDE_FIELDS.etapeDeVente as keyof DemandeFields] as string | undefined;
  const status = fields[DEMANDE_FIELDS.statut as keyof DemandeFields] as string | undefined;
  const terminationStatus = fields[DEMANDE_FIELDS.statutResiliation as keyof DemandeFields] as string | undefined;
  if (stage !== ETAPE_INSTALLATION_TERMINEE) return false;
  if (status && (STATUTS_INACTIFS as readonly string[]).includes(status)) return false;
  if (terminationStatus === TERMINATION_STATUS_ORDER[TERMINATION_STATUS_ORDER.length - 1]) return false;
  return true;
}

// "Nécessite une action côté interne" = renseigné et pas encore dans un état
// terminal (Terminé/Refusé) — pas seulement au tout premier statut.
export function isRelocationPending(location: Location): boolean {
  const status = location.relocation.status;
  return Boolean(status) && !(RELOCATION_STATUS_TERMINAL as readonly string[]).includes(status as string);
}

// Un arrêt "nécessite un suivi" tant qu'il est renseigné et pas encore dans
// un état terminal (Résilié/Refusé) — pas seulement au tout premier statut.
export function isTerminationPending(location: Location): boolean {
  const status = location.termination.status;
  return Boolean(status) && !(TERMINATION_STATUS_TERMINAL as readonly string[]).includes(status as string);
}

type RelocationStatus = (typeof RELOCATION_STATUS_ORDER)[number] | typeof RELOCATION_STATUS_REFUSED;

// Le bouton Accepter fait avancer d'une etape dans RELOCATION_STATUS_ORDER.
// Un statut absent est traite comme "avant la premiere etape".
export function nextRelocationStatus(current?: string): RelocationStatus | null {
  const idx = current ? RELOCATION_STATUS_ORDER.indexOf(current as (typeof RELOCATION_STATUS_ORDER)[number]) : -1;
  if (idx >= RELOCATION_STATUS_ORDER.length - 1) return null;
  return RELOCATION_STATUS_ORDER[idx + 1];
}

export function canAcceptRelocation(current?: string): boolean {
  return current !== RELOCATION_STATUS_REFUSED && nextRelocationStatus(current) !== null;
}

export function canRefuseRelocation(current?: string): boolean {
  return current !== RELOCATION_STATUS_REFUSED && current !== "Terminé";
}

const RELOCATION_ACCEPT_LABELS: Record<string, string> = {
  "En attente": "Accepter la demande",
  "Validé": "Confirmer la désinstallation",
  "Chantier en cours": "Confirmer le déménagement",
};

// Même logique que terminationAcceptLabel : le bouton "Accepter" annonce
// l'étape suivante plutôt qu'un texte générique.
export function relocationAcceptLabel(current?: string): string {
  return RELOCATION_ACCEPT_LABELS[current ?? ""] ?? "Accepter";
}

type TerminationStatus = (typeof TERMINATION_STATUS_ORDER)[number] | typeof TERMINATION_STATUS_REFUSED;

export function nextTerminationStatus(current?: string): TerminationStatus | null {
  const idx = current ? TERMINATION_STATUS_ORDER.indexOf(current as (typeof TERMINATION_STATUS_ORDER)[number]) : -1;
  if (idx >= TERMINATION_STATUS_ORDER.length - 1) return null;
  return TERMINATION_STATUS_ORDER[idx + 1];
}

export function canAcceptTermination(current?: string): boolean {
  return current !== TERMINATION_STATUS_REFUSED && nextTerminationStatus(current) !== null;
}

export function canRefuseTermination(current?: string): boolean {
  return current !== TERMINATION_STATUS_REFUSED && current !== "Résilié";
}

const TERMINATION_ACCEPT_LABELS: Record<string, string> = {
  "Nouvelle demande": "Accepter la demande",
  "Acceptée": "Confirmer la désinstallation",
  "En cours de desinstallation": "Confirmer la résiliation",
};

// Le libellé du bouton "Accepter" reflète l'étape suivante du pipeline plutôt
// qu'un texte générique, pour que le geste soit explicite à chaque étape.
export function terminationAcceptLabel(current?: string): string {
  return TERMINATION_ACCEPT_LABELS[current ?? ""] ?? "Accepter";
}

export function mapDemandeRecord(
  record: AirtableRecord<DemandeFields>,
  partenaireNames: Map<string, string>,
  lieuxNames: Map<string, string>,
): Location {
  const f = record.fields;
  const clientId = firstLinkedId(f.Partenaire);
  const siteId = firstLinkedId(f.Lieux);

  const relocation: RelocationRequest = {
    status: f["Statut modification adresse (Location)"],
    newAddress: f["Nouvelle adresse (Location)"],
    newPostalCode: f["Nouveau CP (Location)"],
    newCity: f["Nouvelle Ville (Location)"],
  };
  const hasRelocationRequest = Boolean(relocation.status || relocation.newAddress);

  const termination: TerminationRequest = {
    status: f["Statut résiliation (Location)"],
    requestDate: f["Date demande arrêt"],
  };
  const hasTerminationRequest = Boolean(termination.status);

  return {
    id: record.id,
    clientId,
    clientName: (clientId && partenaireNames.get(clientId)) || CLIENT_INCONNU,
    contact: f.Contact,
    partnerEntity: f["Entité partenaire"],
    constructionDate: f["Date de chantier"],
    firstFarodConnectionDate: f["Date de premiere connexion faroad"],
    siteId,
    siteName: (siteId && lieuxNames.get(siteId)) || "Site inconnu",
    requesterName: [f.Prénom, f.Nom].filter(Boolean).join(" ") || "—",
    firstName: f.Prénom,
    lastName: f.Nom,
    phone: f.Téléphone,
    email: f.Email,
    address: f.Adresse,
    postalCode: f["Code postal"],
    city: f.Ville,
    fullAddress: f["Adresse complète"],
    requestDate: f["Date de la demande"],
    status: f.Statut,
    stage: f["Etape de vente"],
    clientType: f["Type de client"],
    chargerCount: f["Nombre de bornes"],
    currentType: f["Type de courant"],
    power: f["Puissance de borne"],
    model: f["Modèle de borne"],
    chargePoints: f["Nb point de charge"],
    chargerSerial: f["N° Borne"],
    costCenter: f["Centre de cout"],
    installationDate: f["Date Installation terminée"],
    cancelledDate: f["Date Projet annulé"],
    isActive: isLocationActive(f),
    relocation,
    hasRelocationRequest,
    termination,
    hasTerminationRequest,
    externalValidationStatus: f["EXTERNAL - Validation demande "],
    quoteStatus: f["Statut devis"],
    quoteLink: f["Lien du devis"],
    quoteRefusalReason: f["Raison refus devis"],
    quoteAmount: f["Montant du devis entreprise"],
    quoteValidatedDate: f["Date de validation du devis"],
    engagementDuration: f["Durée d'engagement"],
    salesRepEmail: f["Email (from Commercial)"]?.[0],
  };
}

export interface StatusGroup {
  status: string;
  locations: Location[];
}

function groupByStatusOrder(
  locations: Location[],
  order: readonly string[],
  getStatus: (location: Location) => string | undefined,
): StatusGroup[] {
  const groups: StatusGroup[] = [];
  for (const status of order) {
    const matching = locations.filter((l) => getStatus(l) === status);
    if (matching.length > 0) groups.push({ status, locations: matching });
  }
  const known = new Set(order);
  const unknown = locations.filter((l) => {
    const status = getStatus(l);
    return !status || !known.has(status);
  });
  if (unknown.length > 0) groups.push({ status: "Sans statut", locations: unknown });
  return groups;
}

// Regroupe les demandes par statut, dans l'ordre du pipeline (comme le mockup
// Claude Design) — un groupe par étape, plus "Refusé" et "Sans statut".
export function groupRelocationsByStatus(locations: Location[]): StatusGroup[] {
  return groupByStatusOrder(
    locations,
    [...RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED],
    (l) => l.relocation.status,
  );
}

export function groupTerminationsByStatus(locations: Location[]): StatusGroup[] {
  return groupByStatusOrder(
    locations,
    [...TERMINATION_STATUS_ORDER, TERMINATION_STATUS_REFUSED],
    (l) => l.termination.status,
  );
}

// Page Suivi des demandes : uniquement les demandes pas encore installées,
// groupées par Etape de vente dans l'ordre du pipeline Airtable.
export function isNotYetInstalled(location: Location): boolean {
  return location.stage !== ETAPE_INSTALLATION_TERMINEE;
}

export function isCancelled(location: Location): boolean {
  return location.stage === ETAPE_PROJET_ANNULE;
}

// Big numbers de la page Suivi des demandes.
export function isNewRequest(location: Location): boolean {
  return location.stage === ETAPE_NOUVELLE_DEMANDE;
}

export function isQualifying(location: Location): boolean {
  return Boolean(location.stage) && (ETAPES_QUALIFICATION as readonly string[]).includes(location.stage as string);
}

export function isInstallationInProgress(location: Location): boolean {
  return (
    Boolean(location.stage) && (ETAPES_EN_COURS_INSTALLATION as readonly string[]).includes(location.stage as string)
  );
}

// Tableau de bord : demandes en attente d'un accord de l'entreprise
// partenaire ("EXTERNAL - Validation demande " = "A valider").
export function needsExternalValidation(location: Location): boolean {
  return location.externalValidationStatus === EXTERNAL_VALIDATION_A_VALIDER;
}

// Tableau de bord : demandes d'ajout supplémentaire dont le devis attend une
// validation ("Statut devis" = "A valider").
export function needsQuoteValidation(location: Location): boolean {
  return location.quoteStatus === QUOTE_STATUS_A_VALIDER;
}

export function groupLocationsByStage(locations: Location[]): StatusGroup[] {
  return groupByStatusOrder(locations, ETAPE_VENTE_ORDER, (l) => l.stage);
}

export function mapPartenaireRecord(record: AirtableRecord<PartenaireFields>): Client {
  const f = record.fields;
  return {
    id: record.id,
    name: f[PARTENAIRE_FIELDS.nomEntreprise as keyof PartenaireFields] as string ?? "Partenaire sans nom",
    email: f["Email principal"],
    type: f.Type,
  };
}

export function mapLieuxName(record: AirtableRecord<LieuxFields>): string {
  return record.fields["Nom du site"] ?? "Site sans nom";
}
