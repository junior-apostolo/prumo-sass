import { prisma } from "../lib/prisma.js";
import type {
  IObraRepository,
  ObraRecord,
  ObraComResumo,
  ObraStatus,
  CreateObraData,
  UpdateObraData,
} from "../interfaces/obra.interfaces.js";

function calcularResumo(
  valorContrato: string | null,
  totalGasto: number,
  totalOrcado: number,
): Pick<ObraComResumo, "totalOrcado" | "totalGasto" | "saldo" | "percentualConsumido"> {
  const contrato = valorContrato ? parseFloat(valorContrato) : null;
  const saldo = contrato !== null ? contrato - totalGasto : null;
  const percentualConsumido = contrato && contrato > 0 ? (totalGasto / contrato) * 100 : null;
  return { totalOrcado, totalGasto, saldo, percentualConsumido };
}

export class ObraRepository implements IObraRepository {
  async findAll(workspaceId: string): Promise<ObraComResumo[]> {
    const obras = await prisma.obra.findMany({
      where: { workspaceId, archivedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        gastos: { select: { valor: true } },
        orcamentos: {
          where: { status: "APROVADO" },
          include: { itens: { select: { quantidade: true, valorUnitario: true } } },
        },
      },
    });

    return obras.map((obra) => {
      const totalGasto = obra.gastos.reduce((sum, g) => sum + parseFloat(String(g.valor)), 0);
      const totalOrcado = obra.orcamentos.reduce((sum, o) => {
        const totalItem = o.itens.reduce(
          (s, i) => s + parseFloat(String(i.quantidade)) * parseFloat(String(i.valorUnitario)),
          0,
        );
        return sum + totalItem;
      }, 0);

      const { gastos, orcamentos, ...obraRecord } = obra;
      return {
        ...obraRecord,
        valorContrato: obraRecord.valorContrato ? String(obraRecord.valorContrato) : null,
        ...calcularResumo(obraRecord.valorContrato ? String(obraRecord.valorContrato) : null, totalGasto, totalOrcado),
      };
    });
  }

  async findById(id: string, workspaceId: string): Promise<ObraComResumo | null> {
    const obra = await prisma.obra.findFirst({
      where: { id, workspaceId, archivedAt: null },
      include: {
        gastos: { select: { valor: true } },
        orcamentos: {
          where: { status: "APROVADO" },
          include: { itens: { select: { quantidade: true, valorUnitario: true } } },
        },
      },
    });

    if (!obra) return null;

    const totalGasto = obra.gastos.reduce((sum, g) => sum + parseFloat(String(g.valor)), 0);
    const totalOrcado = obra.orcamentos.reduce((sum, o) => {
      const totalItem = o.itens.reduce(
        (s, i) => s + parseFloat(String(i.quantidade)) * parseFloat(String(i.valorUnitario)),
        0,
      );
      return sum + totalItem;
    }, 0);

    const { gastos, orcamentos, ...obraRecord } = obra;
    return {
      ...obraRecord,
      valorContrato: obraRecord.valorContrato ? String(obraRecord.valorContrato) : null,
      ...calcularResumo(obraRecord.valorContrato ? String(obraRecord.valorContrato) : null, totalGasto, totalOrcado),
    };
  }

  async create(workspaceId: string, data: CreateObraData): Promise<ObraRecord> {
    const obra = await prisma.obra.create({
      data: {
        workspaceId,
        nome: data.nome,
        cliente: data.cliente,
        endereco: data.endereco,
        valorContrato: data.valorContrato,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
    });
    return { ...obra, valorContrato: obra.valorContrato ? String(obra.valorContrato) : null };
  }

  async update(id: string, workspaceId: string, data: UpdateObraData): Promise<ObraRecord | null> {
    const existing = await prisma.obra.findFirst({ where: { id, workspaceId, archivedAt: null } });
    if (!existing) return null;

    const obra = await prisma.obra.update({
      where: { id },
      data: {
        nome: data.nome,
        cliente: data.cliente,
        endereco: data.endereco,
        valorContrato: data.valorContrato,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
    });
    return { ...obra, valorContrato: obra.valorContrato ? String(obra.valorContrato) : null };
  }

  async updateStatus(id: string, workspaceId: string, status: ObraStatus): Promise<ObraRecord | null> {
    const existing = await prisma.obra.findFirst({ where: { id, workspaceId, archivedAt: null } });
    if (!existing) return null;

    const obra = await prisma.obra.update({ where: { id }, data: { status } });
    return { ...obra, valorContrato: obra.valorContrato ? String(obra.valorContrato) : null };
  }

  async archive(id: string, workspaceId: string): Promise<ObraRecord | null> {
    const existing = await prisma.obra.findFirst({ where: { id, workspaceId, archivedAt: null } });
    if (!existing) return null;

    const obra = await prisma.obra.update({ where: { id }, data: { archivedAt: new Date() } });
    return { ...obra, valorContrato: obra.valorContrato ? String(obra.valorContrato) : null };
  }
}
