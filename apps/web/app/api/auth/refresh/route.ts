import { NextResponse } from "next/server";
import { getRefreshToken, setAuthCookies } from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return NextResponse.json({ error: "Sem refresh token" }, { status: 401 });

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const { accessToken } = await res.json();
  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({ ok: true, accessToken });
}
