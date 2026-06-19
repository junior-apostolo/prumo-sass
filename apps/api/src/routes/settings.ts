import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authenticate } from "../middlewares/authenticate.js";
import { UserRepository } from "../repositories/user.repository.js";
import { WorkspaceRepository } from "../repositories/workspace.repository.js";

const userRepo = new UserRepository();
const workspaceRepo = new WorkspaceRepository();

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  emailContato: z.string().email("Email inválido").optional(),
  endereco: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual obrigatória"),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter pelo menos 8 caracteres")
    .regex(/\d/, "Nova senha deve conter pelo menos 1 número"),
});

const workspaceResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    razaoSocial: { type: "string", nullable: true },
    logoUrl: { type: "string", nullable: true },
    cnpj: { type: "string", nullable: true },
    telefone: { type: "string", nullable: true },
    emailContato: { type: "string", nullable: true },
    endereco: { type: "string", nullable: true },
    createdAt: { type: "string" },
  },
};

const errorSchema = {
  type: "object",
  properties: { error: { type: "string" } },
};

export async function settingsRoutes(app: FastifyInstance) {
  // GET /settings/workspace
  app.get(
    "/settings/workspace",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Configurações"],
        summary: "Dados atuais do workspace",
        security: [{ bearerAuth: [] }],
        response: {
          200: workspaceResponseSchema,
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const workspace = await workspaceRepo.findById(req.user.workspaceId);
      if (!workspace) return reply.code(404).send({ error: "Workspace não encontrado" });
      return reply.send(workspace);
    },
  );

  // PUT /settings/workspace
  app.put(
    "/settings/workspace",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Configurações"],
        summary: "Atualizar dados da empresa",
        security: [{ bearerAuth: [] }],
        response: {
          200: workspaceResponseSchema,
          400: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const parse = updateWorkspaceSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      const workspace = await workspaceRepo.update(req.user.workspaceId, parse.data);
      return reply.send(workspace);
    },
  );

  // PUT /settings/profile
  app.put(
    "/settings/profile",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Configurações"],
        summary: "Atualizar nome e email do usuário",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              workspaceId: { type: "string" },
            },
          },
          400: errorSchema,
          409: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const parse = updateProfileSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const user = await userRepo.updateProfile(req.user.id, parse.data);
        return reply.send({
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId,
        });
      } catch (err) {
        if (err instanceof Error && err.message === "EMAIL_IN_USE") {
          return reply.code(409).send({ error: "Email já está em uso por outra conta" });
        }
        throw err;
      }
    },
  );

  // PUT /settings/password
  app.put(
    "/settings/password",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Configurações"],
        summary: "Trocar senha (exige senha atual)",
        security: [{ bearerAuth: [] }],
        response: {
          204: { type: "null" },
          400: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const parse = changePasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const user = await userRepo.findById(req.user.id);
      if (!user || !user.passwordHash) {
        return reply.code(400).send({ error: "Usuário não encontrado" });
      }

      const valid = await bcrypt.compare(parse.data.currentPassword, user.passwordHash);
      if (!valid) {
        return reply.code(400).send({ error: "Senha atual incorreta" });
      }

      const newHash = await bcrypt.hash(parse.data.newPassword, 12);
      await userRepo.updatePassword(req.user.id, newHash);
      return reply.code(204).send();
    },
  );

  // POST /settings/workspace/logo
  app.post(
    "/settings/workspace/logo",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Configurações"],
        summary: "Upload de logo da empresa (requer storage configurado)",
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: "object", properties: { logoUrl: { type: "string" } } },
          400: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (_req, reply) => {
      // RF-30 deferred: armazenamento (R2/S3) não configurado no MVP
      // Quando STORAGE_ENDPOINT for configurado, implementar T-M5-07 (storage.ts)
      if (!process.env.STORAGE_ENDPOINT) {
        return reply.code(503).send({ error: "Armazenamento não configurado" });
      }
      return reply.code(503).send({ error: "Armazenamento não configurado" });
    },
  );
}
