import { prisma } from "../lib/prisma";
import type { IUserRepository, UserRecord, CreateUserData } from "../interfaces/auth.interfaces.js";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createWithWorkspace(data: CreateUserData): Promise<UserRecord> {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data: { name: data.name } });
      return tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string },
  ): Promise<UserRecord> {
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new Error("EMAIL_IN_USE");
      }
    }
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      },
    });
  }
}
