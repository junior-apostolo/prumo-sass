import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/verify";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return NextResponse.json({ user: null }, { status: 401 });

  const { user } = await res.json();
  return NextResponse.json({ user, accessToken: token });
}
