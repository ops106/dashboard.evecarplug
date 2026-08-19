export const SESSION_COOKIE_NAME = "dl_session";

export interface SessionUser {
  contactId: string;
  email: string;
  name: string;
  role: "interne" | "partenaire_location";
  // Id du Partenaire lie — uniquement pour role === "partenaire_location".
  partnerId?: string;
}

// Pas de Buffer ici : ce module est aussi importe par le middleware (proxy.ts),
// qui tourne en Edge runtime et n'a pas l'API Node "buffer".
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (!secret) {
    throw new Error(
      "SESSION_SECRET manquant. Genere-en un (ex: `openssl rand -hex 32`) et ajoute-le dans .env.local.",
    );
  }
  return secret;
}

// Login phase 1 (actuelle) : l'email saisi n'est pas verifie comme
// appartenant reellement a la personne — seule son appartenance a la table
// Contact avec Persona = "Interne" ou "Partenaire location" est controlee
// (voir getAuthorizedContactByEmail). Le cookie est signe (HMAC) pour
// empecher une falsification cote navigateur, mais ca ne remplace pas une
// preuve de possession de la boite mail.
// Phase 2 (a venir) : lien magique envoye par email avant de creer la session.
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(user)));
  const signature = await hmacSha256Hex(getSessionSecret(), payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = await hmacSha256Hex(getSessionSecret(), payload);
  if (expected !== signature) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof parsed?.contactId !== "string" || typeof parsed?.email !== "string") return null;
    if (parsed.role !== "interne" && parsed.role !== "partenaire_location") return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}
