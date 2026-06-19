import { prisma } from "../lib/prisma.js";

export type WorkspaceRecord = {
  id: string;
  name: string;
  razaoSocial: string | null;
  logoUrl: string | null;
  cnpj: string | null;
  telefone: string | null;
  emailContato: string | null;
  endereco: string | null;
  createdAt: Date;
};

export type UpdateWorkspaceData = {
  name?: string;
  razaoSocial?: string;
  logoUrl?: string;
  cnpj?: string;
  telefone?: string;
  emailContato?: string;
  endereco?: string;
};

export class WorkspaceRepository {
  async findById(workspaceId: string): Promise<WorkspaceRecord | null> {
    return prisma.workspace.findUnique({ where: { id: workspaceId } });
  }

  async update(workspaceId: string, data: UpdateWorkspaceData): Promise<WorkspaceRecord> {
    return prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.razaoSocial !== undefined ? { razaoSocial: data.razaoSocial } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.cnpj !== undefined ? { cnpj: data.cnpj } : {}),
        ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
        ...(data.emailContato !== undefined ? { emailContato: data.emailContato } : {}),
        ...(data.endereco !== undefined ? { endereco: data.endereco } : {}),
      },
    });
  }
}
