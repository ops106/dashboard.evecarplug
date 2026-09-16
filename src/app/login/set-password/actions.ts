"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { getAuthorizedContactByEmail, setContactPassword } from "@/lib/airtable/queries";
import { verifyPasswordResetToken } from "@/lib/password-reset-token";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";

export async function setPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const claims = await verifyPasswordResetToken(token);
  if (!claims) {
    redirect("/login/set-password?error=invalid-token");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(`/login/set-password?token=${encodeURIComponent(token)}&error=too-short`);
  }
  if (password !== confirmPassword) {
    redirect(`/login/set-password?token=${encodeURIComponent(token)}&error=mismatch`);
  }

  // Re-verifie que le contact existe toujours et correspond au jeton (email
  // inchange depuis l'emission du lien) avant d'ecrire quoi que ce soit.
  const contact = await getAuthorizedContactByEmail(claims.email);
  if (!contact || contact.id !== claims.contactId) {
    redirect("/login/set-password?error=invalid-token");
  }

  const hash = await hashPassword(password);
  await setContactPassword(contact.id, hash);

  const sessionToken = await createSessionToken({
    contactId: contact.id,
    email: contact.email,
    name: contact.name,
    role: contact.role,
    partnerId: contact.partnerId,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
}
