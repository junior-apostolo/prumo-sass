# Design — Feedback pós-geração + Histórico do Orçamento Rápido

## Schema (Prisma)

Novo model, seguindo o padrão já usado em `Gasto` (workspace-scoped, sem soft delete — não há necessidade de editar/excluir nesta fase):

```prisma
model OrcamentoRapidoLog {
  id          String    @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  clienteNome String
  oficio      String
  valorTotal  Decimal   @db.Decimal(12, 2)
  createdAt   DateTime  @default(now())
}
```

`oficio` como `String` (não enum Prisma) — `TipoOficio` já existe só como union type em `packages/shared`, validado via Zod na rota. Criar um enum Prisma duplicado exigiria manter dois lugares sincronizados sem ganho real (não há query que filtre por ofício nesta fase).

Adicionar `orcamentoRapidoLogs OrcamentoRapidoLog[]` em `Workspace`.

## Backend (Fastify)

**Repository** — `apps/api/src/repositories/orcamento-rapido-log.repository.ts`:
- `create(data: { workspaceId, clienteNome, oficio, valorTotal }): Promise<OrcamentoRapidoLog>`
- `listRecent(workspaceId: string, limit = 10): Promise<OrcamentoRapidoLog[]>` — `orderBy: { createdAt: "desc" }, take: limit`

**Rota existente `apps/api/src/routes/orcamentos-rapido.ts`:**
- Após `renderOrcamentoRapidoToBuffer` ter sucesso (antes do `return reply...`), calcular `valorTotal` (mesma lógica do template: soma de itens ou valor de verba) e chamar `repository.create(...)` dentro de um `try/catch` que **não propaga erro** — se falhar, `app.log.error` e segue retornando o PDF normalmente (RF ORC-HIST-02.3).
- Novo endpoint `GET /orcamentos/rapido/historico` — autenticado, retorna `listRecent(req.user.workspaceId)`.

**Cálculo do total:** extrair a lógica de soma (`itens.reduce(...)` / `verba.valorTotal`) para uma função pura reaproveitada tanto pela rota quanto, se fizer sentido depois, pelo template — nesta fase, duplicar a expressão simples é aceitável (é uma linha), mas nomear claramente para não divergir da lógica do PDF.

## Frontend (Next.js)

**`apps/web/lib/orcamentos.ts`:**
- Adicionar tipo `OrcamentoRapidoLogItem = { id: string; clienteNome: string; oficio: TipoOficio; valorTotal: string; createdAt: string }`
- Adicionar `orcamentosApi.listarHistoricoRapido(): Promise<OrcamentoRapidoLogItem[]>`

**`apps/web/app/dashboard/orcamentos/rapido/page.tsx`:**
- Estado `historico: OrcamentoRapidoLogItem[]`, carregado via `useEffect` no mount (mesmo padrão de `obras/[id]/page.tsx` para `orcamentos`/`gastos`: falha silenciosa, não bloqueia a tela)
- Após sucesso em `handleGerar` e `handleEnviarWhatsApp` (share completo OU fallback wa.me aberto — não quando o usuário cancela o share sheet): toast de sucesso, reset de todos os estados do formulário (`oficio`, `servicos`, `clienteNome`, `clienteEndereco`, `clienteTelefone`, `condicoes`, `generatedFile`), e refetch do histórico (ou prepend otimista do novo item)
- Nova seção abaixo da barra fixa (ou antes dela, como bloco normal de conteúdo) listando os últimos orçamentos: nome do cliente (truncado), label do ofício (reaproveitar/mapear `OFICIO_LABELS` — hoje só existe dentro de `orcamento-demo.tsx` no backend; criar um mapa equivalente no frontend, já que é só apresentação), valor formatado, data em pt-BR

## Migration

Rodar `npx prisma migrate dev --name add_orcamento_rapido_log` em `packages/db` (Postgres local já está rodando via docker-compose — confirmado ativo).

## Atualização de specs existentes

Ao final, atualizar `.specs/features/orcamento-rapido/spec.md`:
- Seção "Fora do Escopo" — remover/anotar que "Histórico de orçamentos rápidos gerados" deixou de ser fora de escopo (superado por esta feature)
- Deixar claro que o PDF em si e os itens continuam transientes — só o registro-resumo é persistido
