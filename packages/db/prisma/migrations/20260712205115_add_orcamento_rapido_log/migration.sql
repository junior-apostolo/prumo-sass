-- CreateTable
CREATE TABLE "OrcamentoRapidoLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "oficio" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrcamentoRapidoLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrcamentoRapidoLog" ADD CONSTRAINT "OrcamentoRapidoLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
