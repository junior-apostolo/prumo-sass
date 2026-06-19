import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middlewares/authenticate.js";
import { prisma } from "../lib/prisma.js";
import { renderOrcamentoRapidoToBuffer } from "../pdf/orcamento-rapido.js";
import type { OrcamentoRapidoPayload } from "@enge-pro/shared";

const OFICIOS = ["PINTURA", "ELETRICA", "REVESTIMENTO", "HIDRAULICA", "OUTRO"] as const;

const orcamentoRapidoItemSchema = z.object({
  descricao: z.string().min(1, "Descrição do item obrigatória"),
  unidade: z.string().min(1, "Unidade obrigatória"),
  quantidade: z.number().positive("Quantidade deve ser maior que zero"),
  valorUnitario: z.number().min(0, "Valor não pode ser negativo"),
});

const orcamentoRapidoSchema = z
  .object({
    oficio: z.enum(OFICIOS),
    modoServico: z.enum(["wizard", "verba"]),
    cliente: z.object({
      nome: z.string().min(1, "Nome do cliente obrigatório"),
      endereco: z.string().optional(),
    }),
    itens: z.array(orcamentoRapidoItemSchema).optional(),
    verba: z
      .object({
        descricao: z.string().min(1, "Descrição do serviço obrigatória"),
        valorTotal: z.number().positive("Valor total deve ser maior que zero"),
      })
      .optional(),
    pagamento: z.string().optional(),
    validadeDias: z.number().int().min(1).max(365).default(15),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modoServico === "wizard") {
      if (!data.itens || data.itens.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Adicione pelo menos um item", path: ["itens"] });
      }
    } else {
      if (!data.verba) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a descrição e o valor do serviço", path: ["verba"] });
      }
    }
  });

export async function orcamentosRapidoRoutes(app: FastifyInstance) {
  app.post(
    "/orcamentos/rapido/pdf",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Orçamentos"],
        summary: "Gerar orçamento rápido em PDF (autenticado, sem vínculo a obra)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["oficio", "modoServico", "cliente", "validadeDias"],
          properties: {
            oficio: { type: "string", enum: ["PINTURA", "ELETRICA", "REVESTIMENTO", "HIDRAULICA", "OUTRO"] },
            modoServico: { type: "string", enum: ["wizard", "verba"] },
            cliente: {
              type: "object",
              required: ["nome"],
              properties: {
                nome: { type: "string" },
                endereco: { type: "string" },
              },
            },
            itens: {
              type: "array",
              items: {
                type: "object",
                required: ["descricao", "unidade", "quantidade", "valorUnitario"],
                properties: {
                  descricao: { type: "string" },
                  unidade: { type: "string" },
                  quantidade: { type: "number" },
                  valorUnitario: { type: "number" },
                },
              },
            },
            verba: {
              type: "object",
              properties: {
                descricao: { type: "string" },
                valorTotal: { type: "number" },
              },
            },
            pagamento: { type: "string" },
            validadeDias: { type: "number", default: 15 },
            observacoes: { type: "string" },
          },
        },
        response: {
          200: { description: "PDF gerado com sucesso", type: "string" },
          400: {
            description: "Payload inválido",
            type: "object",
            properties: { error: { type: "string" } },
          },
          500: {
            description: "Erro ao gerar PDF",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (req, reply) => {
      const parse = orcamentoRapidoSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: req.user.workspaceId },
        select: { name: true, razaoSocial: true, logoUrl: true, cnpj: true, telefone: true, emailContato: true },
      });

      if (!workspace) {
        return reply.code(500).send({ error: "Workspace não encontrado" });
      }

      try {
        const buffer = await renderOrcamentoRapidoToBuffer({
          payload: parse.data as OrcamentoRapidoPayload,
          workspace,
        });

        return reply
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", 'attachment; filename="orcamento-rapido.pdf"')
          .header("Cache-Control", "no-store")
          .send(buffer);
      } catch (err) {
        app.log.error(err, "Erro ao gerar PDF rápido");
        return reply.code(500).send({ error: "Erro ao gerar o PDF. Tente novamente." });
      }
    },
  );
}
