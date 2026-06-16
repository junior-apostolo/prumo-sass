import type { OrcamentoStatus, ItemCategoria } from "@enge-pro/shared";

export type { OrcamentoStatus, ItemCategoria };

export type OrcamentoRecord = {
  id: string;
  obraId: string;
  titulo: string;
  versao: number;
  status: OrcamentoStatus;
  observacoes: string | null;
  validadeAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemOrcamentoRecord = {
  id: string;
  orcamentoId: string;
  descricao: string;
  categoria: ItemCategoria;
  unidade: string;
  quantidade: string; // Decimal serializado como string
  valorUnitario: string; // Decimal serializado como string
  ordem: number;
};

export type OrcamentoComItens = OrcamentoRecord & {
  itens: ItemOrcamentoRecord[];
};

export type CreateOrcamentoData = {
  titulo: string;
  validadeAt?: Date;
  observacoes?: string;
};

export type UpdateOrcamentoData = Partial<CreateOrcamentoData>;

export type UpsertItemData = {
  id?: string;
  descricao: string;
  categoria: ItemCategoria;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  ordem: number;
};

export type OrcamentoPdfData = {
  orcamento: OrcamentoComItens;
  obra: {
    nome: string;
    cliente: string | null;
    endereco: string | null;
  };
  workspace: {
    name: string;
    logoUrl: string | null;
    cnpj: string | null;
    telefone: string | null;
    emailContato: string | null;
    endereco: string | null;
  };
};

export interface IOrcamentoRepository {
  findAllByObra(obraId: string, workspaceId: string): Promise<OrcamentoRecord[]>;
  findById(id: string, workspaceId: string): Promise<OrcamentoComItens | null>;
  create(obraId: string, workspaceId: string, data: CreateOrcamentoData): Promise<OrcamentoRecord>;
  update(id: string, workspaceId: string, data: UpdateOrcamentoData): Promise<OrcamentoRecord | null>;
  upsertItens(orcamentoId: string, workspaceId: string, itens: UpsertItemData[]): Promise<OrcamentoComItens | null>;
  duplicar(id: string, workspaceId: string): Promise<OrcamentoRecord | null>;
  updateStatus(id: string, workspaceId: string, status: OrcamentoStatus): Promise<OrcamentoRecord | null>;
  findByIdComWorkspace(id: string, workspaceId: string): Promise<OrcamentoPdfData | null>;
}
