import "server-only";

// Duplique volontairement les helpers HMAC de auth.ts plutot que de les
// importer : ce module gere un type de jeton distinct (reinitialisation de
// mot de passe, duree de vie courte) et n'a pas besoin d'etre compatible
// Edge runtime (auth.ts l'est, car importe par proxy.ts).

const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h — voir RGPD art. 5(1)(e) : duree de conservation limitee au strict necessaire.
const PURPOSE = "password-reset";

interface ResetTokenPayload {
  contactId: string;
  email: string;
  purpose: typeof PURPOSE;
  exp: number;
}

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
    throw new Error("SESSION_SECRET manquant. Genere-en un (ex: `openssl rand -hex 32`) et ajoute-le dans .env.local.");
  }
  return secret;
}

// Le champ "purpose" empeche qu'un jeton de session (auth.ts) soit rejoue
// ici, ou inversement — les deux sont signes avec le meme secret mais ont
// une forme differente.
export async function createPasswordResetToken(contactId: string, email: string): Promise<string> {
  const payload: ResetTokenPayload = { contactId, email, purpose: PURPOSE, exp: Date.now() + RESET_TOKEN_TTL_MS };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSha256Hex(getSessionSecret(), encoded);
  return `${encoded}.${signature}`;
}

export async function verifyPasswordResetToken(
  token: string | undefined | null,
): Promise<{ contactId: string; email: string } | null> {
  if (!token) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = await hmacSha256Hex(getSessionSecret(), encoded);
  if (expected !== signature) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as Partial<ResetTokenPayload>;
    if (typeof parsed.contactId !== "string" || typeof parsed.email !== "string") return null;
    if (parsed.purpose !== PURPOSE) return null;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return { contactId: parsed.contactId, email: parsed.email };
  } catch {
    return null;
  }
}
