"use server";

import { revalidatePath } from "next/cache";
import { TERMINATION_STATUS_ORDER, TERMINATION_STATUS_REFUSED } from "./fields";
import { isRelocationPending, nextTerminationStatus } from "./mappers";
import { getLocationById, updateLocation } from "./queries";
import type { DemandeFields } from "./types";

function revalidateTerminationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}

export async function acceptTerminationAction(id: string) {
  const location = await getLocationById(id);
  if (!location) return;

  const next = nextTerminationStatus(location.termination.status);
  if (!next) return;

  await updateLocation(id, { "Statut résiliation (Location)": next });
  revalidateTerminationViews(id);
}

export async function refuseTerminationAction(id: string) {
  await updateLocation(id, { "Statut résiliation (Location)": TERMINATION_STATUS_REFUSED });
  revalidateTerminationViews(id);
}

// Depuis la liste des locations : demander une résiliation crée directement
// la demande au premier statut du pipeline. Une résiliation et un changement
// d'adresse ne peuvent pas être actifs en même temps : si un changement
// d'adresse est en cours, cette demande l'efface.
export async function createTerminationRequestAction(id: string) {
  const location = await getLocationById(id);

  const patch: Record<string, string | null> = {
    "Statut résiliation (Location)": TERMINATION_STATUS_ORDER[0],
  };
  if (location && isRelocationPending(location)) {
    patch["Statut modification adresse (Location)"] = null;
    patch["Nouvelle adresse (Location)"] = "";
    patch["Nouveau CP (Location)"] = "";
    patch["Nouvelle Ville (Location)"] = "";
  }

  await updateLocation(id, patch as Partial<DemandeFields>);
  revalidateTerminationViews(id);
}
