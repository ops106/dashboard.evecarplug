"use server";

import { revalidatePath } from "next/cache";
import { TERMINATION_STATUS_ORDER, TERMINATION_STATUS_REFUSED } from "./fields";
import { isRelocationPending, nextTerminationStatus } from "./mappers";
import type { Location } from "./mappers";
import { getLocationById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/auth";
import { canAccessLocation } from "@/lib/authorize";
import { logMovement } from "./movement-log";

function revalidateTerminationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/mouvements-locatifs");
  revalidatePath(`/locations/${id}`);
}

// Historique : uniquement l'aboutissement final de la résiliation, pas les
// étapes intermédiaires ni la création de la demande.
async function logIfFinalTermination(location: Location, next: string, session: SessionUser | null) {
  if (next !== TERMINATION_STATUS_ORDER[TERMINATION_STATUS_ORDER.length - 1]) return;
  await logMovement({
    location,
    type: "Résiliation",
    action: "Progression",
    oldStatus: location.termination.status,
    newStatus: next,
    actor: session,
  });
}

// Progression du pipeline interne — jamais un geste partenaire, même sur sa
// propre demande.
export async function acceptTerminationAction(id: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;

  const location = await getLocationById(id);
  if (!location) return;

  const next = nextTerminationStatus(location.termination.status);
  if (!next) return;

  await updateLocation(id, { "Statut résiliation (Location)": next });
  await logIfFinalTermination(location, next, session);
  revalidateTerminationViews(id);
}

export async function refuseTerminationAction(id: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;

  await updateLocation(id, { "Statut résiliation (Location)": TERMINATION_STATUS_REFUSED });
  revalidateTerminationViews(id);
}

// Déplacement libre d'une carte du kanban vers une colonne quelconque
// (glisser-déposer) — contrairement à acceptTerminationAction, pas limité à
// l'étape suivante du pipeline.
const TERMINATION_STATUSES: readonly string[] = [...TERMINATION_STATUS_ORDER, TERMINATION_STATUS_REFUSED];

export async function setTerminationStatusAction(id: string, status: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;
  if (!TERMINATION_STATUSES.includes(status)) return;

  const location = await getLocationById(id);
  if (!location || location.termination.status === status) return;

  await updateLocation(id, {
    "Statut résiliation (Location)": status as DemandeFields["Statut résiliation (Location)"],
  });
  await logIfFinalTermination(location, status, session);
  revalidateTerminationViews(id);
}

// Depuis la liste des locations : demander une résiliation crée directement
// la demande au premier statut du pipeline. Une résiliation et un changement
// d'adresse ne peuvent pas être actifs en même temps : si un changement
// d'adresse est en cours, cette demande l'efface. Un partenaire ne peut le
// faire que sur ses propres demandes.
export async function createTerminationRequestAction(id: string) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  const patch: Record<string, string | null> = {
    "Statut résiliation (Location)": TERMINATION_STATUS_ORDER[0],
  };
  if (isRelocationPending(location)) {
    patch["Statut modification adresse (Location)"] = null;
    patch["Nouvelle adresse (Location)"] = "";
    patch["Nouveau CP (Location)"] = "";
    patch["Nouvelle Ville (Location)"] = "";
  }

  await updateLocation(id, patch as Partial<DemandeFields>);
  revalidateTerminationViews(id);
}
