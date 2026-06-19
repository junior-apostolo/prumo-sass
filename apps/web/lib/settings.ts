import { api, getApiToken } from "./api";

export type WorkspaceSettings = {
  id: string;
  name: string;
  razaoSocial: string | null;
  logoUrl: string | null;
  cnpj: string | null;
  telefone: string | null;
  emailContato: string | null;
  endereco: string | null;
  createdAt: string;
};

export type ProfileData = {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
};

export const settingsApi = {
  getWorkspace: () => api.get<WorkspaceSettings>("/settings/workspace"),

  updateWorkspace: (data: Partial<Omit<WorkspaceSettings, "id" | "logoUrl" | "createdAt">>) =>
    api.put<WorkspaceSettings>("/settings/workspace", data),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.put<ProfileData>("/settings/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<void>("/settings/password", data),

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const form = new FormData();
    form.append("logo", file);

    const token = getApiToken();

    const res = await fetch(`${API_URL}/settings/workspace/logo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Erro no upload");
    }
    return res.json();
  },
};
