import { api } from "./api";

export type ObraStatus = "PLANEJAMENTO" | "EM_EXECUCAO" | "PAUSADA" | "CONCLUIDA";

export type Obra = {
  id: string;
  workspaceId: string;
  nome: string;
  cliente: string | null;
  endereco: string | null;
  status: ObraStatus;
  valorContrato: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ObraComResumo = Obra & {
  totalOrcado: number;
  totalGasto: number;
  saldo: number | null;
  percentualConsumido: number | null;
};

export type CreateObraInput = {
  nome: string;
  cliente?: string;
  endereco?: string;
  valorContrato?: number;
  dataInicio?: string;
  dataFim?: string;
};

export type UpdateObraInput = Partial<CreateObraInput>;

export const obrasApi = {
  list: () => api.get<ObraComResumo[]>("/obras"),
  get: (id: string) => api.get<ObraComResumo>(`/obras/${id}`),
  create: (data: CreateObraInput) => api.post<Obra>("/obras", data),
  update: (id: string, data: UpdateObraInput) => api.put<Obra>(`/obras/${id}`, data),
  updateStatus: (id: string, status: ObraStatus) =>
    api.patch<Obra>(`/obras/${id}/status`, { status }),
  archive: (id: string) => api.delete<void>(`/obras/${id}`),
};
