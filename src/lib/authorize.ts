import "server-only";
import type { SessionUser } from "./auth";
import type { Location } from "./airtable/mappers";

// "Interne" a toujours acces. "Partenaire location" uniquement aux demandes
// dont le Partenaire correspond au sien. A utiliser dans chaque Server Action
// qui modifie une location : le scope cote requete Airtable (getAllLocations)
// protege les listes, mais pas un appel direct avec un id arbitraire.
export function canAccessLocation(
  session: SessionUser | null,
  location: Pick<Location, "clientId">,
): boolean {
  if (!session) return false;
  if (session.role === "interne") return true;
  return Boolean(session.partnerId) && location.clientId === session.partnerId;
}
