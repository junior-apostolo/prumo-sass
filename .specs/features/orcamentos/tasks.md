# M3 — Orçamentos: Tasks

**Spec**: `.specs/features/orcamentos/spec.md`
**Status**: In Progress — Fase 3b concluída
**Gate rápido (API)**: `npm run type-check --workspace=apps/api`
**Gate rápido (Web)**: `cd apps/web && npx tsc --noEmit`

---

## Progresso

| Task | Descrição | Status |
|------|-----------|--------|
| T-00 | Setup @react-pdf/renderer + tipos compartilhados demo | ✅ DONE |
| T-01 | PDF template público (`orcamento-demo.tsx`) | ✅ DONE |
| T-02 | Endpoint `POST /demo/pdf` público | ✅ DONE |
| T-03 | Wizard `/demo` — 5 passos + preview + hero CTA | ✅ DONE |
| T-04 | Interfaces e tipos de orçamento (`orcamento.interfaces.ts`) | ✅ DONE |
| T-05 | Schemas Zod + Fastify para orçamento (`orcamento.schemas.ts`) | ✅ DONE |
| T-06 | `OrcamentoRepository` — queries Prisma | ✅ DONE |
| T-07 | `OrcamentoService` — regras de negócio | ✅ DONE |
| T-08 | Rotas `GET + POST /obras/:obraId/orcamentos` | ✅ DONE |
| T-09 | Rotas `GET + PUT /orcamentos/:id` | ✅ DONE |
| T-10 | Rota `PUT /orcamentos/:id/itens` (upsert array) | ✅ DONE |
| T-11 | Rotas `POST .../duplicar` + `PATCH .../status` | ✅ DONE |
| T-12 | PDF autenticado + rota `GET /orcamentos/:id/pdf` | ✅ DONE |
| T-13 | Registrar rotas em `app.ts` | ✅ DONE |
| T-14 | API client frontend (`apps/web/lib/orcamentos.ts`) | ⬜ TODO |
| T-15 | Componente `OrcamentoStatusBadge` | ⬜ TODO |
| T-16 | Seção de orçamentos na página de detalhe da obra | ⬜ TODO |
| T-17 | Página criar orçamento (`/dashboard/obras/[id]/orcamentos/nova`) | ⬜ TODO |
| T-18 | Editor de orçamento (`/dashboard/orcamentos/[id]`) | ⬜ TODO |
| T-19 | Auto-save com debounce 1s no editor | ⬜ TODO |
| T-20 | Reordenação com `@dnd-kit/sortable` | ⬜ TODO |
| T-21 | Botão "Gerar PDF" + download no detalhe do orçamento | ⬜ TODO |

---

## Plano de Execução

### Fase 3a — Demo pública (CONCLUÍDA)

```
T-00 → T-01 → T-02 → T-03
```

### Fase 3b — API autenticada (Sequential → Parallel → Sequential)

```
T-04 → T-05 → T-06 → T-07 ──┬── T-08 [P] ──┐
                              ├── T-09 [P] ──┤
                              ├── T-10 [P] ──┼──→ T-13
                              ├── T-11 [P] ──┤
                              └── T-12 [P] ──┘
```

### Fase 3c — Frontend dashboard (Sequential → Parallel → Sequential)

```
T-14 → T-15 ──┬── T-16 [P] ──┐
               ├── T-17 [P] ──┼──→ T-18
               └─────────────┘
```

### Fase 3d — Polish (Sequential)

```
T-18 → T-19 → T-20 → T-21
```

---

## Tasks Concluídas (Fase 3a)

### T-00: Setup @react-pdf/renderer + tipos demo ✅ DONE

**O que foi feito**:
- `@react-pdf/renderer@^4.3.0` e `react@^19.0.0` adicionados em `apps/api/package.json`
- `"jsx": "react-jsx"` adicionado em `apps/api/tsconfig.json`
- `TipoOficio`, `DemoItemServico`, `DemoVerba`, `DemoWizardPayload` exportados de `packages/shared/src/index.ts`
- Alinhamento React 19 no monorepo (AD-011)

**Req**: RF-20

---

### T-01: PDF template público ✅ DONE

**O que foi feito**: `apps/api/src/pdf/orcamento-demo.tsx`
- Template React com `@react-pdf/renderer` (Document, Page, View, Text, StyleSheet)
- Cabeçalho PRUMO + número de orçamento + data/validade
- Duas colunas: prestador | cliente
- Tabela de itens com zebra de linhas (modo wizard) ou bloco de preço fechado (modo verba)
- Rodapé watermark azul: "Gerado com PRUMO — Crie sua conta grátis"
- `renderOrcamentoDemoToBuffer(payload)` exportada (chama componente diretamente para evitar null props)

**Req**: RF-19, RF-20

---

### T-02: Endpoint POST /demo/pdf público ✅ DONE

**O que foi feito**: `apps/api/src/routes/demo.ts`
- `POST /demo/pdf` sem `authenticate` middleware
- Validação Zod com `demoPayloadSchema`
- Retorna buffer PDF com `Content-Type: application/pdf`
- Suporta `modoServico: "wizard"` (itens) e `"verba"` (preço fechado)

**Req**: RF-19, RF-20

---

### T-03: Wizard /demo — frontend completo ✅ DONE

**O que foi feito**:
- `apps/web/app/demo/page.tsx` — rota pública com header mínimo
- `apps/web/components/demo/wizard.tsx` — container com progress indicator e navegação
- `apps/web/components/demo/step-oficio.tsx` — seleção por cards (5 ofícios)
- `apps/web/components/demo/step-prestador.tsx` — nome, CPF/CNPJ, telefone
- `apps/web/components/demo/step-cliente.tsx` — nome e endereço
- `apps/web/components/demo/step-servicos.tsx` — itens por ofício + toggle verba
- `apps/web/components/demo/step-condicoes.tsx` — pagamento, validade, observações
- `apps/web/components/demo/preview.tsx` — resumo + download + CTA cadastro
- `apps/web/lib/demo-precos.ts` — preços sugeridos por ofício
- `apps/web/lib/demo-api.ts` — fetch + downloadBlob
- `apps/web/middleware.ts` — `/demo` adicionado como rota pública
- `apps/web/components/landing/hero.tsx` — CTA alterado para "Gerar orçamento grátis → /demo"

**Req**: RF-19, RF-20

---

## Tasks Pendentes

### T-04: Interfaces e tipos de orçamento

**O que**: Criar `apps/api/src/interfaces/orcamento.interfaces.ts` com todos os tipos internos da API.
**Onde**: `apps/api/src/interfaces/orcamento.interfaces.ts`
**Depende de**: T-00 (tipos compartilhados já existem em packages/shared)
**Reutiliza**: padrão de `obra.interfaces.ts`
**Req**: RF-13, RF-14, RF-15, RF-16, RF-18, RF-21

**Done when**:
- [ ] `OrcamentoStatus`, `ItemCategoria` reexportados de shared (não duplicar)
- [ ] `OrcamentoRecord` com todos os campos da tabela Prisma
- [ ] `OrcamentoComItens` com `itens: ItemOrcamentoRecord[]`
- [ ] `CreateOrcamentoData`, `UpdateOrcamentoData`, `UpsertItemData[]`
- [ ] `IOrcamentoRepository` com todos os métodos necessários para os 8 endpoints
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add orcamento interfaces and internal types`

---

### T-05: Schemas Zod + Fastify para orçamento

**O que**: Criar `apps/api/src/schemas/orcamento.schemas.ts` com validações e schemas de documentação.
**Onde**: `apps/api/src/schemas/orcamento.schemas.ts`
**Depende de**: T-04
**Reutiliza**: padrão de `obra.schemas.ts`
**Req**: RF-14, RF-16

**Done when**:
- [ ] `createOrcamentoSchema` — titulo (obrigatório), validadeAt (date), observacoes (opcional)
- [ ] `updateOrcamentoSchema` — partial do createOrcamentoSchema
- [ ] `upsertItensSchema` — array de items com id? (upsert), descricao, categoria, unidade, quantidade, valorUnitario, ordem
- [ ] `updateOrcamentoStatusSchema` — enum OrcamentoStatus
- [ ] `orcamentoSwaggerSchema` e `orcamentoComItensSwaggerSchema` para documentação Fastify
- [ ] Campos de data seguem AD-010: `format: "date"` no Fastify body, `z.coerce.date()` no Zod
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add Zod schemas and Fastify body schemas`

---

### T-06: OrcamentoRepository

**O que**: Implementar `apps/api/src/repositories/orcamento.repository.ts` com todas as queries Prisma.
**Onde**: `apps/api/src/repositories/orcamento.repository.ts`
**Depende de**: T-04, T-05
**Reutiliza**: padrão de `obra.repository.ts`, `packages/db` Prisma client
**Req**: RF-13, RF-15, RF-16, RF-18

**Done when**:
- [ ] Implementa `IOrcamentoRepository`
- [ ] `findAllByObra(obraId, workspaceId)` — valida que a obra pertence ao workspace
- [ ] `findById(id, workspaceId)` — join com obra para validar workspace isolation
- [ ] `create(obraId, workspaceId, data)` — cria orçamento e valida que obra existe no workspace
- [ ] `update(id, workspaceId, data)` — atualiza cabeçalho
- [ ] `upsertItens(orcamentoId, workspaceId, itens[])` — em transação: deleta removidos, cria/atualiza restantes, atualiza campo `ordem`
- [ ] `duplicar(id, workspaceId)` — copia orçamento + todos os itens com `versao + 1`
- [ ] `updateStatus(id, workspaceId, status)` — atualiza apenas status
- [ ] `findByIdComWorkspace(id, workspaceId)` — retorna orçamento + itens + dados da obra + dados do workspace (para PDF)
- [ ] Todos os métodos filtram por `workspaceId` via join com `obra` (nunca confiar só no ID)
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add OrcamentoRepository with Prisma queries`

---

### T-07: OrcamentoService

**O que**: Implementar `apps/api/src/services/orcamento.service.ts` com regras de negócio.
**Onde**: `apps/api/src/services/orcamento.service.ts`
**Depende de**: T-06
**Reutiliza**: padrão de `obra.service.ts`
**Req**: RF-13, RF-14, RF-15, RF-18, RF-21

**Done when**:
- [ ] `OrcamentoNotFoundError` exportado para uso nas rotas
- [ ] `list(obraId, workspaceId)` — delega ao repository
- [ ] `get(id, workspaceId)` — lança `OrcamentoNotFoundError` se não encontrar
- [ ] `create(obraId, workspaceId, data)` — lança erro se obra não pertence ao workspace
- [ ] `update(id, workspaceId, data)` — lança `OrcamentoNotFoundError`
- [ ] `upsertItens(id, workspaceId, itens[])` — garante que orçamento existe antes de upsert
- [ ] `duplicar(id, workspaceId)` — retorna novo orçamento com `versao + 1`
- [ ] `updateStatus(id, workspaceId, status)` — sem validação de transição de estado (qualquer → qualquer)
- [ ] `getParaPdf(id, workspaceId)` — retorna orçamento + obra + workspace para renderização do PDF
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add OrcamentoService with business logic`

---

### T-08: Rotas GET + POST /obras/:obraId/orcamentos [P]

**O que**: Criar rotas de listagem e criação no arquivo `apps/api/src/routes/orcamentos.ts`.
**Onde**: `apps/api/src/routes/orcamentos.ts` (novo arquivo)
**Depende de**: T-07
**Reutiliza**: padrão de `obras.ts`
**Req**: RF-13, RF-14

**Done when**:
- [ ] `GET /obras/:obraId/orcamentos` — lista orçamentos da obra (com `authenticate`)
- [ ] `POST /obras/:obraId/orcamentos` — cria orçamento vinculado à obra
- [ ] Ambos validam `workspaceId` via `req.user.workspaceId`
- [ ] Schemas Fastify declarados para documentação Swagger
- [ ] `ObraNotFoundError` e `OrcamentoNotFoundError` retornam 404
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check

---

### T-09: Rotas GET + PUT /orcamentos/:id [P]

**O que**: Adicionar rotas de detalhe e edição ao arquivo `apps/api/src/routes/orcamentos.ts`.
**Onde**: `apps/api/src/routes/orcamentos.ts`
**Depende de**: T-07
**Reutiliza**: padrão existente no mesmo arquivo (T-08 paralelo — adicionar em bloco separado)
**Req**: RF-14

**Done when**:
- [ ] `GET /orcamentos/:id` — retorna orçamento com `itens` incluídos
- [ ] `PUT /orcamentos/:id` — atualiza cabeçalho (titulo, validadeAt, observacoes)
- [ ] Ambos com `authenticate` e validação de `workspaceId`
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check

---

### T-10: Rota PUT /orcamentos/:id/itens [P]

**O que**: Adicionar rota de upsert de itens ao arquivo `apps/api/src/routes/orcamentos.ts`.
**Onde**: `apps/api/src/routes/orcamentos.ts`
**Depende de**: T-07
**Req**: RF-15, RF-16

**Done when**:
- [ ] `PUT /orcamentos/:id/itens` — recebe array completo; deleta removidos, cria/atualiza demais
- [ ] Valida cada item com `upsertItensSchema`
- [ ] Retorna orçamento com `itens` atualizados
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check

---

### T-11: Rotas POST /duplicar + PATCH /status [P]

**O que**: Adicionar rotas de duplicação e alteração de status ao `apps/api/src/routes/orcamentos.ts`.
**Onde**: `apps/api/src/routes/orcamentos.ts`
**Depende de**: T-07
**Req**: RF-18, RF-21

**Done when**:
- [ ] `POST /orcamentos/:id/duplicar` — cria cópia com `versao + 1`; retorna novo orçamento
- [ ] `PATCH /orcamentos/:id/status` — aceita `{ status: OrcamentoStatus }`
- [ ] Ambos com `authenticate` e validação de `workspaceId`
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check

---

### T-12: PDF autenticado + rota GET /orcamentos/:id/pdf [P]

**O que**: Criar template PDF enriquecido com dados do workspace e rota autenticada de download.
**Onde**:
  - `apps/api/src/pdf/orcamento.tsx` (novo template, separado do demo)
  - `apps/api/src/routes/orcamentos.ts` (adicionar rota)
**Depende de**: T-07 (precisa de `getParaPdf`)
**Reutiliza**: estrutura de `orcamento-demo.tsx`
**Req**: RF-19, RF-20

**Done when**:
- [ ] Novo template `orcamento.tsx` recebe: `{ orcamento, itens, obra, workspace }`
- [ ] Cabeçalho: logo do workspace (via `Image` do react-pdf, URL do `workspace.logoUrl`) com fallback para nome textual
- [ ] Dados do workspace no rodapé: nome, CNPJ, telefone, email
- [ ] Subtotais por `ItemCategoria` antes do total geral
- [ ] Watermark removida (PDF de usuário autenticado, não demo)
- [ ] Campo para assinatura do cliente no rodapé
- [ ] `GET /orcamentos/:id/pdf` — chama `getParaPdf`, renderiza e retorna buffer
- [ ] `renderOrcamentoToBuffer(data)` exportada com mesmo padrão da demo
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add authenticated PDF template and /pdf route`

---

### T-13: Registrar rotas de orçamento em app.ts

**O que**: Importar e registrar `orcamentosRoutes` em `apps/api/src/app.ts`.
**Onde**: `apps/api/src/app.ts`
**Depende de**: T-08, T-09, T-10, T-11, T-12 (todas as rotas devem estar no mesmo arquivo)
**Req**: RF-13 a RF-21

**Done when**:
- [ ] `orcamentosRoutes` importado e registrado com `app.register()`
- [ ] Tag `"Orçamentos"` adicionada ao array de tags do Swagger
- [ ] `GET /docs` reflete todos os endpoints de orçamento
- [ ] Servidor sobe sem erros: `curl http://localhost:3001/health`
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): register orcamentos routes and complete 3b API layer`

---

### T-14: API client frontend

**O que**: Criar `apps/web/lib/orcamentos.ts` com funções tipadas para todos os endpoints.
**Onde**: `apps/web/lib/orcamentos.ts`
**Depende de**: T-13 (API precisa estar disponível)
**Reutiliza**: padrão de `apps/web/lib/obras.ts`
**Req**: RF-13, RF-14, RF-15, RF-18, RF-21

**Done when**:
- [ ] `orcamentosApi.list(obraId)` → `GET /obras/:obraId/orcamentos`
- [ ] `orcamentosApi.create(obraId, data)` → `POST /obras/:obraId/orcamentos`
- [ ] `orcamentosApi.get(id)` → `GET /orcamentos/:id`
- [ ] `orcamentosApi.update(id, data)` → `PUT /orcamentos/:id`
- [ ] `orcamentosApi.upsertItens(id, itens[])` → `PUT /orcamentos/:id/itens`
- [ ] `orcamentosApi.duplicar(id)` → `POST /orcamentos/:id/duplicar`
- [ ] `orcamentosApi.updateStatus(id, status)` → `PATCH /orcamentos/:id/status`
- [ ] `orcamentosApi.downloadPdf(id)` → `GET /orcamentos/:id/pdf` — retorna `Blob`
- [ ] Tipos importados de `@enge-pro/shared`
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check

---

### T-15: Componente OrcamentoStatusBadge

**O que**: Criar `apps/web/components/orcamentos/orcamento-status-badge.tsx`.
**Onde**: `apps/web/components/orcamentos/orcamento-status-badge.tsx`
**Depende de**: T-14
**Reutiliza**: padrão de `components/obras/obra-status-badge.tsx`
**Req**: RF-21

**Done when**:
- [ ] Aceita `status: OrcamentoStatus` como prop
- [ ] Cores por status: RASCUNHO (cinza), ENVIADO (azul), APROVADO (verde), RECUSADO (vermelho)
- [ ] Exportado como componente reutilizável
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check

---

### T-16: Seção de orçamentos na página de detalhe da obra [P]

**O que**: Adicionar seção "Orçamentos" abaixo dos cards financeiros em `apps/web/app/dashboard/obras/[id]/page.tsx`.
**Onde**: `apps/web/app/dashboard/obras/[id]/page.tsx`
**Depende de**: T-14, T-15
**Req**: RF-13, RF-21

**Done when**:
- [ ] Lista orçamentos da obra via `orcamentosApi.list(obraId)` ao carregar a página
- [ ] Exibe: título, versão, status badge, data de validade, total de itens (ou "—")
- [ ] Botão "Novo orçamento" que navega para `/dashboard/obras/[id]/orcamentos/nova`
- [ ] Clique na linha navega para `/dashboard/orcamentos/[id]`
- [ ] Estado vazio: "Nenhum orçamento ainda. Crie o primeiro."
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check

---

### T-17: Página criar orçamento [P]

**O que**: Criar `apps/web/app/dashboard/obras/[id]/orcamentos/nova/page.tsx`.
**Onde**: `apps/web/app/dashboard/obras/[id]/orcamentos/nova/page.tsx`
**Depende de**: T-14, T-15
**Req**: RF-13, RF-14

**Done when**:
- [ ] Formulário com campos: título (obrigatório), validade (date), observações
- [ ] `obraId` lido dos params da URL
- [ ] Submit chama `orcamentosApi.create(obraId, data)`
- [ ] Ao criar com sucesso, redireciona para `/dashboard/orcamentos/[newId]`
- [ ] Botão "Cancelar" volta para a página da obra
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add create orcamento page`

---

### T-18: Editor de orçamento (`/dashboard/orcamentos/[id]`)

**O que**: Criar página completa de visualização e edição de orçamento com tabela de itens.
**Onde**: `apps/web/app/dashboard/orcamentos/[id]/page.tsx`
**Depende de**: T-16, T-17 (navegação parte dessas páginas), T-14, T-15
**Req**: RF-14, RF-15, RF-16, RF-17, RF-21

**Done when**:
- [ ] Carrega orçamento via `orcamentosApi.get(id)` com itens incluídos
- [ ] Cabeçalho editável: título, validade, observações (salvo via `orcamentosApi.update`)
- [ ] `OrcamentoStatusBadge` + dropdown para alterar status via `orcamentosApi.updateStatus`
- [ ] Tabela de itens com colunas: descrição, categoria, unidade, quantidade, valor unitário, total calculado
- [ ] Botão "Adicionar item" insere nova linha editável
- [ ] Botão "Remover" por linha
- [ ] Subtotal por categoria + total geral calculados em tempo real no cliente
- [ ] Indicador de estado "Salvando…" / "Salvo" (preparado para T-19)
- [ ] Botão "Gerar PDF" (preparado para T-21)
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add orcamento editor page with items table`

---

### T-19: Auto-save com debounce 1s

**O que**: Implementar auto-save na tabela de itens do editor de orçamento.
**Onde**: `apps/web/app/dashboard/orcamentos/[id]/page.tsx`
**Depende de**: T-18
**Req**: RF-15, RF-16

**Done when**:
- [ ] Hook `useDebounce` ou lógica inline com `setTimeout`/`clearTimeout`
- [ ] Qualquer edição nos itens (quantidade, valor, descrição) dispara timer de 1s
- [ ] Ao expirar, chama `orcamentosApi.upsertItens(id, itensAtuais)`
- [ ] Indicador: "Salvando…" durante o call, "Salvo ✓" após sucesso, "Erro ao salvar" em falha
- [ ] Timer é cancelado se o usuário editar novamente antes de expirar (debounce correto)
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check

---

### T-20: Reordenação com @dnd-kit/sortable

**O que**: Adicionar drag-and-drop nas linhas da tabela de itens do editor.
**Onde**: `apps/web/app/dashboard/orcamentos/[id]/page.tsx`
**Depende de**: T-19 (auto-save deve persistir `ordem` ao reordenar)
**Req**: RF-15

**Done when**:
- [ ] `@dnd-kit/core` e `@dnd-kit/sortable` instalados em `apps/web`
- [ ] `SortableContext` envolve as linhas da tabela
- [ ] Handle de drag visível (ícone ⠿ ou similar) na primeira coluna
- [ ] Ao soltar, o campo `ordem` de cada item é atualizado no estado local
- [ ] Mudança de ordem dispara o auto-save (T-19) — `upsertItens` persiste nova ordem
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add auto-save debounce and dnd-kit reordering`

---

### T-21: Botão "Gerar PDF" + download no editor

**O que**: Conectar o botão de PDF do editor ao endpoint autenticado.
**Onde**: `apps/web/app/dashboard/orcamentos/[id]/page.tsx`
**Depende de**: T-18 (botão preparado), T-12 (endpoint PDF pronto)
**Req**: RF-19, RF-20

**Done when**:
- [ ] Clique em "Gerar PDF" chama `orcamentosApi.downloadPdf(id)` e recebe `Blob`
- [ ] `downloadBlob(blob, "orcamento-[titulo].pdf")` inicia download automático
- [ ] Estado de loading: "Gerando PDF…" desabilita o botão durante o call
- [ ] Toast de erro via `sonner` se o endpoint falhar
- [ ] PDF baixado contém logo do workspace (se configurado), dados da obra e todos os itens
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests**: none
**Gate**: type-check
**Commit**: `feat(orcamentos): add PDF download to orcamento editor — completes M3`

---

## Mapa de Paralelismo

```
FASE 3b (API):
  T-04 ──→ T-05 ──→ T-06 ──→ T-07 ──┬── T-08 [P] ──┐
                                      ├── T-09 [P] ──┤
                                      ├── T-10 [P] ──┼──→ T-13
                                      ├── T-11 [P] ──┤
                                      └── T-12 [P] ──┘

FASE 3c (Frontend):
  T-14 ──→ T-15 ──┬── T-16 [P] ──┐
                   └── T-17 [P] ──┴──→ T-18

FASE 3d (Polish):
  T-18 ──→ T-19 ──→ T-20 ──→ T-21
```

---

## Verificação de Dependências

| Task | Depende de (definição) | Diagrama mostra | Status |
|------|------------------------|-----------------|--------|
| T-05 | T-04 | T-04 → T-05 | ✅ |
| T-06 | T-04, T-05 | T-05 → T-06 | ✅ |
| T-07 | T-06 | T-06 → T-07 | ✅ |
| T-08 | T-07 | T-07 → T-08 | ✅ |
| T-09 | T-07 | T-07 → T-09 | ✅ |
| T-10 | T-07 | T-07 → T-10 | ✅ |
| T-11 | T-07 | T-07 → T-11 | ✅ |
| T-12 | T-07 | T-07 → T-12 | ✅ |
| T-13 | T-08,09,10,11,12 | todas → T-13 | ✅ |
| T-14 | T-13 | T-13 → T-14 | ✅ |
| T-15 | T-14 | T-14 → T-15 | ✅ |
| T-16 | T-14, T-15 | T-15 → T-16 | ✅ |
| T-17 | T-14, T-15 | T-15 → T-17 | ✅ |
| T-18 | T-16, T-17 | T-16,T-17 → T-18 | ✅ |
| T-19 | T-18 | T-18 → T-19 | ✅ |
| T-20 | T-19 | T-19 → T-20 | ✅ |
| T-21 | T-18, T-12 | T-20 → T-21 | ✅ |

---

## Rastreabilidade de Requisitos

| Req | Descrição | Tasks |
|-----|-----------|-------|
| RF-13 | Criar orçamento vinculado a obra | T-06, T-07, T-08, T-16, T-17 |
| RF-14 | Orçamento: título, status, validade, observações | T-04, T-05, T-08, T-09, T-17, T-18 |
| RF-15 | Adicionar, editar, reordenar, remover itens | T-06, T-10, T-18, T-19, T-20 |
| RF-16 | Item: campos + total calculado automaticamente | T-05, T-06, T-10, T-18 |
| RF-17 | Subtotal por categoria + total em tempo real | T-18 |
| RF-18 | Duplicar orçamento (versão+1) | T-06, T-07, T-11 |
| RF-19 | PDF com logo, workspace, obra, itens, subtotais | T-12, T-21 |
| RF-20 | PDF gerado no servidor para download | T-12, T-21 (+ T-01/T-02 já feitos) |
| RF-21 | Alterar status manualmente | T-05, T-07, T-11, T-15, T-18 |
