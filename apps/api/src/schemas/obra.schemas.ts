import { z } from "zod";

export const createObraSchema = z.object({
  nome: z.string().min(1, "Nome da obra é obrigatório"),
  cliente: z.string().optional(),
  endereco: z.string().optional(),
  valorContrato: z.number().positive("Valor do contrato deve ser positivo").optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
});

export const updateObraSchema = createObraSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(["PLANEJAMENTO", "EM_EXECUCAO", "PAUSADA", "CONCLUIDA"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

export const errorSwaggerSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

export const obraSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    workspaceId: { type: "string" },
    nome: { type: "string" },
    cliente: { type: "string", nullable: true },
    endereco: { type: "string", nullable: true },
    status: { type: "string", enum: ["PLANEJAMENTO", "EM_EXECUCAO", "PAUSADA", "CONCLUIDA"] },
    valorContrato: { type: "string", nullable: true },
    dataInicio: { type: "string", format: "date-time", nullable: true },
    dataFim: { type: "string", format: "date-time", nullable: true },
    archivedAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const obraComResumoSwaggerSchema = {
  type: "object",
  properties: {
    ...obraSwaggerSchema.properties,
    totalOrcado: { type: "number" },
    totalGasto: { type: "number" },
    saldo: { type: "number", nullable: true },
    percentualConsumido: { type: "number", nullable: true },
  },
} as const;
