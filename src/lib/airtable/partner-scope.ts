import "server-only";
import { PARTENAIRE_DIATEC_RECORD_ID, PARTENAIRE_PRODITION_RECORD_ID } from "./fields";

// Exceptions "un partenaire voit aussi les donnees d'un autre" : cle = id du
// partenaire qui se connecte, valeur = tous les ids de partenaire a inclure
// (lui-meme + les autres). Seul point de verite pour cette regle — utilise a
// la fois pour les listes (queries.ts) et les verifications d'acces
// (authorize.ts, pages de detail).
const PARTNER_SCOPE_GROUPS: Record<string, string[]> = {
  [PARTENAIRE_PRODITION_RECORD_ID]: [PARTENAIRE_PRODITION_RECORD_ID, PARTENAIRE_DIATEC_RECORD_ID],
};

export function expandPartnerScope(partnerId: string | undefined): string[] {
  if (!partnerId) return [];
  return PARTNER_SCOPE_GROUPS[partnerId] ?? [partnerId];
}

export function isWithinPartnerScope(clientId: string | undefined, partnerId: string | undefined): boolean {
  if (!clientId || !partnerId) return false;
  return expandPartnerScope(partnerId).includes(clientId);
}
