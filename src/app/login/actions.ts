"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { getAuthorizedContactByEmail } from "@/lib/airtable/queries";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  const contact = email ? await getAuthorizedContactByEmail(email) : null;
  if (!contact) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
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
