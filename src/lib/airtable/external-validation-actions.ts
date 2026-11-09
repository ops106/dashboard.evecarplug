"use server";

import { revalidatePath } from "next/cache";
import { EXTERNAL_VALIDATION_REFUSE, EXTERNAL_VALIDATION_VALIDE } from "./fields";
import { getQuoteRequestById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/auth";
import { canAccessLocation } from "@/lib/authorize";
import { logUsage } from "./usage-log";
import { notifyRequestDecision } from "@/lib/request-decision-webhook";

// getQuoteRequestById (plutot que getLocationById) : la validation externe
// s'applique aussi aux demandes du pipeline "Facturation entreprise"
// (persona partenaire_facturation), que getLocationById rejette puisqu'il
// filtre sur le pipeline Location.
function revalidateExternalValidationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
  revalidatePath("/bornes-installees");
  revalidatePath("/facturation");
  revalidatePath("/historique");
}

// "Qui" et "quand" pour EXTERNAL - Validation demande, affiches dans
// Historique — captures meme quand c'est l'equipe interne qui valide (ex.
// "voir comme partenaire"), pas seulement le partenaire lui-meme.
function validationFields(session: SessionUser | null) {
  return {
    "Date de validation (demande externe)": new Date().toISOString().slice(0, 10),
    "Validé par (demande externe)": session ? `${session.name} (${session.email})` : "Inconnu",
  };
}

// Le statut ne change que lorsque l'entité partenaire est choisie (ou créée)
// dans la popup — jamais avant, donc les deux champs sont écrits ensemble.
// typecast:true permet de créer une nouvelle entité à la volée si elle
// n'existe pas encore parmi les choix du champ Airtable. C'est justement le
// geste attendu du partenaire concerné (ou de l'équipe interne).
export async function validateExternalRequestAction(id: string, entitePartenaire: string) {
  const session = await getSessionUser();
  const location = await getQuoteRequestById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(
    id,
    {
      "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE,
      "Entité partenaire": entitePartenaire,
      ...validationFields(session),
    },
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
  const location = await getQuoteRequestById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, {
    "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE,
    "Durée d'engagement": dureeEngagement as DemandeFields["Durée d'engagement"],
    ...validationFields(session),
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
  const location = await getQuoteRequestById(id);
  if (!location || !canAccessLocation(session, location)) return;

  await updateLocation(id, { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE, ...validationFields(session) });
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
  const location = await getQuoteRequestById(id);
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
