import type { FastifyInstance } from "fastify";
import {
  registerSchema, loginSchema, refreshSchema, logoutSchema,
  forgotPasswordSchema, resetPasswordSchema,
  errorSwaggerSchema, authResponseSwaggerSchema,
} from "../schemas/auth.schemas.js";
import {
  AuthService,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshTokenRepository, PasswordResetRepository } from "../repositories/token.repository.js";
import { ConsoleEmailService } from "../services/email.service.js";
import { authenticate } from "../middlewares/authenticate.js";

function buildAuthService(app: FastifyInstance): AuthService {
  return new AuthService(
    new UserRepository(),
    new RefreshTokenRepository(),
    new PasswordResetRepository(),
    new ConsoleEmailService(app.log),
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  );
}

export async function authRoutes(app: FastifyInstance) {
  const authService = buildAuthService(app);

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
          201: { description: "Usuário criado", ...authResponseSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          409: { description: "Email já cadastrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = registerSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      try {
        const result = await authService.register(parse.data.name, parse.data.email, parse.data.password);
        return reply.code(201).send(result);
      } catch (err) {
        if (err instanceof EmailAlreadyInUseError) {
          return reply.code(409).send({ error: err.message });
        }
        throw err;
      }
    },
  );

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
          200: { description: "Login efetuado", ...authResponseSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          401: { description: "Credenciais inválidas", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = loginSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Dados inválidos" });
      }

      try {
        const result = await authService.login(parse.data.email, parse.data.password);
        return reply.send(result);
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return reply.code(401).send({ error: err.message });
        }
        throw err;
      }
    },
  );

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
          properties: { refreshToken: { type: "string", format: "uuid" } },
        },
        response: {
          200: {
            description: "Novo access token emitido",
            type: "object",
            properties: { accessToken: { type: "string", description: "JWT válido por 7 dias" } },
          },
          400: { description: "Refresh token inválido", ...errorSwaggerSchema },
          401: { description: "Refresh token expirado ou revogado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = refreshSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Refresh token inválido" });
      }

      try {
        const result = await authService.refresh(parse.data.refreshToken);
        return reply.send(result);
      } catch (err) {
        if (err instanceof InvalidTokenError) {
          return reply.code(401).send({ error: err.message });
        }
        throw err;
      }
    },
  );

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
          properties: { refreshToken: { type: "string", format: "uuid" } },
        },
        response: {
          204: { description: "Sessão encerrada", type: "null" },
          400: { description: "Refresh token inválido", ...errorSwaggerSchema },
          401: { description: "Não autorizado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = logoutSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Refresh token inválido" });
      }

      await authService.logout(parse.data.refreshToken, req.user.id);
      return reply.code(204).send();
    },
  );

  app.post(
    "/auth/forgot-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Solicitar redefinição de senha",
        description: "Gera um token de reset e envia por email (atualmente logado no console — B-002).",
        body: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
        response: {
          200: {
            description: "Resposta genérica (independente de o email existir)",
            type: "object",
            properties: { message: { type: "string" } },
          },
          400: { description: "Email inválido", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = forgotPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: "Email inválido" });
      }

      await authService.forgotPassword(parse.data.email);
      return reply.send({
        message: "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    },
  );

  app.post(
    "/auth/reset-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Redefinir senha com token",
        description: "Usa o token recebido por email para definir uma nova senha. Revoga todas as sessões ativas.",
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
          400: { description: "Token inválido ou expirado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = resetPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      try {
        await authService.resetPassword(parse.data.token, parse.data.password);
        return reply.send({ message: "Senha redefinida com sucesso." });
      } catch (err) {
        if (err instanceof InvalidTokenError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    },
  );
}
