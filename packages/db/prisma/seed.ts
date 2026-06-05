import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "seed-workspace" },
    update: {},
    create: {
      id: "seed-workspace",
      name: "Construtora Dev",
      cnpj: "00.000.000/0001-00",
      telefone: "(11) 99999-9999",
      emailContato: "contato@construtora.dev",
      endereco: "Rua das Obras, 123 - São Paulo/SP",
    },
  });

  // User (senha: "senha123")
  const passwordHash = createHash("sha256").update("senha123").digest("hex");
  const user = await prisma.user.upsert({
    where: { email: "dev@construtora.dev" },
    update: {},
    create: {
      email: "dev@construtora.dev",
      name: "Dev User",
      passwordHash,
      workspaceId: workspace.id,
    },
  });

  // Obra
  const obra = await prisma.obra.upsert({
    where: { id: "seed-obra" },
    update: {},
    create: {
      id: "seed-obra",
      workspaceId: workspace.id,
      nome: "Residência Silva",
      cliente: "João Silva",
      endereco: "Rua das Flores, 456 - São Paulo/SP",
      status: "EM_EXECUCAO",
      valorContrato: 150000,
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-12-31"),
    },
  });

  // Orçamento
  const orcamento = await prisma.orcamento.upsert({
    where: { id: "seed-orcamento" },
    update: {},
    create: {
      id: "seed-orcamento",
      obraId: obra.id,
      titulo: "Orçamento Inicial - Fundação e Estrutura",
      status: "APROVADO",
      observacoes: "Inclui materiais e mão de obra para fundação.",
      validadeAt: new Date("2026-12-31"),
    },
  });

  // Itens do orçamento
  await prisma.itemOrcamento.createMany({
    skipDuplicates: true,
    data: [
      {
        orcamentoId: orcamento.id,
        descricao: "Cimento CP-II 50kg",
        categoria: "MATERIAL",
        unidade: "sc",
        quantidade: 200,
        valorUnitario: 45.0,
        ordem: 0,
      },
      {
        orcamentoId: orcamento.id,
        descricao: "Aço CA-50 10mm",
        categoria: "MATERIAL",
        unidade: "kg",
        quantidade: 1500,
        valorUnitario: 8.5,
        ordem: 1,
      },
      {
        orcamentoId: orcamento.id,
        descricao: "Pedreiro + servente (equipe)",
        categoria: "MAO_DE_OBRA",
        unidade: "diária",
        quantidade: 30,
        valorUnitario: 450.0,
        ordem: 2,
      },
    ],
  });

  // Gastos
  await prisma.gasto.createMany({
    skipDuplicates: false,
    data: [
      {
        obraId: obra.id,
        descricao: "Compra de cimento - Lote 1",
        categoria: "MATERIAL",
        valor: 4500.0,
        data: new Date("2026-02-10"),
        fornecedor: "Material Forte LTDA",
      },
      {
        obraId: obra.id,
        descricao: "Mão de obra - semana 1",
        categoria: "MAO_DE_OBRA",
        valor: 2250.0,
        data: new Date("2026-02-15"),
        fornecedor: "Equipe Pedreiro José",
      },
      {
        obraId: obra.id,
        descricao: "Aluguel de betoneira",
        categoria: "EQUIPAMENTO",
        valor: 800.0,
        data: new Date("2026-02-20"),
        fornecedor: "Locadora de Equipamentos ABC",
      },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log(`   Workspace: ${workspace.name}`);
  console.log(`   Usuário:   ${user.email} / senha123`);
  console.log(`   Obra:      ${obra.nome}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
