export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  workspaceId: string;
  role: string;
};

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
};

export type RefreshTokenRecord = {
  id: string;
  token: string;
  userId: string;
  workspaceId: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type PasswordResetRecord = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  createWithWorkspace(data: CreateUserData): Promise<UserRecord>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export interface IRefreshTokenRepository {
  create(userId: string): Promise<string>;
  findByToken(token: string): Promise<RefreshTokenRecord | null>;
  revoke(token: string, userId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export interface IPasswordResetRepository {
  create(userId: string): Promise<{ token: string }>;
  findByToken(token: string): Promise<PasswordResetRecord | null>;
  markAsUsed(tokenId: string): Promise<void>;
}

export interface IEmailService {
  sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}
