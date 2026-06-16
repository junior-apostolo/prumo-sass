import { prisma } from "../lib/prisma.js";
import type {
  IOrcamentoRepository,
  OrcamentoRecord,
  OrcamentoComItens,
  ItemOrcamentoRecord,
  CreateOrcamentoData,
  UpdateOrcamentoData,
  UpsertItemData,
  OrcamentoPdfData,
  OrcamentoStatus,
} from "../interfaces/orcamento.interfaces.js";

function mapItem(item: {
  id: string;
  orcamentoId: string;
  descricao: string;
  categoria: string;
  unidade: string;
  quantidade: unknown;
  valorUnitario: unknown;
  ordem: number;
}): ItemOrcamentoRecord {
  return {
    id: item.id,
    orcamentoId: item.orcamentoId,
    descricao: item.descricao,
    categoria: item.categoria as ItemOrcamentoRecord["categoria"],
    unidade: item.unidade,
    quantidade: String(item.quantidade),
    valorUnitario: String(item.valorUnitario),
    ordem: item.ordem,
  };
}

function mapOrcamento(o: {
  id: string;
  obraId: string;
  titulo: string;
  versao: number;
  status: string;
  observacoes: string | null;
  validadeAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): OrcamentoRecord {
  return {
    id: o.id,
    obraId: o.obraId,
    titulo: o.titulo,
    versao: o.versao,
    status: o.status as OrcamentoStatus,
    observacoes: o.observacoes,
    validadeAt: o.validadeAt,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export class OrcamentoRepository implements IOrcamentoRepository {
  async findAllByObra(obraId: string, workspaceId: string): Promise<OrcamentoRecord[]> {
    const rows = await prisma.orcamento.findMany({
      where: { obraId, obra: { workspaceId } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapOrcamento);
  }

  async findById(id: string, workspaceId: string): Promise<OrcamentoComItens | null> {
    const o = await prisma.orcamento.findFirst({
      where: { id, obra: { workspaceId } },
      include: { itens: { orderBy: { ordem: "asc" } } },
    });
    if (!o) return null;
    return { ...mapOrcamento(o), itens: o.itens.map(mapItem) };
  }

  async create(obraId: string, workspaceId: string, data: CreateOrcamentoData): Promise<OrcamentoRecord> {
    const obra = await prisma.obra.findFirst({ where: { id: obraId, workspaceId, archivedAt: null } });
    if (!obra) throw new Error("Obra não encontrada");

    const o = await prisma.orcamento.create({
      data: { obraId, titulo: data.titulo, validadeAt: data.validadeAt, observacoes: data.observacoes },
    });
    return mapOrcamento(o);
  }

  async update(id: string, workspaceId: string, data: UpdateOrcamentoData): Promise<OrcamentoRecord | null> {
    const existing = await prisma.orcamento.findFirst({ where: { id, obra: { workspaceId } } });
    if (!existing) return null;

    const o = await prisma.orcamento.update({
      where: { id },
      data: { titulo: data.titulo, validadeAt: data.validadeAt, observacoes: data.observacoes },
    });
    return mapOrcamento(o);
  }

  async upsertItens(orcamentoId: string, workspaceId: string, itens: UpsertItemData[]): Promise<OrcamentoComItens | null> {
    const existing = await prisma.orcamento.findFirst({ where: { id: orcamentoId, obra: { workspaceId } } });
    if (!existing) return null;

    const incomingIds = itens.filter((i) => i.id).map((i) => i.id as string);

    await prisma.$transaction(async (tx) => {
      if (incomingIds.length > 0) {
        await tx.itemOrcamento.deleteMany({
          where: { orcamentoId, id: { notIn: incomingIds } },
        });
      } else {
        await tx.itemOrcamento.deleteMany({ where: { orcamentoId } });
      }

      for (const item of itens) {
        if (item.id) {
          await tx.itemOrcamento.update({
            where: { id: item.id },
            data: {
              descricao: item.descricao,
              categoria: item.categoria,
              unidade: item.unidade,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              ordem: item.ordem,
            },
          });
        } else {
          await tx.itemOrcamento.create({
            data: {
              orcamentoId,
              descricao: item.descricao,
              categoria: item.categoria,
              unidade: item.unidade,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              ordem: item.ordem,
            },
          });
        }
      }
    });

    return this.findById(orcamentoId, workspaceId);
  }

  async duplicar(id: string, workspaceId: string): Promise<OrcamentoRecord | null> {
    const original = await prisma.orcamento.findFirst({
      where: { id, obra: { workspaceId } },
      include: { itens: true },
    });
    if (!original) return null;

    const novo = await prisma.orcamento.create({
      data: {
        obraId: original.obraId,
        titulo: original.titulo,
        versao: original.versao + 1,
        status: "RASCUNHO",
        observacoes: original.observacoes,
        validadeAt: original.validadeAt,
        itens: {
          create: original.itens.map((item) => ({
            descricao: item.descricao,
            categoria: item.categoria,
            unidade: item.unidade,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            ordem: item.ordem,
          })),
        },
      },
    });
    return mapOrcamento(novo);
  }

  async updateStatus(id: string, workspaceId: string, status: OrcamentoStatus): Promise<OrcamentoRecord | null> {
    const existing = await prisma.orcamento.findFirst({ where: { id, obra: { workspaceId } } });
    if (!existing) return null;

    const o = await prisma.orcamento.update({ where: { id }, data: { status } });
    return mapOrcamento(o);
  }

  async findByIdComWorkspace(id: string, workspaceId: string): Promise<OrcamentoPdfData | null> {
    const o = await prisma.orcamento.findFirst({
      where: { id, obra: { workspaceId } },
      include: {
        itens: { orderBy: { ordem: "asc" } },
        obra: { include: { workspace: true } },
      },
    });
    if (!o) return null;

    return {
      orcamento: { ...mapOrcamento(o), itens: o.itens.map(mapItem) },
      obra: {
        nome: o.obra.nome,
        cliente: o.obra.cliente,
        endereco: o.obra.endereco,
      },
      workspace: {
        name: o.obra.workspace.name,
        logoUrl: o.obra.workspace.logoUrl,
        cnpj: o.obra.workspace.cnpj,
        telefone: o.obra.workspace.telefone,
        emailContato: o.obra.workspace.emailContato,
        endereco: o.obra.workspace.endereco,
      },
    };
  }
}
