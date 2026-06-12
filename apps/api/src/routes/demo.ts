import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { renderOrcamentoDemoToBuffer } from "../pdf/orcamento-demo.js";
import type { DemoWizardPayload } from "@enge-pro/shared";

const demoItemSchema = z.object({
  descricao: z.string().min(1),
  unidade: z.string().min(1),
  quantidade: z.number().positive(),
  valorUnitario: z.number().min(0),
});

const demoPayloadSchema = z.object({
  oficio: z.enum(["PINTURA", "ELETRICA", "REVESTIMENTO", "HIDRAULICA", "OUTRO"]),
  modoServico: z.enum(["wizard", "verba"]),
  prestador: z.object({
    nome: z.string().min(1, "Nome do prestador obrigatório"),
    cpfCnpj: z.string().optional(),
    telefone: z.string().optional(),
  }),
  cliente: z.object({
    nome: z.string().min(1, "Nome do cliente obrigatório"),
    endereco: z.string().optional(),
  }),
  itens: z.array(demoItemSchema).optional(),
  verba: z
    .object({
      descricao: z.string().min(1),
      valorTotal: z.number().min(0),
    })
    .optional(),
  pagamento: z.string().optional(),
  validadeDias: z.number().int().min(1).max(365).default(10),
  observacoes: z.string().optional(),
});

export async function demoRoutes(app: FastifyInstance) {
  app.post(
    "/demo/pdf",
    {
      schema: {
        tags: ["Demo"],
        summary: "Gerar orçamento PDF sem autenticação (demo público)",
        body: {
          type: "object",
          required: ["oficio", "modoServico", "prestador", "cliente", "validadeDias"],
          properties: {
            oficio: { type: "string", enum: ["PINTURA", "ELETRICA", "REVESTIMENTO", "HIDRAULICA", "OUTRO"] },
            modoServico: { type: "string", enum: ["wizard", "verba"] },
            prestador: {
              type: "object",
              required: ["nome"],
              properties: {
                nome: { type: "string" },
                cpfCnpj: { type: "string" },
                telefone: { type: "string" },
              },
            },
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
            validadeDias: { type: "number" },
            observacoes: { type: "string" },
          },
        },
        response: {
          200: { description: "PDF gerado com sucesso", type: "string" },
          400: { description: "Payload inválido", type: "object", properties: { error: { type: "string" } } },
          500: { description: "Erro ao gerar PDF", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      const parse = demoPayloadSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.code(400).send({ error: parse.error.errors[0].message });
      }

      const payload = parse.data as DemoWizardPayload;

      if (payload.modoServico === "wizard" && (!payload.itens || payload.itens.length === 0)) {
        return reply.code(400).send({ error: "Adicione pelo menos um item de serviço" });
      }

      if (payload.modoServico === "verba" && !payload.verba) {
        return reply.code(400).send({ error: "Informe a descrição e o valor do serviço" });
      }

      try {
        const buffer = await renderOrcamentoDemoToBuffer(payload);

        return reply
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", `attachment; filename="orcamento-prumo.pdf"`)
          .header("Cache-Control", "no-store")
          .send(buffer);
      } catch (err) {
        app.log.error(err, "Erro ao gerar PDF demo");
        return reply.code(500).send({ error: "Erro ao gerar o PDF. Tente novamente." });
      }
    },
  );
}
