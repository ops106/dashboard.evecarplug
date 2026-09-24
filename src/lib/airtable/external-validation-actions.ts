"use server";

import { revalidatePath } from "next/cache";
import { EXTERNAL_VALIDATION_REFUSE, EXTERNAL_VALIDATION_VALIDE } from "./fields";
import { getLocationById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";
import { getSessionUser } from "@/lib/session";
import { canAccessLocation } from "@/lib/authorize";
import { logUsage } from "./usage-log";
import { notifyRequestDecision } from "@/lib/request-decision-webhook";

function revalidateExternalValidationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}

// Le statut ne change que lorsque l'entité partenaire est choisie (ou créée)
// dans la popup — jamais avant, donc les deux champs sont écrits ensemble.
// typecast:true permet de créer une nouvelle entité à la volée si elle
// n'existe pas encore parmi les choix du champ Airtable. C'est justement le
// geste attendu du partenaire concerné (ou de l'équipe interne).
export async function validateExternalRequestAction(id: string, entitePartenaire: string) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(
    id,
    { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE, "Entité partenaire": entitePartenaire },
    { typecast: true },
  );
  await logUsage({
    action: "Valider demande externe",
    feature: "Validation externe",
    actor: session,
    detail: location.clientName,
  });
  await notifyRequestDecision(location, {
    requestType: "validation_externe",
    decision: "Validé",
    actor: session,
    partnerEntity: entitePartenaire,
  });
  revalidateExternalValidationViews(id);
}

// Spécificité SOFIP : durée d'engagement (2 ou 3 ans) demandée au moment de
// la validation, au lieu de l'entité partenaire (réservée à Audika).
export async function validateExternalRequestWithDurationAction(id: string, dureeEngagement: string) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, {
    "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE,
    "Durée d'engagement": dureeEngagement as DemandeFields["Durée d'engagement"],
  });
  await logUsage({
    action: "Valider demande externe",
    feature: "Validation externe",
    actor: session,
    detail: location.clientName,
  });
  await notifyRequestDecision(location, {
    requestType: "validation_externe",
    decision: "Validé",
    actor: session,
    engagementDuration: dureeEngagement,
  });
  revalidateExternalValidationViews(id);
}

// Tous les partenaires hors Audika/SOFIP : validation simple, aucun champ
// supplémentaire.
export async function validateExternalRequestSimpleAction(id: string) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE });
  await logUsage({
    action: "Valider demande externe",
    feature: "Validation externe",
    actor: session,
    detail: location.clientName,
  });
  await notifyRequestDecision(location, { requestType: "validation_externe", decision: "Validé", actor: session });
  revalidateExternalValidationViews(id);
}

export async function refuseExternalRequestAction(id: string) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_REFUSE });
  await logUsage({
    action: "Refuser demande externe",
    feature: "Validation externe",
    actor: session,
    detail: location.clientName,
  });
  await notifyRequestDecision(location, { requestType: "validation_externe", decision: "Refusé", actor: session });
  revalidateExternalValidationViews(id);
}
