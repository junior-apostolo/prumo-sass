import { z } from "zod";

export const createOrcamentoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  validadeAt: z.coerce.date().optional(),
  observacoes: z.string().optional(),
});

export const updateOrcamentoSchema = createOrcamentoSchema.partial();

export const upsertItemSchema = z.object({
  id: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z.enum(["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"]),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  valorUnitario: z.number().min(0, "Valor unitário deve ser zero ou positivo"),
  ordem: z.number().int().min(0),
});

export const upsertItensSchema = z.object({
  itens: z.array(upsertItemSchema),
});

export const updateOrcamentoStatusSchema = z.object({
  status: z.enum(["RASCUNHO", "ENVIADO", "APROVADO", "RECUSADO"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

export const errorSwaggerSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

export const itemOrcamentoSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    orcamentoId: { type: "string" },
    descricao: { type: "string" },
    categoria: {
      type: "string",
      enum: ["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"],
    },
    unidade: { type: "string" },
    quantidade: { type: "string" },
    valorUnitario: { type: "string" },
    ordem: { type: "number" },
  },
} as const;

export const orcamentoSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    obraId: { type: "string" },
    titulo: { type: "string" },
    versao: { type: "number" },
    status: {
      type: "string",
      enum: ["RASCUNHO", "ENVIADO", "APROVADO", "RECUSADO"],
    },
    observacoes: { type: "string", nullable: true },
    validadeAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const orcamentoComItensSwaggerSchema = {
  type: "object",
  properties: {
    ...orcamentoSwaggerSchema.properties,
    itens: { type: "array", items: itemOrcamentoSwaggerSchema },
  },
} as const;
