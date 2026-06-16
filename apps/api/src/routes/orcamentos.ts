import type { FastifyInstance } from "fastify";
import {
  createOrcamentoSchema,
  updateOrcamentoSchema,
  upsertItensSchema,
  updateOrcamentoStatusSchema,
  errorSwaggerSchema,
  orcamentoSwaggerSchema,
  orcamentoComItensSwaggerSchema,
} from "../schemas/orcamento.schemas.js";
import { OrcamentoService, OrcamentoNotFoundError } from "../services/orcamento.service.js";
import { OrcamentoRepository } from "../repositories/orcamento.repository.js";
import { authenticate } from "../middlewares/authenticate.js";
import { renderOrcamentoToBuffer } from "../pdf/orcamento.js";

function buildService(): OrcamentoService {
  return new OrcamentoService(new OrcamentoRepository());
}

export async function orcamentosRoutes(app: FastifyInstance) {
  const service = buildService();

  // ─── T-08: GET + POST /obras/:obraId/orcamentos ────────────────────────────

  app.get(
    "/obras/:obraId/orcamentos",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Listar orçamentos de uma obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
        response: {
          200: { description: "Lista de orçamentos", type: "array", items: orcamentoSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      const list = await service.list(obraId, req.user.workspaceId);
      return reply.send(list);
    },
  );

  app.post(
    "/obras/:obraId/orcamentos",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Criar orçamento vinculado a uma obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
        body: {
          type: "object",
          required: ["titulo"],
          properties: {
            titulo: { type: "string", minLength: 1 },
            validadeAt: { type: "string", format: "date" },
            observacoes: { type: "string" },
          },
        },
        response: {
          201: { description: "Orçamento criado", ...orcamentoSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          404: { description: "Obra não encontrada", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      const parse = createOrcamentoSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const o = await service.create(obraId, req.user.workspaceId, parse.data);
        return reply.code(201).send(o);
      } catch (err) {
        if (err instanceof Error && err.message === "Obra não encontrada") {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // ─── T-09: GET + PUT /orcamentos/:id ───────────────────────────────────────

  app.get(
    "/orcamentos/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Detalhe do orçamento com itens",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: { description: "Orçamento com itens", ...orcamentoComItensSwaggerSchema },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        const o = await service.get(id, req.user.workspaceId);
        return reply.send(o);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  app.put(
    "/orcamentos/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Atualizar cabeçalho do orçamento",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            titulo: { type: "string", minLength: 1 },
            validadeAt: { type: "string", format: "date" },
            observacoes: { type: "string" },
          },
        },
        response: {
          200: { description: "Orçamento atualizado", ...orcamentoSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = updateOrcamentoSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const o = await service.update(id, req.user.workspaceId, parse.data);
        return reply.send(o);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // ─── T-10: PUT /orcamentos/:id/itens ───────────────────────────────────────

  app.put(
    "/orcamentos/:id/itens",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Upsert completo dos itens do orçamento",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        body: {
          type: "object",
          required: ["itens"],
          properties: {
            itens: {
              type: "array",
              items: {
                type: "object",
                required: ["descricao", "categoria", "unidade", "quantidade", "valorUnitario", "ordem"],
                properties: {
                  id: { type: "string" },
                  descricao: { type: "string" },
                  categoria: { type: "string", enum: ["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"] },
                  unidade: { type: "string" },
                  quantidade: { type: "number" },
                  valorUnitario: { type: "number" },
                  ordem: { type: "number" },
                },
              },
            },
          },
        },
        response: {
          200: { description: "Orçamento com itens atualizados", ...orcamentoComItensSwaggerSchema },
          400: { description: "Dados inválidos", ...errorSwaggerSchema },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = upsertItensSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const o = await service.upsertItens(id, req.user.workspaceId, parse.data.itens);
        return reply.send(o);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // ─── T-11: POST /duplicar + PATCH /status ──────────────────────────────────

  app.post(
    "/orcamentos/:id/duplicar",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Duplicar orçamento (versão + 1)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          201: { description: "Novo orçamento duplicado", ...orcamentoSwaggerSchema },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        const o = await service.duplicar(id, req.user.workspaceId);
        return reply.code(201).send(o);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  app.patch(
    "/orcamentos/:id/status",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Alterar status do orçamento",
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
            status: { type: "string", enum: ["RASCUNHO", "ENVIADO", "APROVADO", "RECUSADO"] },
          },
        },
        response: {
          200: { description: "Status atualizado", ...orcamentoSwaggerSchema },
          400: { description: "Status inválido", ...errorSwaggerSchema },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = updateOrcamentoStatusSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const o = await service.updateStatus(id, req.user.workspaceId, parse.data.status);
        return reply.send(o);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // ─── T-12: GET /orcamentos/:id/pdf ─────────────────────────────────────────

  app.get(
    "/orcamentos/:id/pdf",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Gerar e baixar PDF do orçamento",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: { description: "PDF binário", type: "string", format: "binary" },
          404: { description: "Orçamento não encontrado", ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        const data = await service.getParaPdf(id, req.user.workspaceId);
        const buffer = await renderOrcamentoToBuffer(data);
        return reply
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", `attachment; filename="orcamento-${id}.pdf"`)
          .send(buffer);
      } catch (err) {
        if (err instanceof OrcamentoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );
}
