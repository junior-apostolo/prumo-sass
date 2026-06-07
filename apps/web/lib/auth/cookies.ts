import { cookies } from "next/headers";

const TOKEN_COOKIE = "prumo_token";
const REFRESH_COOKIE = "prumo_refresh";
const COOKIE_MAX_AGE_ACCESS = 60 * 60 * 24 * 7;    // 7 days
const COOKIE_MAX_AGE_REFRESH = 60 * 60 * 24 * 30;  // 30 days

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, accessToken, { ...baseOptions, maxAge: COOKIE_MAX_AGE_ACCESS });
  jar.set(REFRESH_COOKIE, refreshToken, { ...baseOptions, maxAge: COOKIE_MAX_AGE_REFRESH });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}
