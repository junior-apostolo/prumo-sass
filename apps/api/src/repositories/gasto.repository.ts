import { prisma } from "../lib/prisma.js";
import type {
  IGastoRepository,
  GastoRecord,
  CreateGastoData,
  UpdateGastoData,
  FiltrosGasto,
  ResumoFinanceiro,
  ResumoCategoria,
  ResumoMes,
  ItemCategoria,
} from "../interfaces/gasto.interfaces.js";

function toRecord(g: {
  id: string;
  obraId: string;
  descricao: string;
  categoria: string;
  valor: unknown;
  data: Date;
  fornecedor: string | null;
  createdAt: Date;
}): GastoRecord {
  return {
    id: g.id,
    obraId: g.obraId,
    descricao: g.descricao,
    categoria: g.categoria as ItemCategoria,
    valor: String(g.valor),
    data: g.data,
    fornecedor: g.fornecedor,
    createdAt: g.createdAt,
  };
}

export class GastoRepository implements IGastoRepository {
  async findAll(obraId: string, workspaceId: string, filtros?: FiltrosGasto): Promise<GastoRecord[]> {
    const gastos = await prisma.gasto.findMany({
      where: {
        obraId,
        obra: { workspaceId },
        ...(filtros?.categoria ? { categoria: filtros.categoria } : {}),
        ...(filtros?.dataInicio || filtros?.dataFim
          ? {
              data: {
                ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
                ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
              },
            }
          : {}),
      },
      orderBy: { data: "desc" },
    });
    return gastos.map(toRecord);
  }

  async findById(id: string, workspaceId: string): Promise<GastoRecord | null> {
    const gasto = await prisma.gasto.findFirst({
      where: { id, obra: { workspaceId } },
    });
    if (!gasto) return null;
    return toRecord(gasto);
  }

  async create(obraId: string, workspaceId: string, data: CreateGastoData): Promise<GastoRecord> {
    const obra = await prisma.obra.findFirst({ where: { id: obraId, workspaceId } });
    if (!obra) throw new Error("Obra não encontrada");

    const gasto = await prisma.gasto.create({
      data: {
        obraId,
        descricao: data.descricao,
        categoria: data.categoria ?? "OUTROS",
        valor: data.valor,
        data: data.data ?? new Date(),
        fornecedor: data.fornecedor,
      },
    });
    return toRecord(gasto);
  }

  async update(id: string, workspaceId: string, data: UpdateGastoData): Promise<GastoRecord | null> {
    const existing = await prisma.gasto.findFirst({ where: { id, obra: { workspaceId } } });
    if (!existing) return null;

    const gasto = await prisma.gasto.update({
      where: { id },
      data: {
        ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
        ...(data.categoria !== undefined ? { categoria: data.categoria } : {}),
        ...(data.valor !== undefined ? { valor: data.valor } : {}),
        ...(data.data !== undefined ? { data: data.data } : {}),
        ...(data.fornecedor !== undefined ? { fornecedor: data.fornecedor } : {}),
      },
    });
    return toRecord(gasto);
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const existing = await prisma.gasto.findFirst({ where: { id, obra: { workspaceId } } });
    if (!existing) return false;
    await prisma.gasto.delete({ where: { id } });
    return true;
  }

  async getResumo(obraId: string, workspaceId: string): Promise<ResumoFinanceiro> {
    const obra = await prisma.obra.findFirst({
      where: { id: obraId, workspaceId },
      include: {
        gastos: true,
        orcamentos: {
          where: { status: "APROVADO" },
          include: { itens: { select: { quantidade: true, valorUnitario: true } } },
        },
      },
    });

    if (!obra) throw new Error("Obra não encontrada");

    const totalContrato = obra.valorContrato ? parseFloat(String(obra.valorContrato)) : null;

    const totalOrcado = obra.orcamentos.reduce((sum, o) => {
      return (
        sum +
        o.itens.reduce(
          (s, i) => s + parseFloat(String(i.quantidade)) * parseFloat(String(i.valorUnitario)),
          0,
        )
      );
    }, 0);

    const totalGasto = obra.gastos.reduce((sum, g) => sum + parseFloat(String(g.valor)), 0);
    const saldo = totalContrato !== null ? totalContrato - totalGasto : null;

    // Agrega por categoria
    const categMap = new Map<ItemCategoria, number>();
    for (const g of obra.gastos) {
      const cat = g.categoria as ItemCategoria;
      categMap.set(cat, (categMap.get(cat) ?? 0) + parseFloat(String(g.valor)));
    }
    const porCategoria: ResumoCategoria[] = Array.from(categMap.entries()).map(
      ([categoria, total]) => ({ categoria, total }),
    );

    // Agrega por mês
    const mesMap = new Map<string, number>();
    for (const g of obra.gastos) {
      const mes = g.data.toISOString().slice(0, 7); // "YYYY-MM"
      mesMap.set(mes, (mesMap.get(mes) ?? 0) + parseFloat(String(g.valor)));
    }
    const porMes: ResumoMes[] = Array.from(mesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, total]) => ({ mes, total }));

    return { totalContrato, totalOrcado, totalGasto, saldo, porCategoria, porMes };
  }
}
