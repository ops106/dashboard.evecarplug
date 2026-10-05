import "server-only";
import { unstable_cache } from "next/cache";
import { BASE_ID } from "./fields";
import type { AirtableListResponse, AirtableRecord } from "./types";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

export class AirtableApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AirtableApiError";
  }
}

function getAuthHeaders(): HeadersInit {
  const token = process.env.AIRTABLE_PAT;
  if (!token) {
    throw new Error(
      "AIRTABLE_PAT manquant. Copie .env.local.example vers .env.local et renseigne un Personal Access Token Airtable.",
    );
  }
  return { Authorization: `Bearer ${token}` };
}

async function airtableFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message ?? res.statusText;
    throw new AirtableApiError(message, res.status);
  }
  return res.json();
}

export interface ListRecordsOptions {
  filterByFormula?: string;
  sort?: { field: string; direction?: "asc" | "desc" }[];
  fields?: string[];
  pageSize?: number;
  cache?: RequestCache;
  revalidate?: number;
}

function buildListUrl(
  tableId: string,
  options: ListRecordsOptions & { offset?: string },
): string {
  const params = new URLSearchParams();
  if (options.filterByFormula) params.set("filterByFormula", options.filterByFormula);
  if (options.pageSize) params.set("pageSize", String(options.pageSize));
  if (options.offset) params.set("offset", options.offset);
  options.sort?.forEach((s, i) => {
    params.set(`sort[${i}][field]`, s.field);
    if (s.direction) params.set(`sort[${i}][direction]`, s.direction);
  });
  options.fields?.forEach((f) => params.append("fields[]", f));
  return `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}?${params.toString()}`;
}

// Recupere toutes les pages d'une requete (Airtable plafonne a 100
// enregistrements/page) — toujours en "no-store" : la mise en cache se fait
// au niveau de listAllRecords, pas ici (voir plus bas pourquoi).
async function fetchAllPages<TFields>(
  tableId: string,
  options: ListRecordsOptions,
): Promise<AirtableRecord<TFields>[]> {
  const records: AirtableRecord<TFields>[] = [];
  let offset: string | undefined;

  do {
    const url = buildListUrl(tableId, { ...options, offset });
    const data: AirtableListResponse<TFields> = await airtableFetch(url, { cache: "no-store" });
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

// Recupere toutes les pages (Airtable plafonne a 100 enregistrements/page).
//
// La mise en cache ne doit JAMAIS se faire page par page (ce qui etait fait
// avant via `fetch(..., { next: { revalidate } })` sur chaque requete) :
// le jeton `offset` d'une page n'est valable que quelques minutes cote
// Airtable, et le cache fetch de Next.js revalide chaque page independamment.
// Si la page 1 est servie perimee (stale-while-revalidate) pendant que la
// page 2 est fraiche, ou l'inverse, le jeton offset transmis peut avoir
// expire -> Airtable renvoie 422 et la page plante ("This page couldn't
// load"). On met donc en cache le RESULTAT COMPLET (toutes les pages) comme
// une seule unite atomique via unstable_cache : soit la liste entiere vient
// du cache (jeton jamais reutilise), soit tout est re-pagine depuis zero.
export async function listAllRecords<TFields>(
  tableId: string,
  options: ListRecordsOptions = {},
): Promise<AirtableRecord<TFields>[]> {
  if (options.cache === "no-store" || typeof options.revalidate !== "number") {
    return fetchAllPages<TFields>(tableId, options);
  }

  const cacheKeyParts = [
    "airtable-list",
    tableId,
    options.filterByFormula ?? "",
    JSON.stringify(options.sort ?? []),
    JSON.stringify(options.fields ?? []),
    String(options.pageSize ?? ""),
  ];
  const cachedFetch = unstable_cache(() => fetchAllPages<TFields>(tableId, options), cacheKeyParts, {
    revalidate: options.revalidate,
  });
  return cachedFetch();
}

export async function getRecord<TFields>(
  tableId: string,
  recordId: string,
): Promise<AirtableRecord<TFields>> {
  const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}/${recordId}`;
  return airtableFetch(url, { cache: "no-store" });
}

export async function createRecord<TFields>(
  tableId: string,
  fields: Partial<TFields>,
  options?: { typecast?: boolean },
): Promise<AirtableRecord<TFields>> {
  const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}`;
  return airtableFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields, typecast: options?.typecast }),
  });
}

export async function updateRecord<TFields>(
  tableId: string,
  recordId: string,
  fields: Partial<TFields>,
  options?: { typecast?: boolean },
): Promise<AirtableRecord<TFields>> {
  const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}/${recordId}`;
  return airtableFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    // typecast: permet a Airtable de creer automatiquement un nouveau choix
    // sur un champ singleSelect si la valeur envoyee n'existe pas encore
    // (utilise pour "Entité partenaire" quand l'utilisateur en ajoute une).
    body: JSON.stringify({ fields, typecast: options?.typecast ?? false }),
  });
}
