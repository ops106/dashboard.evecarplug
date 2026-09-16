"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { getAuthorizedContactByEmail } from "@/lib/airtable/queries";
import { verifyPassword } from "@/lib/password";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const contact = email ? await getAuthorizedContactByEmail(email) : null;
  if (!contact) {
    redirect(`/login?error=account&next=${encodeURIComponent(next)}`);
  }

  if (!contact.passwordHash) {
    redirect(`/login?error=no-password&next=${encodeURIComponent(next)}`);
  }

  const valid = await verifyPassword(password, contact.passwordHash);
  if (!valid) {
    redirect(`/login?error=password&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken({
    contactId: contact.id,
    email: contact.email,
    name: contact.name,
    role: contact.role,
    partnerId: contact.partnerId,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next || "/");
}
