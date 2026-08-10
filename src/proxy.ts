import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getExpectedSessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const expected = await getExpectedSessionToken();

  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
