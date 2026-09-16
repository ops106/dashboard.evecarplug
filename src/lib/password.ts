import "server-only";

// 600 000 iterations : seuil minimum recommande par l'OWASP (2023+) pour
// PBKDF2-HMAC-SHA256 — mesure technique appropriee au sens de l'art. 32 RGPD.
// Stocke par hash (pas une constante globale figee) : augmenter cette valeur
// plus tard n'invalide pas les hashs deja crees, seuls les nouveaux mots de
// passe utiliseront le nouveau seuil.
const ITERATIONS = 600_000;
const KEY_LENGTH_BITS = 256;

// CNIL : au moins 12 caracteres en l'absence d'autre mesure de protection
// (pas de limitation du nombre de tentatives en V1) — voir set-password/actions.ts.
export const MIN_PASSWORD_LENGTH = 12;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_LENGTH_BITS,
  );
  return toHex(new Uint8Array(bits));
}

// Format de stockage : "iterations:saltHex:hashHex" — un seul champ texte
// Airtable ("Mot de passe (hash)"), jamais le mot de passe en clair.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `${ITERATIONS}:${toHex(salt)}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [iterationsStr, saltHex, expectedHash] = parts;
  const iterations = Number(iterationsStr);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  const hash = await derive(password, fromHex(saltHex), iterations);
  if (hash.length !== expectedHash.length) return false;

  // Comparaison en temps constant pour eviter une attaque par timing sur le
  // hash (moins critique que pour le mot de passe lui-meme, mais gratuit).
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  return diff === 0;
}
