import "server-only";
import { getRecord, listAllRecords, updateRecord } from "./client";
import { PIPELINE_LOCATION, PIPELINE_LOCATION_RECORD_ID, TABLE_IDS } from "./fields";
import { type Client, type Location, mapDemandeRecord, mapLieuxName, mapPartenaireRecord } from "./mappers";
import type { DemandeFields, LieuxFields, PartenaireFields } from "./types";

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

export async function getAllLocations(): Promise<Location[]> {
  const [demandeRecords, partenaireNames, lieuxNames] = await Promise.all([
    getAllDemandeRecords(),
    buildPartenaireNameMap(),
    buildLieuxNameMap(),
  ]);
  return demandeRecords.map((r) => mapDemandeRecord(r, partenaireNames, lieuxNames));
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

