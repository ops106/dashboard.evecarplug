"use server";

import { redirect } from "next/navigation";
import { getAuthorizedContactByEmail } from "@/lib/airtable/queries";
import { createPasswordResetToken } from "@/lib/password-reset-token";
import { notifyPasswordResetRequested } from "@/lib/password-reset-webhook";

// Toujours rediriger vers la meme confirmation, que l'email existe ou non
// (anti-enumeration de comptes) — voir la page pour le message affiche.
export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (email) {
    const contact = await getAuthorizedContactByEmail(email);
    if (contact) {
      const token = await createPasswordResetToken(contact.id, contact.email);
      const baseUrl = process.env.APP_BASE_URL ?? "";
      const resetUrl = `${baseUrl}/login/set-password?token=${encodeURIComponent(token)}`;
      await notifyPasswordResetRequested({ email: contact.email, name: contact.name, resetUrl });
    }
  }

  redirect("/login/forgot-password?sent=1");
}
