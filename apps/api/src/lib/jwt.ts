import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

interface AccessTokenPayload {
  userId: string;
  workspaceId: string;
}

export function signAccessToken(userId: string, workspaceId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado");

  return jwt.sign({ userId, workspaceId }, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado");

  return jwt.verify(token, secret) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return randomUUID();
}

export function refreshTokenExpiresAt(): Date {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
