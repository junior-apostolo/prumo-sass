import type {
  IGastoRepository,
  GastoRecord,
  CreateGastoData,
  UpdateGastoData,
  FiltrosGasto,
  ResumoFinanceiro,
} from "../interfaces/gasto.interfaces.js";

export class GastoNotFoundError extends Error {
  constructor() {
    super("Gasto não encontrado");
  }
}

export class GastoService {
  constructor(private readonly gastoRepo: IGastoRepository) {}

  async list(obraId: string, workspaceId: string, filtros?: FiltrosGasto): Promise<GastoRecord[]> {
    return this.gastoRepo.findAll(obraId, workspaceId, filtros);
  }

  async get(id: string, workspaceId: string): Promise<GastoRecord> {
    const gasto = await this.gastoRepo.findById(id, workspaceId);
    if (!gasto) throw new GastoNotFoundError();
    return gasto;
  }

  async create(obraId: string, workspaceId: string, data: CreateGastoData): Promise<GastoRecord> {
    return this.gastoRepo.create(obraId, workspaceId, data);
  }

  async update(id: string, workspaceId: string, data: UpdateGastoData): Promise<GastoRecord> {
    const gasto = await this.gastoRepo.update(id, workspaceId, data);
    if (!gasto) throw new GastoNotFoundError();
    return gasto;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const ok = await this.gastoRepo.delete(id, workspaceId);
    if (!ok) throw new GastoNotFoundError();
  }

  async getResumo(obraId: string, workspaceId: string): Promise<ResumoFinanceiro> {
    return this.gastoRepo.getResumo(obraId, workspaceId);
  }
}
