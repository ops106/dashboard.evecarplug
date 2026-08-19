import "server-only";
import { getRecord, listAllRecords, updateRecord } from "./client";
import {
  PERSONA_INTERNE,
  PERSONA_PARTENAIRE_LOCATION,
  PIPELINE_LOCATION,
  PIPELINE_LOCATION_RECORD_ID,
  QUOTE_STATUS_A_VALIDER,
  TABLE_IDS,
} from "./fields";
import { type Client, type Location, mapDemandeRecord, mapLieuxName, mapPartenaireRecord } from "./mappers";
import type { ContactFields, DemandeFields, HistoriqueMouvementFields, LieuxFields, PartenaireFields } from "./types";

// Cache court plutot que "no-store" : la table Demande (570+ lignes) prend
// plusieurs requetes paginees a recuperer, et le refaire a chaque navigation
// est lent (voire timeout) des que le reseau vers Airtable ralentit. Les
// ecritures (accepter/refuser/formulaires) appellent revalidatePath, donc un
// changement est toujours visible immediatement malgre ce cache.
async function buildPartenaireNameMap(): Promise<Map<string, string>> {
  const records = await listAllRecords<PartenaireFields>(TABLE_IDS.partenaire, {
    revalidate: 30,
  });
  return new Map(records.map((r) => [r.id, mapPartenaireRecord(r).name]));
}

async function buildLieuxNameMap(): Promise<Map<string, string>> {
  const records = await listAllRecords<LieuxFields>(TABLE_IDS.lieux, { revalidate: 30 });
  return new Map(records.map((r) => [r.id, mapLieuxName(r)]));
}

async function getAllDemandeRecords() {
  return listAllRecords<DemandeFields>(TABLE_IDS.demande, {
    revalidate: 10,
    filterByFormula: `FIND("${PIPELINE_LOCATION}", ARRAYJOIN({Pipeline})) > 0`,
  });
}

// Les demandes d'ajout supplementaire ("Statut devis") vivent dans un autre
// pipeline ("B2B AT HOME - FACTURATION ENTREPRISE") que celui des locations
// ("B2B AT HOME - LOCATION") — on ne peut donc pas reutiliser
// getAllDemandeRecords/getAllLocations (filtres sur PIPELINE_LOCATION) pour
// les recuperer.
async function getAllQuoteDemandeRecords() {
  return listAllRecords<DemandeFields>(TABLE_IDS.demande, {
    revalidate: 10,
    filterByFormula: `{Statut devis} = "${QUOTE_STATUS_A_VALIDER}"`,
  });
}

// partnerId : scope obligatoire cote serveur pour les sessions "Partenaire
// location" (voir authorize.ts) — ne pas se reposer uniquement sur le
// filtrage cote UI, qui n'empeche pas un appel direct avec un autre id.
// Filtre en JS (par id de record) plutot que via une formule Airtable :
// ARRAYJOIN() sur un champ "link to record" renvoie le NOM des enregistrements
// lies (ex. "Audika"), pas leur id (ex. "recXXXXXXXXXXXXXX") — comparer un id
// a ce nom ne matche jamais rien.
export async function getAllLocations(options?: { partnerId?: string }): Promise<Location[]> {
  const [demandeRecords, partenaireNames, lieuxNames] = await Promise.all([
    getAllDemandeRecords(),
    buildPartenaireNameMap(),
    buildLieuxNameMap(),
  ]);
  const locations = demandeRecords.map((r) => mapDemandeRecord(r, partenaireNames, lieuxNames));
  return options?.partnerId ? locations.filter((l) => l.clientId === options.partnerId) : locations;
}

export async function getLocationById(id: string): Promise<Location | null> {
  try {
    const [record, partenaireNames, lieuxNames] = await Promise.all([
      getRecord<DemandeFields>(TABLE_IDS.demande, id),
      buildPartenaireNameMap(),
      buildLieuxNameMap(),
    ]);
    if (!record.fields.Pipeline?.includes(PIPELINE_LOCATION_RECORD_ID)) return null;
    return mapDemandeRecord(record, partenaireNames, lieuxNames);
  } catch {
    return null;
  }
}

// Tableau "Ajouts supplementaires" du tableau de bord : demandes d'un autre
// pipeline que les locations (voir getAllQuoteDemandeRecords), donc pas
// scopees par getAllLocations.
export async function getPendingQuoteRequests(options?: { partnerId?: string }): Promise<Location[]> {
  const [demandeRecords, partenaireNames, lieuxNames] = await Promise.all([
    getAllQuoteDemandeRecords(),
    buildPartenaireNameMap(),
    buildLieuxNameMap(),
  ]);
  const requests = demandeRecords.map((r) => mapDemandeRecord(r, partenaireNames, lieuxNames));
  return options?.partnerId ? requests.filter((l) => l.clientId === options.partnerId) : requests;
}

// Utilise par validateQuoteAction/refuseQuoteAction : contrairement a
// getLocationById, ne filtre pas sur PIPELINE_LOCATION_RECORD_ID puisque ces
// demandes appartiennent a un autre pipeline.
export async function getQuoteRequestById(id: string): Promise<Location | null> {
  try {
    const [record, partenaireNames, lieuxNames] = await Promise.all([
      getRecord<DemandeFields>(TABLE_IDS.demande, id),
      buildPartenaireNameMap(),
      buildLieuxNameMap(),
    ]);
    return mapDemandeRecord(record, partenaireNames, lieuxNames);
  } catch {
    return null;
  }
}

export async function updateLocation(
  id: string,
  patch: Partial<DemandeFields>,
  options?: { typecast?: boolean },
): Promise<void> {
  await updateRecord<DemandeFields>(TABLE_IDS.demande, id, patch, options);
}

export async function getAllClients(): Promise<Client[]> {
  const records = await listAllRecords<PartenaireFields>(TABLE_IDS.partenaire, {
    revalidate: 30,
  });
  return records.map(mapPartenaireRecord).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const record = await getRecord<PartenaireFields>(TABLE_IDS.partenaire, id);
    return mapPartenaireRecord(record);
  } catch {
    return null;
  }
}

export async function getLocationsByClientId(clientId: string): Promise<Location[]> {
  const locations = await getAllLocations();
  return locations.filter((l) => l.clientId === clientId);
}

export interface AuthorizedContact {
  id: string;
  email: string;
  name: string;
  role: "interne" | "partenaire_location";
  // Id du Partenaire lie, uniquement pour role === "partenaire_location" —
  // sert a scoper toutes les requetes de donnees a cette seule societe.
  partnerId?: string;
}

// Echappe les guillemets/antislashs avant interpolation dans une formule
// Airtable, pour eviter qu'un email malveillant casse le filtre.
function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Phase 1 du login par email : verifie seulement que l'email correspond a un
// Contact avec Persona = "Interne" ou "Partenaire location". Aucune preuve de
// possession de la boite mail n'est demandee ici (voir src/lib/auth.ts) — a
// completer par un lien magique dans une phase suivante.
export async function getAuthorizedContactByEmail(email: string): Promise<AuthorizedContact | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const records = await listAllRecords<ContactFields>(TABLE_IDS.contact, {
    cache: "no-store",
    filterByFormula: `AND(LOWER({Email}) = "${escapeFormulaString(normalized)}", OR({Persona} = "${PERSONA_INTERNE}", {Persona} = "${PERSONA_PARTENAIRE_LOCATION}"))`,
  });

  const record = records[0];
  if (!record) return null;

  const name = [record.fields.Prénom, record.fields.Nom].filter(Boolean).join(" ") || normalized;

  if (record.fields.Persona === PERSONA_PARTENAIRE_LOCATION) {
    const partnerId = record.fields.Partenaire?.[0];
    // Persona "Partenaire location" sans Partenaire lie : donnee incoherente
    // cote Airtable, on refuse l'acces plutot que de risquer un scope vide
    // (qui pourrait etre interprete comme "voir tout" plus loin dans le code).
    if (!partnerId) return null;
    return { id: record.id, email: normalized, name, role: "partenaire_location", partnerId };
  }

  return { id: record.id, email: normalized, name, role: "interne" };
}

export interface PartnerLocationContact {
  id: string;
  email: string;
  name: string;
  partnerId: string;
  partnerName: string;
}

// Utilise par la persona "Interne" pour "voir comme" un partenaire location
// donne (memes tableaux, meme scope que si ce contact etait connecte) — sans
// se connecter a sa place. Les contacts sans email ou sans Partenaire lie
// sont ignores (donnee incoherente, ne peuvent de toute facon pas se
// connecter eux-memes, voir getAuthorizedContactByEmail).
export async function getPartnerLocationContacts(): Promise<PartnerLocationContact[]> {
  const [records, partenaireNames] = await Promise.all([
    listAllRecords<ContactFields>(TABLE_IDS.contact, {
      revalidate: 60,
      filterByFormula: `{Persona} = "${PERSONA_PARTENAIRE_LOCATION}"`,
    }),
    buildPartenaireNameMap(),
  ]);

  const contacts: PartnerLocationContact[] = [];
  for (const record of records) {
    const partnerId = record.fields.Partenaire?.[0];
    const email = record.fields.Email?.trim().toLowerCase();
    if (!partnerId || !email) continue;
    const name = [record.fields.Prénom, record.fields.Nom].filter(Boolean).join(" ") || email;
    contacts.push({
      id: record.id,
      email,
      name,
      partnerId,
      partnerName: partenaireNames.get(partnerId) ?? "Société inconnue",
    });
  }

  return contacts.sort(
    (a, b) => a.partnerName.localeCompare(b.partnerName) || a.name.localeCompare(b.name),
  );
}

export async function getPartnerLocationContactByEmail(email: string): Promise<PartnerLocationContact | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const contacts = await getPartnerLocationContacts();
  return contacts.find((c) => c.email === normalized) ?? null;
}

export interface MovementLogRecord {
  id: string;
  summary: string;
  clientId?: string;
  clientName: string;
  type?: HistoriqueMouvementFields["Type de mouvement"];
  action?: HistoriqueMouvementFields["Action"];
  oldStatus?: string;
  newStatus?: string;
  detail?: string;
  actor: string;
  actorRole?: HistoriqueMouvementFields["Rôle de l'auteur"];
  date?: string;
}

// Onglet "Historique" de la page Mouvements locatifs. Filtre en JS (par id
// de record) comme getAllLocations — meme raison (ARRAYJOIN renvoie des noms,
// pas des ids).
export async function getMovementHistory(options?: { partnerId?: string }): Promise<MovementLogRecord[]> {
  const [records, partenaireNames] = await Promise.all([
    listAllRecords<HistoriqueMouvementFields>(TABLE_IDS.historiqueMouvements, {
      revalidate: 10,
      sort: [{ field: "Date", direction: "desc" }],
    }),
    buildPartenaireNameMap(),
  ]);

  const entries = records.map((r): MovementLogRecord => {
    const clientId = r.fields.Partenaire?.[0];
    return {
      id: r.id,
      summary: r.fields["Résumé"] ?? "",
      clientId,
      clientName: (clientId && partenaireNames.get(clientId)) || "Société inconnue",
      type: r.fields["Type de mouvement"],
      action: r.fields.Action,
      oldStatus: r.fields["Ancien statut"],
      newStatus: r.fields["Nouveau statut"],
      detail: r.fields["Détail"],
      actor: r.fields["Effectué par"] ?? "—",
      actorRole: r.fields["Rôle de l'auteur"],
      date: r.fields.Date,
    };
  });

  return options?.partnerId ? entries.filter((e) => e.clientId === options.partnerId) : entries;
}

