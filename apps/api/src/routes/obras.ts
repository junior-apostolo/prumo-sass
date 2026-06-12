import type { FastifyInstance } from "fastify";
import {
  createObraSchema,
  updateObraSchema,
  updateStatusSchema,
  errorSwaggerSchema,
  obraSwaggerSchema,
  obraComResumoSwaggerSchema,
} from "../schemas/obra.schemas.js";
import { ObraService, ObraNotFoundError } from "../services/obra.service.js";
import { ObraRepository } from "../repositories/obra.repository.js";
import { authenticate } from "../middlewares/authenticate.js";

function buildObraService(): ObraService {
  return new ObraService(new ObraRepository());
}

export async function obrasRoutes(app: FastifyInstance) {
  const obraService = buildObraService();

  app.get(
    "/obras",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Listar obras do workspace",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Lista de obras com resumo financeiro",
            type: "array",
            items: obraComResumoSwaggerSchema,
          },
        },
      },
    },
    async (req, reply) => {
      const obras = await obraService.list(req.user.workspaceId);
      return reply.send(obras);
    },
  );

  app.post(
    "/obras",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Criar nova obra",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["nome"],
          properties: {
            nome: { type: "string", minLength: 1 },
            cliente: { type: "string" },
            endereco: { type: "string" },
            valorContrato: { type: "number", minimum: 0 },
            dataInicio: { type: "string", format: "date" },
            dataFim: { type: "string", format: "date" },
          },
        },
        response: {
          201: { description: "Obra criada", ...obraSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const parse = createObraSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const obra = await obraService.create(req.user.workspaceId, parse.data);
      return reply.code(201).send(obra);
    },
  );

  app.get(
    "/obras/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Detalhe da obra com resumo financeiro",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: { description: "Obra com resumo", ...obraComResumoSwaggerSchema },
          404: { description: "Obra não encontrada", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        const obra = await obraService.get(id, req.user.workspaceId);
        return reply.send(obra);
      } catch (err) {
        if (err instanceof ObraNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  app.put(
    "/obras/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Editar campos da obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: { description: "Obra atualizada", ...obraSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          404: { description: "Obra não encontrada", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = updateObraSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      try {
        const obra = await obraService.update(id, req.user.workspaceId, parse.data);
        return reply.send(obra);
      } catch (err) {
        if (err instanceof ObraNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  app.patch(
    "/obras/:id/status",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Alterar status da obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["PLANEJAMENTO", "EM_EXECUCAO", "PAUSADA", "CONCLUIDA"] },
          },
        },
        response: {
          200: { description: "Status atualizado", ...obraSwaggerSchema },
          400: { description: "Status inválido", ...errorSwaggerSchema },
          404: { description: "Obra não encontrada", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = updateStatusSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      try {
        const obra = await obraService.updateStatus(id, req.user.workspaceId, parse.data.status);
        return reply.send(obra);
      } catch (err) {
        if (err instanceof ObraNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  app.delete(
    "/obras/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Obras"],
        summary: "Arquivar obra (soft delete)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          204: { description: "Obra arquivada", type: "null" },
          404: { description: "Obra não encontrada", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      console.log(`Request to archive obra ${id} from workspace ${req}`);
      try {
        await obraService.archive(id, req.user.workspaceId);
        return reply.code(204).send();
      } catch (err) {
        if (err instanceof ObraNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );
}
