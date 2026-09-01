import "server-only";
import type { Location } from "./airtable/mappers";
import type { SessionUser } from "@/lib/auth";

export interface TerminationWebhookPayload {
  event: "termination_status_changed";
  recordId: string;
  clientId?: string;
  clientName: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  oldStatus?: string;
  newStatus: string;
  isNewRequest: boolean;
  address?: string;
  postalCode?: string;
  city?: string;
  actor: { name: string; email: string; role: "interne" | "partenaire_location" } | null;
  locationUrl?: string;
  timestamp: string;
}

type WebhookLocation = Pick<
  Location,
  "id" | "clientId" | "clientName" | "requesterName" | "email" | "phone" | "address" | "postalCode" | "city"
>;

// Notifie un scénario Make (webhook custom) à chaque changement de statut
// "Résiliation", quel que soit l'auteur — même logique que
// notifyRelocationStatusChange (voir relocation-webhook.ts). Ne doit jamais
// faire échouer l'action métier qui l'appelle : fire-and-forget et
// silencieux en cas d'échec ou d'URL non configurée.
export async function notifyTerminationStatusChange(
  location: WebhookLocation,
  params: { oldStatus?: string; newStatus: string; isNewRequest: boolean; actor: SessionUser | null },
): Promise<void> {
  const webhookUrl = process.env.MAKE_TERMINATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const baseUrl = process.env.APP_BASE_URL;

  const payload: TerminationWebhookPayload = {
    event: "termination_status_changed",
    recordId: location.id,
    clientId: location.clientId,
    clientName: location.clientName,
    requesterName: location.requesterName,
    requesterEmail: location.email,
    requesterPhone: location.phone,
    oldStatus: params.oldStatus,
    newStatus: params.newStatus,
    isNewRequest: params.isNewRequest,
    address: location.address,
    postalCode: location.postalCode,
    city: location.city,
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
    console.error("notifyTerminationStatusChange a échoué (action métier non bloquée) :", error);
  }
}
