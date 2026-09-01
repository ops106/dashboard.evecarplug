"use server";

import { revalidatePath } from "next/cache";
import { RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED } from "./fields";
import { isTerminationPending, nextRelocationStatus } from "./mappers";
import type { Location } from "./mappers";
import { getLocationById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/auth";
import { canAccessLocation } from "@/lib/authorize";
import { logMovement } from "./movement-log";
import { logUsage } from "./usage-log";
import { notifyRelocationStatusChange } from "@/lib/relocation-webhook";

function revalidateRelocationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/mouvements-locatifs");
  revalidatePath(`/locations/${id}`);
}

// Historique : uniquement l'aboutissement final du déménagement, pas les
// étapes intermédiaires ni la création de la demande. On y consigne
// l'ancienne adresse (avant le déménagement) car ce champ n'est jamais
// écrasé par l'app — seule "Nouvelle adresse (Location)" l'est.
async function logIfFinalRelocation(location: Location, next: string, session: SessionUser | null) {
  if (next !== RELOCATION_STATUS_ORDER[RELOCATION_STATUS_ORDER.length - 1]) return;
  const oldAddress =
    location.fullAddress || [location.address, location.postalCode, location.city].filter(Boolean).join(", ");
  await logMovement({
    location,
    type: "Déménagement",
    action: "Progression",
    oldStatus: location.relocation.status,
    newStatus: next,
    detail: `Ancienne adresse : ${oldAddress || "non renseignée"}`,
    actor: session,
  });
}

// Progression du pipeline interne (l'équipe fait avancer une demande déjà
// initiée) — jamais un geste partenaire, même sur sa propre demande.
export async function acceptRelocationAction(id: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;

  const location = await getLocationById(id);
  if (!location) return;

  const oldStatus = location.relocation.status;
  const next = nextRelocationStatus(oldStatus);
  if (!next) return;

  await updateLocation(id, { "Statut modification adresse (Location)": next });
  await logIfFinalRelocation(location, next, session);
  await logUsage({ action: "Accepter déménagement", feature: "Déménagement", actor: session, detail: location.clientName });
  await notifyRelocationStatusChange(location, { oldStatus, newStatus: next, isNewRequest: false, actor: session });
  revalidateRelocationViews(id);
}

export async function refuseRelocationAction(id: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;

  const location = await getLocationById(id);
  if (!location) return;

  const oldStatus = location.relocation.status;
  await updateLocation(id, { "Statut modification adresse (Location)": RELOCATION_STATUS_REFUSED });
  await logUsage({ action: "Refuser déménagement", feature: "Déménagement", actor: session, detail: location.clientName });
  await notifyRelocationStatusChange(location, {
    oldStatus,
    newStatus: RELOCATION_STATUS_REFUSED,
    isNewRequest: false,
    actor: session,
  });
  revalidateRelocationViews(id);
}

// Déplacement libre d'une carte du kanban vers une colonne quelconque
// (glisser-déposer) — contrairement à acceptRelocationAction, pas limité à
// l'étape suivante du pipeline.
const RELOCATION_STATUSES: readonly string[] = [...RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED];

export async function setRelocationStatusAction(id: string, status: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;
  if (!RELOCATION_STATUSES.includes(status)) return;

  const location = await getLocationById(id);
  if (!location || location.relocation.status === status) return;

  const oldStatus = location.relocation.status;
  await updateLocation(id, {
    "Statut modification adresse (Location)": status as DemandeFields["Statut modification adresse (Location)"],
  });
  await logIfFinalRelocation(location, status, session);
  await logUsage({
    action: "Déplacer déménagement (kanban)",
    feature: "Déménagement",
    actor: session,
    detail: `${location.clientName} → ${status}`,
  });
  await notifyRelocationStatusChange(location, { oldStatus, newStatus: status, isNewRequest: false, actor: session });
  revalidateRelocationViews(id);
}

// Depuis la liste des locations : signaler un déménagement crée directement
// la demande au premier statut du pipeline, avec la nouvelle adresse saisie.
// Un changement d'adresse et une résiliation ne peuvent pas être actifs en
// même temps : si une résiliation est en cours, cette demande l'efface.
// Un partenaire ne peut le faire que sur ses propres demandes.
export async function createRelocationRequestAction(id: string, formData: FormData) {
  const session = await getSessionUser();
  const location = await getLocationById(id);
  if (!location || !canAccessLocation(session, location)) return;

  const nouvelleAdresse = String(formData.get("nouvelleAdresse") ?? "").trim();
  const nouveauCp = String(formData.get("nouveauCp") ?? "").trim();
  const nouvelleVille = String(formData.get("nouvelleVille") ?? "").trim();

  const oldStatus = location.relocation.status;
  const newStatus = RELOCATION_STATUS_ORDER[0];

  const patch: Record<string, string | null> = {
    "Statut modification adresse (Location)": newStatus,
    "Nouvelle adresse (Location)": nouvelleAdresse,
    "Nouveau CP (Location)": nouveauCp,
    "Nouvelle Ville (Location)": nouvelleVille,
  };
  if (isTerminationPending(location)) {
    patch["Statut résiliation (Location)"] = null;
  }

  await updateLocation(id, patch as Partial<DemandeFields>);
  await logUsage({
    action: "Créer demande déménagement",
    feature: "Déménagement",
    actor: session,
    detail: location.clientName,
  });
  await notifyRelocationStatusChange(location, {
    oldStatus,
    newStatus,
    isNewRequest: true,
    actor: session,
    addressOverride: { newAddress: nouvelleAdresse, newPostalCode: nouveauCp, newCity: nouvelleVille },
  });
  revalidateRelocationViews(id);
}
