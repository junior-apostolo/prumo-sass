-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ObraStatus" AS ENUM ('PLANEJAMENTO', 'EM_EXECUCAO', 'PAUSADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "OrcamentoStatus" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "ItemCategoria" AS ENUM ('MATERIAL', 'MAO_DE_OBRA', 'EQUIPAMENTO', 'SERVICO', 'OUTROS');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "cnpj" TEXT,
    "telefone" TEXT,
    "emailContato" TEXT,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cliente" TEXT,
    "endereco" TEXT,
    "status" "ObraStatus" NOT NULL DEFAULT 'PLANEJAMENTO',
    "valorContrato" DECIMAL(12,2),
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "status" "OrcamentoStatus" NOT NULL DEFAULT 'RASCUNHO',
    "observacoes" TEXT,
    "validadeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrcamento" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "ItemCategoria" NOT NULL DEFAULT 'OUTROS',
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "quantidade" DECIMAL(10,3) NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItemOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "ItemCategoria" NOT NULL DEFAULT 'OUTROS',
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedor" TEXT,
    "comprovante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
