"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "./session";
import { VIEW_AS_COOKIE_NAME } from "./view-as";

// Appelee depuis le selecteur de la sidebar (Nav.tsx) — reserve a la persona
// Interne. Vide/absent = retour a la vue interne normale.
export async function setViewAsPartnerAction(formData: FormData) {
  const session = await getSessionUser();
  if (session?.role !== "interne") return;

  const email = (formData.get("viewAs") as string | null)?.trim().toLowerCase();
  const cookieStore = await cookies();
  if (email) {
    cookieStore.set(VIEW_AS_COOKIE_NAME, email, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    cookieStore.delete(VIEW_AS_COOKIE_NAME);
  }
  revalidatePath("/", "layout");
}
