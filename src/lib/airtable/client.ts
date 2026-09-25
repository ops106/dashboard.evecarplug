import "server-only";
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

function requestInit(options: ListRecordsOptions): RequestInit {
  if (options.cache) return { cache: options.cache };
  if (typeof options.revalidate === "number") {
    return { next: { revalidate: options.revalidate } };
  }
  return { cache: "no-store" };
}

// Recupere toutes les pages (Airtable plafonne a 100 enregistrements/page).
export async function listAllRecords<TFields>(
  tableId: string,
  options: ListRecordsOptions = {},
): Promise<AirtableRecord<TFields>[]> {
  const records: AirtableRecord<TFields>[] = [];
  let offset: string | undefined;

  do {
    const url = buildListUrl(tableId, { ...options, offset });
    const data: AirtableListResponse<TFields> = await airtableFetch(
      url,
      requestInit(options),
    );
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
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
