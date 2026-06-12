# M2 Obras — Tasks

**Spec**: `.specs/features/obras/spec.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: API (Sequential, then partially parallel)

```
T1 ──→ T2 [P] ─┐
     └→ T3 [P] ─→ T4 ──→ T5 ──→ T6
```

### Phase 2: Frontend

```
T6 ──→ T7 ──→ T8 [P] ─┐
              T9 [P] ──┼──→ T10 [P] ─┐
                        └──→ T11 [P] ─┼──→ T12 ──→ T13
```

---

## Task Breakdown

### T1: Create Obra interfaces

**What**: Definir interfaces TypeScript para ObraRepository e ObraService — tipos de entrada/saída e retorno dos cálculos financeiros
**Where**: `apps/api/src/interfaces/obra.interfaces.ts`
**Depends on**: None
**Reuses**: `apps/api/src/interfaces/auth.interfaces.ts` — mesmo padrão de interface por camada

**Done when**:

- [ ] `ObraRecord` com todos os campos do modelo Prisma (id, workspaceId, nome, cliente, endereco, status, valorContrato, dataInicio, dataFim, archivedAt, createdAt, updatedAt)
- [ ] `ObraResumo` com campos calculados (totalOrcado, totalGasto, saldo, percentualConsumido)
- [ ] `ObraComResumo` = ObraRecord + ObraResumo
- [ ] `CreateObraData` e `UpdateObraData` como tipos de input
- [ ] `IObraRepository` com assinaturas: findAll, findById, create, update, updateStatus, archive
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add Obra interfaces`

---

### T2: Create Obra Zod schemas [P]

**What**: Schemas Zod para validação de input + schemas Swagger para documentação dos endpoints de obras
**Where**: `apps/api/src/schemas/obra.schemas.ts`
**Depends on**: T1
**Reuses**: `apps/api/src/schemas/auth.schemas.ts` — padrão de `errorSwaggerSchema` e schemas duplos (Zod + Swagger JSON)

**Done when**:

- [ ] `createObraSchema` — nome obrigatório, cliente/endereco/valorContrato/dataInicio/dataFim opcionais
- [ ] `updateObraSchema` — todos os campos opcionais (partial de createObraSchema)
- [ ] `updateStatusSchema` — enum ObraStatus (PLANEJAMENTO | EM_EXECUCAO | PAUSADA | CONCLUIDA)
- [ ] `obraSwaggerSchema` e `obraResumoSwaggerSchema` para response docs
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add Obra Zod schemas`

---

### T3: Create ObraRepository [P]

**What**: Classe que implementa `IObraRepository` com todas as queries Prisma, sempre filtrando por `workspaceId`
**Where**: `apps/api/src/repositories/obra.repository.ts`
**Depends on**: T1
**Reuses**: `apps/api/src/repositories/user.repository.ts` — padrão de classe + `prisma` from `../lib/prisma`

**Done when**:

- [ ] `findAll(workspaceId)` — retorna obras não arquivadas (archivedAt IS NULL) com `_count` de gastos e `_sum` de valor dos gastos via Prisma aggregate
- [ ] `findById(id, workspaceId)` — detalhe com gastos e orçamentos aprovados para calcular totais; retorna null se workspaceId não bate
- [ ] `create(workspaceId, data)` — cria obra
- [ ] `update(id, workspaceId, data)` — atualiza campos; retorna null se não encontrado no workspace
- [ ] `updateStatus(id, workspaceId, status)` — atualiza só o status
- [ ] `archive(id, workspaceId)` — seta `archivedAt = new Date()`; retorna null se não encontrado
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add ObraRepository`

---

### T4: Create ObraService

**What**: Classe com lógica de negócio de obras — orquestra repository e calcula campos derivados (totalOrcado, totalGasto, saldo, percentualConsumido)
**Where**: `apps/api/src/services/obra.service.ts`
**Depends on**: T3
**Reuses**: `apps/api/src/services/auth.service.ts` — padrão de custom error classes + DI via constructor

**Done when**:

- [ ] `ObraNotFoundError` e `WorkspaceAccessError` como custom error classes
- [ ] `list(workspaceId)` — retorna array de `ObraComResumo` com totais calculados
- [ ] `get(id, workspaceId)` — retorna `ObraComResumo` ou lança `ObraNotFoundError`
- [ ] `create(workspaceId, data)` — cria e retorna obra
- [ ] `update(id, workspaceId, data)` — atualiza ou lança `ObraNotFoundError`
- [ ] `updateStatus(id, workspaceId, status)` — muda status ou lança `ObraNotFoundError`
- [ ] `archive(id, workspaceId)` — arquiva ou lança `ObraNotFoundError`
- [ ] `percentualConsumido` = 0 quando `valorContrato` é null ou zero (evitar divisão por zero)
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add ObraService with financial calculations`

---

### T5: Create obras routes

**What**: Registrar os 6 endpoints de obras como plugin Fastify, com autenticação e validação Zod
**Where**: `apps/api/src/routes/obras.ts`
**Depends on**: T2, T4
**Reuses**: `apps/api/src/routes/auth.ts` — padrão de `buildXService()` factory + `export async function xRoutes(app)`

**Done when**:

- [ ] `GET /obras` — lista obras do workspace; resposta 200 com array
- [ ] `POST /obras` — cria obra; resposta 201; valida com `createObraSchema`
- [ ] `GET /obras/:id` — detalhe com resumo financeiro; 200 ou 404
- [ ] `PUT /obras/:id` — edita campos; valida com `updateObraSchema`; 200 ou 404
- [ ] `PATCH /obras/:id/status` — altera status; valida com `updateStatusSchema`; 200 ou 404
- [ ] `DELETE /obras/:id` — arquiva (soft delete); 204 ou 404
- [ ] Todos os endpoints com `preHandler: authenticate`
- [ ] Schemas Swagger com tags `["Obras"]`, summary e response types
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obras REST endpoints`

---

### T6: Register obras routes in app.ts

**What**: Importar e registrar `obrasRoutes` no Fastify; adicionar tag "Obras" à config do Swagger
**Where**: `apps/api/src/app.ts`
**Depends on**: T5
**Reuses**: padrão dos imports de `authRoutes` e `userRoutes` já existentes

**Done when**:

- [ ] Import de `obrasRoutes` adicionado
- [ ] `await app.register(obrasRoutes)` adicionado após `userRoutes`
- [ ] Tag `{ name: "Obras", description: "Gerenciamento de obras" }` adicionada ao Swagger
- [ ] TypeScript sem erros: `pnpm --filter api tsc --noEmit`
- [ ] `GET /health` continua respondendo 200 (smoke test manual)

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): register obras routes in Fastify app`

---

### T7: Create obras API client

**What**: Funções tipadas para chamar os endpoints de obras a partir do frontend
**Where**: `apps/web/lib/obras.ts`
**Depends on**: T6
**Reuses**: `apps/web/lib/api.ts` — cliente `api` já configurado com Bearer token e error handling

**Done when**:

- [ ] Tipo `Obra` e `ObraComResumo` definidos localmente (refletem resposta da API)
- [ ] Tipo `CreateObraInput` e `UpdateObraInput` para formulários
- [ ] `listObras()` → `GET /obras`
- [ ] `getObra(id)` → `GET /obras/:id`
- [ ] `createObra(data)` → `POST /obras`
- [ ] `updateObra(id, data)` → `PUT /obras/:id`
- [ ] `updateObraStatus(id, status)` → `PATCH /obras/:id/status`
- [ ] `archiveObra(id)` → `DELETE /obras/:id`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obras API client`

---

### T8: Create ObraStatusBadge component [P]

**What**: Componente reutilizável que renderiza o status da obra como badge colorido
**Where**: `apps/web/components/obras/obra-status-badge.tsx`
**Depends on**: T7
**Reuses**: `apps/web/components/ui/badge.tsx` — componente shadcn/ui Badge

**Done when**:

- [ ] Props: `status: ObraStatus` (import do tipo em `lib/obras.ts`)
- [ ] Mapeamento visual: PLANEJAMENTO → cinza, EM_EXECUCAO → azul, PAUSADA → amarelo, CONCLUIDA → verde
- [ ] Labels em pt-BR: "Planejamento", "Em execução", "Pausada", "Concluída"
- [ ] Usa `variant` do Badge ou `className` para cor
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add ObraStatusBadge component`

---

### T9: Create nova obra page [P]

**What**: Página com formulário para criar nova obra — campos nome (obrigatório), cliente, endereço, valor do contrato, data início e fim
**Where**: `apps/web/app/dashboard/obras/nova/page.tsx`
**Depends on**: T7
**Reuses**: padrão de form com `useState` + `api` client dos formulários de auth

**Done when**:

- [ ] Formulário com inputs: nome* (text), cliente (text), endereço (text), valorContrato (number), dataInicio (date), dataFim (date)
- [ ] Validação client-side: nome obrigatório antes de submeter
- [ ] `createObra()` chamado no submit; loading state durante request
- [ ] Sucesso → redirect para `/dashboard/obras`
- [ ] Erro → toast de erro via `sonner`
- [ ] Botão "Cancelar" volta para `/dashboard/obras`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add create obra page`

---

### T10: Create obras list page [P]

**What**: Página principal de obras — lista obras ativas com resumo financeiro e badge de alerta quando >80% do contrato consumido
**Where**: `apps/web/app/dashboard/obras/page.tsx`
**Depends on**: T7, T8
**Reuses**: `apps/web/components/ui/card.tsx`, `apps/web/components/ui/badge.tsx`, `ObraStatusBadge`

**Done when**:

- [ ] `listObras()` chamado no mount; loading skeleton durante fetch
- [ ] Card por obra com: nome, cliente (se existir), status badge, valor contratado, total gasto, % consumido
- [ ] Badge "Atenção" vermelho quando `percentualConsumido > 80`
- [ ] Empty state com texto e botão "Criar primeira obra" quando lista vazia
- [ ] Botão "Nova obra" → `/dashboard/obras/nova`
- [ ] Click no card → `/dashboard/obras/[id]`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obras list page`

---

### T11: Create obra detail page [P]

**What**: Tela de detalhe da obra com cards de resumo financeiro (contratado, total orçado, total gasto, saldo) e opções de editar, mudar status e arquivar
**Where**: `apps/web/app/dashboard/obras/[id]/page.tsx`
**Depends on**: T7, T8
**Reuses**: `apps/web/components/ui/card.tsx`, `apps/web/components/ui/alert-dialog.tsx`, `ObraStatusBadge`

**Done when**:

- [ ] `getObra(id)` chamado no mount; 404 → redirect para `/dashboard/obras`
- [ ] 4 cards financeiros: Valor Contratado, Total Orçado, Total Gasto, Saldo
- [ ] Badge de alerta "Atenção: >80% consumido" quando `percentualConsumido > 80`
- [ ] Header com nome da obra, status badge, botão "Editar" → `/dashboard/obras/[id]/editar`
- [ ] Select (ou dropdown) para alterar status com `updateObraStatus()`; atualiza UI após sucesso
- [ ] Botão "Arquivar" com `AlertDialog` de confirmação (RNF-11); após confirmar → `archiveObra()` → redirect para `/dashboard/obras`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obra detail page`

---

### T12: Create obra edit page

**What**: Formulário pré-preenchido para editar campos de uma obra existente
**Where**: `apps/web/app/dashboard/obras/[id]/editar/page.tsx`
**Depends on**: T11
**Reuses**: mesma estrutura de form da página nova (T9); `getObra()` para pré-preencher

**Done when**:

- [ ] `getObra(id)` no mount para pré-preencher campos
- [ ] Mesmos campos do formulário de criação, pré-preenchidos com dados atuais
- [ ] `updateObra(id, data)` no submit; loading state
- [ ] Sucesso → redirect para `/dashboard/obras/[id]`
- [ ] Erro → toast de erro
- [ ] Botão "Cancelar" volta para `/dashboard/obras/[id]`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obra edit page`

---

### T13: Update dashboard navigation

**What**: Adicionar link "Obras" na nav do dashboard layout; atualizar página home do dashboard para redirecionar para `/dashboard/obras`
**Where**: `apps/web/app/dashboard/layout.tsx` e `apps/web/app/dashboard/page.tsx`
**Depends on**: T10
**Reuses**: estrutura de nav existente no layout

**Done when**:

- [ ] Link "Obras" adicionado à nav com `href="/dashboard/obras"` e destaque quando rota ativa
- [ ] Dashboard home page (`/dashboard`) exibe acesso rápido ou redireciona para `/dashboard/obras`
- [ ] TypeScript sem erros: `pnpm --filter web tsc --noEmit`

**Tests**: none
**Gate**: build

**Commit**: `feat(obras): add obras nav link to dashboard layout`

---

## Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Obra interfaces | 1 arquivo, ~5 tipos | ✅ |
| T2: Obra schemas | 1 arquivo, Zod + Swagger | ✅ |
| T3: ObraRepository | 1 classe, 6 métodos | ✅ |
| T4: ObraService | 1 classe, 7 métodos + error classes | ✅ |
| T5: obras routes | 1 arquivo, 6 handlers (igual padrão auth.ts) | ✅ |
| T6: app.ts update | 3 linhas modificadas | ✅ |
| T7: lib/obras.ts | 1 arquivo, 6 funções + tipos | ✅ |
| T8: ObraStatusBadge | 1 componente | ✅ |
| T9: nova page | 1 page | ✅ |
| T10: list page | 1 page | ✅ |
| T11: detail page | 1 page | ✅ |
| T12: edit page | 1 page | ✅ |
| T13: nav update | 2 arquivos, ~5 linhas | ✅ |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
|------|-------------------|---------|--------|
| T1 | None | Start | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1 | T1 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T2, T4 | T2 → T5, T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T6 | T6 → T7 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T7 | T7 → T9 | ✅ |
| T10 | T7, T8 | T7 → T10, T8 → T10 | ✅ |
| T11 | T7, T8 | T7 → T11, T8 → T11 | ✅ |
| T12 | T11 | T11 → T12 | ✅ |
| T13 | T10 | T10 → T13 | ✅ |

## Test Co-location Validation

Sem TESTING.md no projeto. Todos os gates usam TypeScript (`tsc --noEmit`).

| Task | Layer | Tests | Gate |
|------|-------|-------|------|
| T1–T6 | API | none | build |
| T7–T13 | Frontend | none | build |
