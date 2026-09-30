import "server-only";
import { cookies } from "next/headers";
import { getViewAsContactByEmail } from "./airtable/queries";
import type { SessionUser } from "./auth";

export const VIEW_AS_COOKIE_NAME = "dl_view_as";

// Contexte "voir comme partenaire" (persona Interne uniquement), pilote par
// le selecteur global de la sidebar (voir view-as-actions.ts) plutot que par
// un parametre d'URL par page — reste actif tant que le cookie est present,
// quelle que soit la page visitee. Couvre a la fois les partenaires location
// et les apporteurs d'affaires (voir getViewAsContacts).
export async function getViewAsContext(session: SessionUser | null) {
  const isInterne = session?.role === "interne";
  let isPartner = session?.role === "partenaire_location";
  let isApporteur = session?.role === "apporteur_affaire";
  let partnerId = session?.partnerId;
  let viewAsEmail: string | undefined;

  if (isInterne) {
    const cookieEmail = (await cookies()).get(VIEW_AS_COOKIE_NAME)?.value;
    if (cookieEmail) {
      const contact = await getViewAsContactByEmail(cookieEmail);
      if (contact) {
        isPartner = contact.role === "partenaire_location";
        isApporteur = contact.role === "apporteur_affaire";
        partnerId = contact.partnerId;
        viewAsEmail = contact.email;
      }
    }
  }

  return { isInterne, isPartner, isApporteur, partnerId, viewAsEmail };
}
