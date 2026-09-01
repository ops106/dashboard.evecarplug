"use server";

import { revalidatePath } from "next/cache";
import { ETAPE_INSTALLATION_TERMINEE } from "./fields";
import { getLocationById, updateLocation } from "./queries";
import { getSessionUser } from "@/lib/session";
import { logUsage } from "./usage-log";

// Renseigner la date de 1ère connexion Farod fait aussi passer le chantier au
// statut "Installation terminée" — utile en cas d'erreur humaine où la date
// est saisie avant que l'étape de vente n'ait été mise à jour.
export async function setFirstFarodConnectionDateAction(id: string, date: string) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;
  if (!date) return;

  const location = await getLocationById(id);
  if (!location) return;

  await updateLocation(id, {
    "Date de premiere connexion faroad": date,
    "Etape de vente": ETAPE_INSTALLATION_TERMINEE,
  });
  await logUsage({
    action: "Ajouter date connexion Farod",
    feature: "Connexion Farod",
    actor: session,
    detail: location.clientName,
  });

  revalidatePath("/facturation");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
  revalidatePath("/");
}
