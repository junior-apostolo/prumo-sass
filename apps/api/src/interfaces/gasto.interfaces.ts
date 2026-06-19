export type ItemCategoria = "MATERIAL" | "MAO_DE_OBRA" | "EQUIPAMENTO" | "SERVICO" | "OUTROS";

export type GastoRecord = {
  id: string;
  obraId: string;
  descricao: string;
  categoria: ItemCategoria;
  valor: string; // Decimal serializado como string
  data: Date;
  fornecedor: string | null;
  createdAt: Date;
};

export type CreateGastoData = {
  descricao: string;
  categoria?: ItemCategoria;
  valor: number;
  data?: Date;
  fornecedor?: string;
};

export type UpdateGastoData = Partial<CreateGastoData>;

export type FiltrosGasto = {
  categoria?: ItemCategoria;
  dataInicio?: Date;
  dataFim?: Date;
};

export type ResumoCategoria = { categoria: ItemCategoria; total: number };
export type ResumoMes = { mes: string; total: number }; // "YYYY-MM"

export type ResumoFinanceiro = {
  totalContrato: number | null;
  totalOrcado: number;
  totalGasto: number;
  saldo: number | null;
  porCategoria: ResumoCategoria[];
  porMes: ResumoMes[];
};

export interface IGastoRepository {
  findAll(obraId: string, workspaceId: string, filtros?: FiltrosGasto): Promise<GastoRecord[]>;
  findById(id: string, workspaceId: string): Promise<GastoRecord | null>;
  create(obraId: string, workspaceId: string, data: CreateGastoData): Promise<GastoRecord>;
  update(id: string, workspaceId: string, data: UpdateGastoData): Promise<GastoRecord | null>;
  delete(id: string, workspaceId: string): Promise<boolean>;
  getResumo(obraId: string, workspaceId: string): Promise<ResumoFinanceiro>;
}
