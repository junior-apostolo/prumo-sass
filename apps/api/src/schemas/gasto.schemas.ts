import { z } from "zod";

export const createGastoSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  categoria: z
    .enum(["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"])
    .optional(),
  valor: z.number().positive("Valor deve ser positivo"),
  data: z.coerce.date().optional(),
  fornecedor: z.string().optional(),
});

export const updateGastoSchema = createGastoSchema.partial();

export const filtrosGastoSchema = z.object({
  categoria: z
    .enum(["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"])
    .optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
});

const categoriaEnum = ["MATERIAL", "MAO_DE_OBRA", "EQUIPAMENTO", "SERVICO", "OUTROS"] as const;

export const gastoSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    obraId: { type: "string" },
    descricao: { type: "string" },
    categoria: { type: "string", enum: categoriaEnum },
    valor: { type: "string" },
    data: { type: "string", format: "date-time" },
    fornecedor: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const errorSwaggerSchema = {
  type: "object",
  properties: { error: { type: "string" } },
};
