import { api } from "./api";

export type ItemCategoria = "MATERIAL" | "MAO_DE_OBRA" | "EQUIPAMENTO" | "SERVICO" | "OUTROS";

export type GastoRecord = {
  id: string;
  obraId: string;
  descricao: string;
  categoria: ItemCategoria;
  valor: string; // Decimal serializado como string
  data: string;
  fornecedor: string | null;
  createdAt: string;
};

export type CreateGastoInput = {
  descricao: string;
  categoria?: ItemCategoria;
  valor: number;
  data?: string;
  fornecedor?: string;
};

export type UpdateGastoInput = Partial<CreateGastoInput>;

export type FiltrosGasto = {
  categoria?: ItemCategoria;
  dataInicio?: string;
  dataFim?: string;
};

export type ResumoCategoria = { categoria: ItemCategoria; total: number };
export type ResumoMes = { mes: string; total: number };

export type ResumoFinanceiro = {
  totalContrato: number | null;
  totalOrcado: number;
  totalGasto: number;
  saldo: number | null;
  porCategoria: ResumoCategoria[];
  porMes: ResumoMes[];
};

export const CATEGORIA_LABELS: Record<ItemCategoria, string> = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  EQUIPAMENTO: "Equipamento",
  SERVICO: "Serviço",
  OUTROS: "Outros",
};

export const CATEGORIAS: ItemCategoria[] = [
  "MATERIAL",
  "MAO_DE_OBRA",
  "EQUIPAMENTO",
  "SERVICO",
  "OUTROS",
];

export const gastosApi = {
  list: (obraId: string, filtros?: FiltrosGasto) => {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.set("categoria", filtros.categoria);
    if (filtros?.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros?.dataFim) params.set("dataFim", filtros.dataFim);
    const qs = params.toString();
    return api.get<GastoRecord[]>(`/obras/${obraId}/gastos${qs ? `?${qs}` : ""}`);
  },
  create: (obraId: string, data: CreateGastoInput) =>
    api.post<GastoRecord>(`/obras/${obraId}/gastos`, data),
  update: (id: string, data: UpdateGastoInput) =>
    api.put<GastoRecord>(`/gastos/${id}`, data),
  delete: (id: string) => api.delete<void>(`/gastos/${id}`),
  getResumo: (obraId: string) =>
    api.get<ResumoFinanceiro>(`/obras/${obraId}/financeiro/resumo`),
  exportCsv: (obraId: string) =>
    api.blob(`/obras/${obraId}/financeiro/export`),
};
