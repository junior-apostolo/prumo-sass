import { randomUUID } from "crypto";
import { prisma } from "@enge-pro/db";
import { generateRefreshToken, refreshTokenExpiresAt } from "../lib/jwt.js";
import type {
  IRefreshTokenRepository,
  IPasswordResetRepository,
  RefreshTokenRecord,
  PasswordResetRecord,
} from "../interfaces/auth.interfaces.js";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(userId: string): Promise<string> {
    const token = generateRefreshToken();
    await prisma.refreshToken.create({
      data: { token, userId, expiresAt: refreshTokenExpiresAt() },
    });
    return token;
  }

  async findByToken(token: string): Promise<RefreshTokenRecord | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) return null;

    return {
      id: record.id,
      token: record.token,
      userId: record.userId,
      workspaceId: record.user.workspaceId,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt,
    };
  }

  async revoke(token: string, userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token, userId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export class PasswordResetRepository implements IPasswordResetRepository {
  async create(userId: string): Promise<{ token: string }> {
    const token = randomUUID();
    await prisma.passwordResetToken.create({
      data: { token, userId, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    return { token };
  }

  async findByToken(token: string): Promise<PasswordResetRecord | null> {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  }

  async markAsUsed(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }
}
