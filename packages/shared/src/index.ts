// Tipos compartilhados entre apps/web e apps/api

export type UserRole = "OWNER" | "MEMBER";

export type ObraStatus =
  | "PLANEJAMENTO"
  | "EM_EXECUCAO"
  | "PAUSADA"
  | "CONCLUIDA";

export type OrcamentoStatus =
  | "RASCUNHO"
  | "ENVIADO"
  | "APROVADO"
  | "RECUSADO";

export type ItemCategoria =
  | "MATERIAL"
  | "MAO_DE_OBRA"
  | "EQUIPAMENTO"
  | "SERVICO"
  | "OUTROS";

// Respostas padronizadas da API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// DTOs compartilhados (base — cada app pode estender)
export interface WorkspaceDTO {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
}

export interface ObraDTO {
  id: string;
  workspaceId: string;
  nome: string;
  cliente?: string | null;
  endereco?: string | null;
  status: ObraStatus;
  valorContrato?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrcamentoDTO {
  id: string;
  obraId: string;
  titulo: string;
  versao: number;
  status: OrcamentoStatus;
  observacoes?: string | null;
  validadeAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemOrcamentoDTO {
  id: string;
  orcamentoId: string;
  descricao: string;
  categoria: ItemCategoria;
  unidade: string;
  quantidade: string;
  valorUnitario: string;
  ordem: number;
}

export interface GastoDTO {
  id: string;
  obraId: string;
  descricao: string;
  categoria: ItemCategoria;
  valor: string;
  data: string;
  fornecedor?: string | null;
  comprovante?: string | null;
  createdAt: string;
}

// ─── Demo / Orçamento público ─────────────────────────────────────────────────

export type TipoOficio =
  | "PINTURA"
  | "ELETRICA"
  | "REVESTIMENTO"
  | "HIDRAULICA"
  | "OUTRO";

export interface DemoItemServico {
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

export interface DemoVerba {
  descricao: string;
  valorTotal: number;
}

export interface DemoWizardPayload {
  oficio: TipoOficio;
  modoServico: "wizard" | "verba";
  prestador: {
    nome: string;
    cpfCnpj?: string;
    telefone?: string;
  };
  cliente: {
    nome: string;
    endereco?: string;
  };
  itens?: DemoItemServico[];
  verba?: DemoVerba;
  pagamento?: string;
  validadeDias: number;
  observacoes?: string;
}

// ─── Orçamento Rápido (autenticado, transiente) ───────────────────────────────

export interface OrcamentoRapidoItem {
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OrcamentoRapidoPayload {
  oficio: TipoOficio;
  modoServico: "wizard" | "verba";
  cliente: {
    nome: string;
    endereco?: string;
  };
  itens?: OrcamentoRapidoItem[];
  verba?: {
    descricao: string;
    valorTotal: number;
  };
  pagamento?: string;
  validadeDias: number;
  observacoes?: string;
}
