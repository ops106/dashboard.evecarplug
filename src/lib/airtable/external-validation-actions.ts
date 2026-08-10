"use server";

import { revalidatePath } from "next/cache";
import { EXTERNAL_VALIDATION_REFUSE, EXTERNAL_VALIDATION_VALIDE } from "./fields";
import { updateLocation } from "./queries";

function revalidateExternalValidationViews(id: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}

// Le statut ne change que lorsque l'entité partenaire est choisie (ou créée)
// dans la popup — jamais avant, donc les deux champs sont écrits ensemble.
// typecast:true permet de créer une nouvelle entité à la volée si elle
// n'existe pas encore parmi les choix du champ Airtable.
export async function validateExternalRequestAction(id: string, entitePartenaire: string) {
  await updateLocation(
    id,
    { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_VALIDE, "Entité partenaire": entitePartenaire },
    { typecast: true },
  );
  revalidateExternalValidationViews(id);
}

export async function refuseExternalRequestAction(id: string) {
  await updateLocation(id, { "EXTERNAL - Validation demande ": EXTERNAL_VALIDATION_REFUSE });
  revalidateExternalValidationViews(id);
}
