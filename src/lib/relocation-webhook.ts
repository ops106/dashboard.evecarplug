import "server-only";
import type { Location } from "./airtable/mappers";
import type { SessionUser } from "@/lib/auth";

export interface RelocationWebhookPayload {
  event: "relocation_status_changed";
  recordId: string;
  clientId?: string;
  clientName: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  oldStatus?: string;
  newStatus: string;
  isNewRequest: boolean;
  newAddress?: string;
  newPostalCode?: string;
  newCity?: string;
  actor: { name: string; email: string; role: "interne" | "partenaire_location" } | null;
  locationUrl?: string;
  timestamp: string;
}

type WebhookLocation = Pick<
  Location,
  "id" | "clientId" | "clientName" | "requesterName" | "email" | "phone" | "relocation"
>;

// Notifie un scénario Make (webhook custom) à chaque changement de statut
// "Déménagement", quel que soit l'auteur — le filtrage ("nouvelle demande +
// persona partenaire") se fait côté Make, pas ici, pour rester générique.
// Ne doit jamais faire échouer l'action métier qui l'appelle (même logique
// que logMovement/logUsage) : l'envoi est fire-and-forget et silencieux en
// cas d'échec ou d'URL non configurée.
export async function notifyRelocationStatusChange(
  location: WebhookLocation,
  params: {
    oldStatus?: string;
    newStatus: string;
    isNewRequest: boolean;
    actor: SessionUser | null;
    addressOverride?: { newAddress?: string; newPostalCode?: string; newCity?: string };
  },
): Promise<void> {
  const webhookUrl = process.env.MAKE_RELOCATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const baseUrl = process.env.APP_BASE_URL;
  const address = params.addressOverride ?? location.relocation;

  const payload: RelocationWebhookPayload = {
    event: "relocation_status_changed",
    recordId: location.id,
    clientId: location.clientId,
    clientName: location.clientName,
    requesterName: location.requesterName,
    requesterEmail: location.email,
    requesterPhone: location.phone,
    oldStatus: params.oldStatus,
    newStatus: params.newStatus,
    isNewRequest: params.isNewRequest,
    newAddress: address.newAddress,
    newPostalCode: address.newPostalCode,
    newCity: address.newCity,
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
    console.error("notifyRelocationStatusChange a échoué (action métier non bloquée) :", error);
  }
}
