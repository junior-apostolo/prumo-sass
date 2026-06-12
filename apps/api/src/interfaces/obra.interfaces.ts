export type ObraStatus = "PLANEJAMENTO" | "EM_EXECUCAO" | "PAUSADA" | "CONCLUIDA";

export type ObraRecord = {
  id: string;
  workspaceId: string;
  nome: string;
  cliente: string | null;
  endereco: string | null;
  status: ObraStatus;
  valorContrato: string | null; // Decimal serializado como string pelo Prisma
  dataInicio: Date | null;
  dataFim: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ObraResumo = {
  totalOrcado: number;
  totalGasto: number;
  saldo: number | null; // null quando valorContrato não informado
  percentualConsumido: number | null;
};

export type ObraComResumo = ObraRecord & ObraResumo;

export type CreateObraData = {
  nome: string;
  cliente?: string;
  endereco?: string;
  valorContrato?: number;
  dataInicio?: Date;
  dataFim?: Date;
};

export type UpdateObraData = Partial<CreateObraData>;

export interface IObraRepository {
  findAll(workspaceId: string): Promise<ObraComResumo[]>;
  findById(id: string, workspaceId: string): Promise<ObraComResumo | null>;
  create(workspaceId: string, data: CreateObraData): Promise<ObraRecord>;
  update(id: string, workspaceId: string, data: UpdateObraData): Promise<ObraRecord | null>;
  updateStatus(id: string, workspaceId: string, status: ObraStatus): Promise<ObraRecord | null>;
  archive(id: string, workspaceId: string): Promise<ObraRecord | null>;
}
