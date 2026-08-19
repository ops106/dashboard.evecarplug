import "server-only";
import { createRecord } from "./client";
import { TABLE_IDS } from "./fields";
import type { HistoriqueMouvementFields } from "./types";
import type { Location } from "./mappers";
import type { SessionUser } from "@/lib/auth";

export interface LogMovementInput {
  location: Pick<Location, "id" | "clientId" | "clientName">;
  type: "Déménagement" | "Résiliation";
  action: "Nouvelle demande" | "Progression" | "Refus";
  oldStatus?: string;
  newStatus?: string;
  detail?: string;
  actor: SessionUser | null;
}

// N'enregistre que ce qu'on nous a demande de tracer (l'aboutissement final
// d'un déménagement/résiliation) — voir les points d'appel. Ne doit jamais
// faire echouer l'action metier qui l'appelle : le log est secondaire.
export async function logMovement(input: LogMovementInput): Promise<void> {
  const actorLabel = input.actor ? `${input.actor.name} (${input.actor.email})` : "Inconnu";
  const actorRole: HistoriqueMouvementFields["Rôle de l'auteur"] =
    input.actor?.role === "interne" ? "Interne" : "Partenaire location";

  const fields: HistoriqueMouvementFields = {
    "Résumé": `${input.type} — ${input.action} — ${input.location.clientName}`,
    Demande: [input.location.id],
    "Type de mouvement": input.type,
    Action: input.action,
    "Ancien statut": input.oldStatus,
    "Nouveau statut": input.newStatus,
    "Détail": input.detail,
    "Effectué par": actorLabel,
    "Rôle de l'auteur": actorRole,
    Date: new Date().toISOString(),
  };
  if (input.location.clientId) fields.Partenaire = [input.location.clientId];

  try {
    await createRecord<HistoriqueMouvementFields>(TABLE_IDS.historiqueMouvements, fields);
  } catch (error) {
    console.error("logMovement a échoué (action métier non bloquée) :", error);
  }
}
