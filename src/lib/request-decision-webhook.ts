import "server-only";
import type { Location } from "./airtable/mappers";
import type { SessionUser } from "@/lib/auth";

// "validation_externe" = accord de l'entreprise partenaire (EXTERNAL -
// Validation demande) ; "ajout_supplementaire" = devis d'ajout
// supplémentaire (Statut devis) — un seul webhook Make pour les deux,
// distingués par requestType.
export type RequestDecisionType = "validation_externe" | "ajout_supplementaire";

export interface RequestDecisionWebhookPayload {
  event: "request_decision";
  requestType: RequestDecisionType;
  recordId: string;
  clientId?: string;
  clientName: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  decision: "Validé" | "Refusé";
  partnerEntity?: string;
  quoteAmount?: number;
  quoteLink?: string;
  refusalReason?: string;
  actor: { name: string; email: string; role: "interne" | "partenaire_location" } | null;
  locationUrl?: string;
  timestamp: string;
}

type WebhookLocation = Pick<Location, "id" | "clientId" | "clientName" | "requesterName" | "email" | "phone">;

// Notifie un scénario Make (webhook custom) à chaque décision (Validé/Refusé)
// sur une demande de validation externe ou un devis d'ajout supplémentaire.
// Fire-and-forget, ne doit jamais faire échouer l'action métier qui l'appelle
// (même logique que les autres webhooks Make de l'app).
export async function notifyRequestDecision(
  location: WebhookLocation,
  params: {
    requestType: RequestDecisionType;
    decision: "Validé" | "Refusé";
    actor: SessionUser | null;
    partnerEntity?: string;
    quoteAmount?: number;
    quoteLink?: string;
    refusalReason?: string;
  },
): Promise<void> {
  const webhookUrl = process.env.MAKE_REQUEST_DECISION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const baseUrl = process.env.APP_BASE_URL;

  const payload: RequestDecisionWebhookPayload = {
    event: "request_decision",
    requestType: params.requestType,
    recordId: location.id,
    clientId: location.clientId,
    clientName: location.clientName,
    requesterName: location.requesterName,
    requesterEmail: location.email,
    requesterPhone: location.phone,
    decision: params.decision,
    partnerEntity: params.partnerEntity,
    quoteAmount: params.quoteAmount,
    quoteLink: params.quoteLink,
    refusalReason: params.refusalReason,
    actor: params.actor ? { name: params.actor.name, email: params.actor.email, role: params.actor.role } : null,
    locationUrl: baseUrl ? `${baseUrl}/locations/${location.id}` : undefined,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("notifyRequestDecision a échoué (action métier non bloquée) :", error);
  }
}
