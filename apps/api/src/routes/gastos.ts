import type { FastifyInstance } from "fastify";
import { GastoService, GastoNotFoundError } from "../services/gasto.service.js";
import { GastoRepository } from "../repositories/gasto.repository.js";
import { createGastoSchema, updateGastoSchema, filtrosGastoSchema, gastoSwaggerSchema, errorSwaggerSchema } from "../schemas/gasto.schemas.js";
import { authenticate } from "../middlewares/authenticate.js";
import type { ItemCategoria } from "../interfaces/gasto.interfaces.js";

const CATEGORIA_LABELS: Record<ItemCategoria, string> = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  EQUIPAMENTO: "Equipamento",
  SERVICO: "Serviço",
  OUTROS: "Outros",
};

function buildGastoService() {
  return new GastoService(new GastoRepository());
}

export async function gastosRoutes(app: FastifyInstance) {
  const gastoService = buildGastoService();

  // GET /obras/:obraId/gastos
  app.get(
    "/obras/:obraId/gastos",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Listar gastos de uma obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
        querystring: {
          type: "object",
          properties: {
            categoria: { type: "string", enum: ["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"] },
            dataInicio: { type: "string", format: "date" },
            dataFim: { type: "string", format: "date" },
          },
        },
        response: {
          200: { type: "array", items: gastoSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      const parse = filtrosGastoSchema.safeParse(req.query);
      const filtros = parse.success ? parse.data : {};
      const gastos = await gastoService.list(obraId, req.user.workspaceId, filtros);
      return reply.send(gastos);
    },
  );

  // POST /obras/:obraId/gastos
  app.post(
    "/obras/:obraId/gastos",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Registrar gasto em uma obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
        body: {
          type: "object",
          required: ["descricao", "valor"],
          properties: {
            descricao: { type: "string", minLength: 1 },
            categoria: { type: "string", enum: ["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"] },
            valor: { type: "number", minimum: 0.01 },
            data: { type: "string", format: "date" },
            fornecedor: { type: "string" },
          },
        },
        response: {
          201: { ...gastoSwaggerSchema },
          400: { ...errorSwaggerSchema },
          404: { ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      const parse = createGastoSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const gasto = await gastoService.create(obraId, req.user.workspaceId, parse.data);
        return reply.code(201).send(gasto);
      } catch (err) {
        if (err instanceof Error && err.message === "Obra não encontrada") {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // PUT /gastos/:id
  app.put(
    "/gastos/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Editar gasto",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: { ...gastoSwaggerSchema },
          400: { ...errorSwaggerSchema },
          404: { ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parse = updateGastoSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }
      try {
        const gasto = await gastoService.update(id, req.user.workspaceId, parse.data);
        return reply.send(gasto);
      } catch (err) {
        if (err instanceof GastoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // DELETE /gastos/:id
  app.delete(
    "/gastos/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Excluir gasto",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          204: { type: "null" },
          404: { ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        await gastoService.delete(id, req.user.workspaceId);
        return reply.code(204).send();
      } catch (err) {
        if (err instanceof GastoNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // GET /obras/:obraId/financeiro/resumo
  app.get(
    "/obras/:obraId/financeiro/resumo",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Resumo financeiro detalhado da obra",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              totalContrato: { type: "number", nullable: true },
              totalOrcado: { type: "number" },
              totalGasto: { type: "number" },
              saldo: { type: "number", nullable: true },
              porCategoria: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    categoria: { type: "string" },
                    total: { type: "number" },
                  },
                },
              },
              porMes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    mes: { type: "string" },
                    total: { type: "number" },
                  },
                },
              },
            },
          },
          404: { ...errorSwaggerSchema },
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      try {
        const resumo = await gastoService.getResumo(obraId, req.user.workspaceId);
        return reply.send(resumo);
      } catch (err) {
        if (err instanceof Error && err.message === "Obra não encontrada") {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  // GET /obras/:obraId/financeiro/export (CSV)
  app.get(
    "/obras/:obraId/financeiro/export",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gastos"],
        summary: "Exportar gastos em CSV",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { obraId: { type: "string" } },
          required: ["obraId"],
        },
      },
    },
    async (req, reply) => {
      const { obraId } = req.params as { obraId: string };
      const gastos = await gastoService.list(obraId, req.user.workspaceId);

      const header = "data,descricao,categoria,valor,fornecedor\n";
      const rows = gastos
        .map((g) => {
          const data = new Date(g.data).toLocaleDateString("pt-BR");
          const desc = `"${g.descricao.replace(/"/g, '""')}"`;
          const cat = CATEGORIA_LABELS[g.categoria];
          const valor = parseFloat(g.valor).toFixed(2).replace(".", ",");
          const forn = g.fornecedor ? `"${g.fornecedor.replace(/"/g, '""')}"` : "";
          return `${data},${desc},${cat},${valor},${forn}`;
        })
        .join("\n");

      // UTF-8 BOM para Excel abrir corretamente
      const bom = "﻿";
      const csv = bom + header + rows;

      return reply
        .header("Content-Type", "text/csv; charset=utf-8")
        .header("Content-Disposition", 'attachment; filename="gastos.csv"')
        .send(csv);
    },
  );
}
