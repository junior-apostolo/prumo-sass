import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/verify";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = ["/api/auth", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("prumo_token")?.value;
  const isAuthenticated = token ? !!(await verifyToken(token)) : false;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAuthRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
