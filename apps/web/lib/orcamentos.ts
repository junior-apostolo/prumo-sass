import { OrcamentoDTO, ItemOrcamentoDTO } from "@enge-pro/shared";
import { api } from "./api";

export type { OrcamentoStatus, ItemCategoria, OrcamentoRapidoPayload } from "@enge-pro/shared";
export type { OrcamentoDTO, ItemOrcamentoDTO } from "@enge-pro/shared";
import type { OrcamentoStatus, ItemCategoria, OrcamentoRapidoPayload } from "@enge-pro/shared";

export type OrcamentoComItens = OrcamentoDTO & { itens: ItemOrcamentoDTO[] };

export type CreateOrcamentoInput = {
  titulo: string;
  validadeAt?: string;
  observacoes?: string;
};

export type UpdateOrcamentoInput = Partial<CreateOrcamentoInput>;

export type UpsertItemInput = {
  id?: string;
  descricao: string;
  categoria: ItemCategoria;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  ordem: number;
};

export const orcamentosApi = {
  list: (obraId: string) => api.get<OrcamentoDTO[]>(`/obras/${obraId}/orcamentos`),
  create: (obraId: string, data: CreateOrcamentoInput) =>
    api.post<OrcamentoDTO>(`/obras/${obraId}/orcamentos`, data),
  get: (id: string) => api.get<OrcamentoComItens>(`/orcamentos/${id}`),
  update: (id: string, data: UpdateOrcamentoInput) =>
    api.put<OrcamentoDTO>(`/orcamentos/${id}`, data),
  upsertItens: (id: string, itens: UpsertItemInput[]) =>
    api.put<OrcamentoComItens>(`/orcamentos/${id}/itens`, { itens }),
  duplicar: (id: string) => api.post<OrcamentoDTO>(`/orcamentos/${id}/duplicar`, {}),
  updateStatus: (id: string, status: OrcamentoStatus) =>
    api.patch<OrcamentoDTO>(`/orcamentos/${id}/status`, { status }),
  downloadPdf: (id: string) => api.blob(`/orcamentos/${id}/pdf`),
  gerarRapido: (payload: OrcamentoRapidoPayload) =>
    api.blob("/orcamentos/rapido/pdf", { method: "POST", body: payload }),
};
