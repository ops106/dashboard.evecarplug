"use server";

import { revalidatePath } from "next/cache";
import { EXTERNAL_VALIDATION_VALIDE, QUOTE_STATUS_REFUSE, QUOTE_STATUS_VALIDE } from "./fields";
import { getQuoteRequestById, updateLocation } from "./queries";
import { getSessionUser } from "@/lib/session";
import { canAccessLocation } from "@/lib/authorize";

// Ces demandes n'appartiennent pas au pipeline "Location" : pas de page
// detail /locations/[id] a revalider pour elles (voir getQuoteRequestById).
function revalidateQuoteViews() {
  revalidatePath("/");
}

// Valider un devis d'ajout supplémentaire valide aussi la demande externe
// correspondante (même geste côté partenaire).
export async function validateQuoteAction(id: string) {
  const session = await getSessionUser();
  const location = await getQuoteRequestById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, {
    "Statut devis": QUOTE_STATUS_VALIDE,
    "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE,
  });
  revalidateQuoteViews();
}

export async function refuseQuoteAction(id: string, reason: string) {
  const session = await getSessionUser();
  const location = await getQuoteRequestById(id);
  if (!location || !canAccessLocation(session, location)) return;
  if (!reason.trim()) return;

  await updateLocation(id, {
    "Statut devis": QUOTE_STATUS_REFUSE,
    "Raison refus devis": reason.trim(),
  });
  revalidateQuoteViews();
}
