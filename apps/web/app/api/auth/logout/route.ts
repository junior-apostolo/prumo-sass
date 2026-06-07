import { NextResponse } from "next/server";
import { clearAuthCookies, getAccessToken, getRefreshToken } from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST() {
  const [token, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

  if (token && refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
