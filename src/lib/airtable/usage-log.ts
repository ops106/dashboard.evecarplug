import "server-only";
import { createRecord } from "./client";
import { TABLE_IDS } from "./fields";
import type { UsageLogFields } from "./types";
import type { SessionUser } from "@/lib/auth";

export interface LogUsageInput {
  action: NonNullable<UsageLogFields["Action"]>;
  feature: NonNullable<UsageLogFields["Fonctionnalité"]>;
  actor: SessionUser | null;
  detail?: string;
}

// Trace chaque clic sur une action métier clé (Valider/Refuser/Accepter,
// déplacement kanban, ajout de date Farod...) pour la page Indicateurs de
// performance. Ne doit jamais faire échouer l'action métier qui l'appelle :
// le log est secondaire (même logique que logMovement).
export async function logUsage(input: LogUsageInput): Promise<void> {
  const actorLabel = input.actor ? `${input.actor.name} (${input.actor.email})` : "Inconnu";
  const actorRole: UsageLogFields["Rôle"] = input.actor?.role === "interne" ? "Interne" : "Partenaire location";

  const fields: UsageLogFields = {
    "Résumé": input.detail ? `${input.action} — ${input.detail}` : input.action,
    Action: input.action,
    "Fonctionnalité": input.feature,
    Utilisateur: actorLabel,
    "Rôle": actorRole,
    "Détail": input.detail,
    Date: new Date().toISOString(),
  };

  try {
    // typecast : autorise Airtable a ajouter une nouvelle option au champ
    // singleSelect "Action" a la volee (ex. quand le libelle d'une action
    // change suite a une refonte d'interface), plutot que de rejeter l'ecriture.
    await createRecord<UsageLogFields>(TABLE_IDS.journalUtilisation, fields, { typecast: true });
  } catch (error) {
    console.error("logUsage a échoué (action métier non bloquée) :", error);
  }
}
