import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionUser } from "./auth";

// A part de proxy.ts (middleware Edge, qui lit le cookie via NextRequest),
// c'est le point d'entree pour connaitre l'utilisateur connecte dans les
// Server Components / Server Actions.
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
