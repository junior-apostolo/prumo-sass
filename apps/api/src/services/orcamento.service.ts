import type {
  IOrcamentoRepository,
  OrcamentoRecord,
  OrcamentoComItens,
  CreateOrcamentoData,
  UpdateOrcamentoData,
  UpsertItemData,
  OrcamentoPdfData,
  OrcamentoStatus,
} from "../interfaces/orcamento.interfaces.js";

export class OrcamentoNotFoundError extends Error {
  constructor() { super("Orçamento não encontrado"); }
}

export class OrcamentoService {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async list(obraId: string, workspaceId: string): Promise<OrcamentoRecord[]> {
    return this.repo.findAllByObra(obraId, workspaceId);
  }

  async get(id: string, workspaceId: string): Promise<OrcamentoComItens> {
    const o = await this.repo.findById(id, workspaceId);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }

  async create(obraId: string, workspaceId: string, data: CreateOrcamentoData): Promise<OrcamentoRecord> {
    return this.repo.create(obraId, workspaceId, data);
  }

  async update(id: string, workspaceId: string, data: UpdateOrcamentoData): Promise<OrcamentoRecord> {
    const o = await this.repo.update(id, workspaceId, data);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }

  async upsertItens(id: string, workspaceId: string, itens: UpsertItemData[]): Promise<OrcamentoComItens> {
    const o = await this.repo.upsertItens(id, workspaceId, itens);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }

  async duplicar(id: string, workspaceId: string): Promise<OrcamentoRecord> {
    const o = await this.repo.duplicar(id, workspaceId);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }

  async updateStatus(id: string, workspaceId: string, status: OrcamentoStatus): Promise<OrcamentoRecord> {
    const o = await this.repo.updateStatus(id, workspaceId, status);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }

  async getParaPdf(id: string, workspaceId: string): Promise<OrcamentoPdfData> {
    const o = await this.repo.findByIdComWorkspace(id, workspaceId);
    if (!o) throw new OrcamentoNotFoundError();
    return o;
  }
}
