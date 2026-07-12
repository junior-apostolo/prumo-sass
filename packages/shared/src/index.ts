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

// ─── Formatação de contato (telefone, CPF/CNPJ, email) ────────────────────────
// Todas as funções são idempotentes: extraem apenas dígitos antes de reformatar,
// então aplicar a um valor já formatado produz o mesmo resultado.

export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const splitAt = digits.length > 10 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

function formatCpfDigits(digits: string): string {
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatCnpjDigits(digits: string): string {
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return formatCnpjDigits(digits);
}

/** Alterna CPF (até 11 dígitos) / CNPJ (acima de 11) conforme a quantidade digitada. */
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits.length > 11 ? formatCnpjDigits(digits) : formatCpfDigits(digits);
}

export function formatEmail(value: string): string {
  return value.toLowerCase();
}
