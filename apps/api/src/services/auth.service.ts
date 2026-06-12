import bcrypt from "bcryptjs";
import { signAccessToken } from "../lib/jwt.js";
import type {
  IUserRepository,
  IRefreshTokenRepository,
  IPasswordResetRepository,
  IEmailService,
} from "../interfaces/auth.interfaces.js";

export class EmailAlreadyInUseError extends Error {
  constructor() { super("Email já cadastrado"); }
}

export class InvalidCredentialsError extends Error {
  constructor() { super("Credenciais inválidas"); }
}

export class InvalidTokenError extends Error {
  constructor(msg = "Token inválido ou expirado") { super(msg); }
}

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; workspaceId: string };
};

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly passwordResetRepo: IPasswordResetRepository,
    private readonly emailService: IEmailService,
    private readonly frontendUrl: string,
  ) {}

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new EmailAlreadyInUseError();

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.createWithWorkspace({ name, email, passwordHash });
    const refreshToken = await this.refreshTokenRepo.create(user.id);
    const accessToken = signAccessToken(user.id, user.workspaceId);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, workspaceId: user.workspaceId },
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    const refreshToken = await this.refreshTokenRepo.create(user.id);
    const accessToken = signAccessToken(user.id, user.workspaceId);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, workspaceId: user.workspaceId },
    };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    const stored = await this.refreshTokenRepo.findByToken(token);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new InvalidTokenError("Refresh token inválido ou expirado");
    }
    return { accessToken: signAccessToken(stored.userId, stored.workspaceId) };
  }

  async logout(token: string, userId: string): Promise<void> {
    await this.refreshTokenRepo.revoke(token, userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return;

    const { token } = await this.passwordResetRepo.create(user.id);
    await this.emailService.sendPasswordReset(
      user.email,
      `${this.frontendUrl}/auth/reset-password?token=${token}`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.passwordResetRepo.findByToken(token);
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new InvalidTokenError();
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.updatePassword(resetToken.userId, passwordHash);
    await this.passwordResetRepo.markAsUsed(resetToken.id);
    await this.refreshTokenRepo.revokeAllForUser(resetToken.userId);
  }
}
