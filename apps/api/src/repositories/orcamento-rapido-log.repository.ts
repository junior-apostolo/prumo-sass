import { prisma } from "../lib/prisma.js";

export interface OrcamentoRapidoLogRecord {
  id: string;
  clienteNome: string;
  oficio: string;
  valorTotal: string;
  createdAt: string;
}

export interface CreateOrcamentoRapidoLogData {
  clienteNome: string;
  oficio: string;
  valorTotal: number;
}

function toRecord(l: {
  id: string;
  clienteNome: string;
  oficio: string;
  valorTotal: unknown;
  createdAt: Date;
}): OrcamentoRapidoLogRecord {
  return {
    id: l.id,
    clienteNome: l.clienteNome,
    oficio: l.oficio,
    valorTotal: String(l.valorTotal),
    createdAt: l.createdAt.toISOString(),
  };
}

export class OrcamentoRapidoLogRepository {
  async create(workspaceId: string, data: CreateOrcamentoRapidoLogData): Promise<OrcamentoRapidoLogRecord> {
    const log = await prisma.orcamentoRapidoLog.create({
      data: {
        workspaceId,
        clienteNome: data.clienteNome,
        oficio: data.oficio,
        valorTotal: data.valorTotal,
      },
    });
    return toRecord(log);
  }

  async listRecent(workspaceId: string, limit = 10): Promise<OrcamentoRapidoLogRecord[]> {
    const logs = await prisma.orcamentoRapidoLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return logs.map(toRecord);
  }
}
