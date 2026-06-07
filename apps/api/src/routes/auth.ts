import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@enge-pro/db";
import {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
} from "../lib/jwt.js";
import { authenticate } from "../middlewares/authenticate.js";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().uuid(),
});

const logoutSchema = z.object({
  refreshToken: z.string().uuid(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

// ─── Shared schema fragments ─────────────────────────────────────────────────

const userSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    workspaceId: { type: "string", format: "uuid" },
  },
} as const;

const errorSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

const authResponseSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string", description: "JWT válido por 7 dias" },
    refreshToken: { type: "string", format: "uuid", description: "Token de renovação válido por 30 dias" },
    user: userSchema,
  },
} as const;

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function authRoutes(app: FastifyInstance) {
  // ─── Register ────────────────────────────────────────────────────────────

  app.post(
    "/auth/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Cadastrar novo usuário",
        description: "Cria usuário, workspace e emite tokens de acesso.",
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2, description: "Nome completo" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8, description: "Mínimo 8 caracteres" },
          },
        },
        response: {
          201: { description: "Usuário criado", ...authResponseSchema },
          400: { description: "Dados inválidos", ...errorSchema },
          409: { description: "Email já cadastrado", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = registerSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const { name, email, password } = parse.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.code(409).send({ error: "Email já cadastrado" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const refreshToken = generateRefreshToken();

      const user = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name },
        });

        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            workspaceId: workspace.id,
            role: "OWNER",
          },
        });

        await tx.refreshToken.create({
          data: {
            token: refreshToken,
            userId: newUser.id,
            expiresAt: refreshTokenExpiresAt(),
          },
        });

        return newUser;
      });

      const accessToken = signAccessToken(user.id, user.workspaceId);

      return reply.code(201).send({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId,
        },
      });
    }
  );

  // ─── Login ───────────────────────────────────────────────────────────────

  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Entrar com email e senha",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: { description: "Login efetuado", ...authResponseSchema },
          400: { description: "Dados inválidos", ...errorSchema },
          401: { description: "Credenciais inválidas", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = loginSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Dados inválidos" });
      }

      const { email, password } = parse.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: "Credenciais inválidas" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return reply.code(401).send({ error: "Credenciais inválidas" });
      }

      const refreshToken = generateRefreshToken();
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: refreshTokenExpiresAt(),
        },
      });

      const accessToken = signAccessToken(user.id, user.workspaceId);

      return reply.send({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId,
        },
      });
    }
  );

  // ─── Refresh ─────────────────────────────────────────────────────────────

  app.post(
    "/auth/refresh",
    {
      schema: {
        tags: ["Auth"],
        summary: "Renovar access token",
        description: "Usa o refresh token para emitir um novo access token sem novo login.",
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Novo access token emitido",
            type: "object",
            properties: {
              accessToken: { type: "string", description: "JWT válido por 7 dias" },
            },
          },
          400: { description: "Refresh token inválido", ...errorSchema },
          401: { description: "Refresh token expirado ou revogado", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = refreshSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Refresh token inválido" });
      }

      const stored = await prisma.refreshToken.findUnique({
        where: { token: parse.data.refreshToken },
        include: { user: true },
      });

      if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
        return reply.code(401).send({ error: "Refresh token inválido ou expirado" });
      }

      const accessToken = signAccessToken(stored.userId, stored.user.workspaceId);

      return reply.send({ accessToken });
    }
  );

  // ─── Logout ──────────────────────────────────────────────────────────────

  app.post(
    "/auth/logout",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Encerrar sessão",
        description: "Revoga o refresh token informado. Requer access token no header.",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: { description: "Sessão encerrada", type: "null" },
          400: { description: "Refresh token inválido", ...errorSchema },
          401: { description: "Não autorizado", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = logoutSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Refresh token inválido" });
      }

      await prisma.refreshToken.updateMany({
        where: { token: parse.data.refreshToken, userId: req.user.id },
        data: { revokedAt: new Date() },
      });

      return reply.code(204).send();
    }
  );

  // ─── Forgot password ─────────────────────────────────────────────────────

  app.post(
    "/auth/forgot-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Solicitar redefinição de senha",
        description:
          "Gera um token de reset e envia por email (atualmente logado no console — B-002).",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        response: {
          200: {
            description: "Resposta genérica (independente de o email existir)",
            type: "object",
            properties: { message: { type: "string" } },
          },
          400: { description: "Email inválido", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = forgotPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Email inválido" });
      }

      const user = await prisma.user.findUnique({
        where: { email: parse.data.email },
      });

      if (user) {
        const resetToken = randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

        await prisma.passwordResetToken.create({
          data: { token: resetToken, userId: user.id, expiresAt },
        });

        const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
        // Workaround B-002: email transacional não configurado — logar no console
        app.log.info(`[RESET PASSWORD] ${user.email} → ${resetUrl}`);
      }

      // Resposta genérica independente de o email existir
      return reply.send({
        message: "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    }
  );

  // ─── Reset password ──────────────────────────────────────────────────────

  app.post(
    "/auth/reset-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Redefinir senha com token",
        description:
          "Usa o token recebido por email para definir uma nova senha. Revoga todas as sessões ativas.",
        body: {
          type: "object",
          required: ["token", "password"],
          properties: {
            token: { type: "string", format: "uuid", description: "Token recebido por email" },
            password: { type: "string", minLength: 8, description: "Nova senha (mínimo 8 caracteres)" },
          },
        },
        response: {
          200: {
            description: "Senha redefinida",
            type: "object",
            properties: { message: { type: "string" } },
          },
          400: { description: "Token inválido ou expirado", ...errorSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = resetPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const { token, password } = parse.data;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        return reply.code(400).send({ error: "Token inválido ou expirado" });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        }),
        prisma.refreshToken.updateMany({
          where: { userId: resetToken.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      return reply.send({ message: "Senha redefinida com sucesso." });
    }
  );
}
