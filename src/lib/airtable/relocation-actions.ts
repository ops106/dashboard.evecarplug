"use server";

import { revalidatePath } from "next/cache";
import { RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED } from "./fields";
import { isTerminationPending, nextRelocationStatus } from "./mappers";
import { getLocationById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";

function revalidateRelocationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}

export async function acceptRelocationAction(id: string) {
  const location = await getLocationById(id);
  if (!location) return;

  const next = nextRelocationStatus(location.relocation.status);
  if (!next) return;

  await updateLocation(id, { "Statut modification adresse (Location)": next });
  revalidateRelocationViews(id);
}

export async function refuseRelocationAction(id: string) {
  await updateLocation(id, { "Statut modification adresse (Location)": RELOCATION_STATUS_REFUSED });
  revalidateRelocationViews(id);
}

// Depuis la liste des locations : signaler un déménagement crée directement
// la demande au premier statut du pipeline, avec la nouvelle adresse saisie.
// Un changement d'adresse et une résiliation ne peuvent pas être actifs en
// même temps : si une résiliation est en cours, cette demande l'efface.
export async function createRelocationRequestAction(id: string, formData: FormData) {
  const nouvelleAdresse = String(formData.get("nouvelleAdresse") ?? "").trim();
  const nouveauCp = String(formData.get("nouveauCp") ?? "").trim();
  const nouvelleVille = String(formData.get("nouvelleVille") ?? "").trim();

  const location = await getLocationById(id);

  const patch: Record<string, string | null> = {
    "Statut modification adresse (Location)": RELOCATION_STATUS_ORDER[0],
    "Nouvelle adresse (Location)": nouvelleAdresse,
    "Nouveau CP (Location)": nouveauCp,
    "Nouvelle Ville (Location)": nouvelleVille,
  };
  if (location && isTerminationPending(location)) {
    patch["Statut résiliation (Location)"] = null;
  }

  await updateLocation(id, patch as Partial<DemandeFields>);
  revalidateRelocationViews(id);
}
