import { jwtVerify } from "jose";

export interface TokenPayload {
  userId: string;
  workspaceId: string;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      userId: payload["userId"] as string,
      workspaceId: payload["workspaceId"] as string,
    };
  } catch {
    return null;
  }
}
