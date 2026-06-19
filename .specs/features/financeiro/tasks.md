# Tasks — M4 Controle Financeiro

**Status:** IN PROGRESS
**Spec:** spec.md
**Started:** 2026-06-19

---

## Fase A — API Stack

### T-M4-01 · interfaces/gasto.interfaces.ts
**What:** Tipos TypeScript para Gasto: `GastoRecord`, `CreateGastoData`, `UpdateGastoData`, `ResumoFinanceiro`, `IGastoRepository`
**Where:** `apps/api/src/interfaces/gasto.interfaces.ts`
**Done when:** Tipos completos cobrindo todos os campos do model Gasto + resumo financeiro (porCategoria, porMes)
**Status:** DONE

### T-M4-02 · schemas/gasto.schemas.ts
**What:** Zod schemas para validação + Swagger schemas para documentação
**Where:** `apps/api/src/schemas/gasto.schemas.ts`
**Done when:** `createGastoSchema`, `updateGastoSchema`, `gastoSwaggerSchema`, `filtrosGastoSchema`
**Status:** DONE

### T-M4-03 · repositories/gasto.repository.ts
**What:** CRUD completo + agregações (sumByCategoria, sumByMonth) + filtros (categoria, dataInicio, dataFim)
**Where:** `apps/api/src/repositories/gasto.repository.ts`
**Depends on:** T-M4-01, T-M4-02
**Done when:** `findAll`, `findById`, `create`, `update`, `delete`, `getResumo` implementados
**Status:** DONE

### T-M4-04 · services/gasto.service.ts
**What:** Lógica de negócio: CRUD + cálculo do resumo financeiro completo (totalGasto, totalOrcado, saldo, porCategoria, porMes)
**Where:** `apps/api/src/services/gasto.service.ts`
**Depends on:** T-M4-03
**Done when:** `GastoNotFoundError` + `GastoService` com todos os métodos
**Status:** DONE

### T-M4-05 · routes/gastos.ts + registro em app.ts
**What:** 6 endpoints REST + tag Swagger "Gastos" + registro no app
**Where:** `apps/api/src/routes/gastos.ts` + `apps/api/src/app.ts`
**Depends on:** T-M4-04
**Endpoints:**
- `GET /obras/:obraId/gastos` — lista com filtros: ?categoria=&dataInicio=&dataFim=
- `POST /obras/:obraId/gastos` — registrar gasto
- `PUT /gastos/:id` — editar gasto
- `DELETE /gastos/:id` — excluir gasto
- `GET /obras/:obraId/financeiro/resumo` — resumo financeiro detalhado
- `GET /obras/:obraId/financeiro/export` — download CSV (UTF-8 BOM)
**Done when:** Todos os 6 endpoints funcionando com auth + workspace isolation
**Status:** DONE

---

## Fase B — Frontend

### T-M4-06 · recharts + lib/gastos.ts
**What:** Instalar recharts em apps/web + client API tipado para gastos
**Where:** `apps/web/lib/gastos.ts`
**Done when:** `gastosApi` com todos os métodos; recharts disponível
**Status:** DONE

### T-M4-07 · Gastos listing page
**What:** Listagem de gastos com filtros (categoria + período) + botão "Novo gasto" + botão "Exportar CSV"
**Where:** `apps/web/app/dashboard/obras/[id]/gastos/page.tsx`
**Depends on:** T-M4-06
**Done when:** Tabela renderiza gastos, filtros funcionam, CSV faz download, delete com confirmação
**Status:** DONE

### T-M4-08 · Gasto create + edit forms
**What:** Formulários de criação e edição de gasto
**Where:**
- `apps/web/app/dashboard/obras/[id]/gastos/novo/page.tsx`
- `apps/web/app/dashboard/obras/[id]/gastos/[gastoId]/editar/page.tsx`
**Depends on:** T-M4-06
**Done when:** Formulários criam/editam gastos e redirecionam para listagem
**Status:** DONE

### T-M4-09 · Relatório page
**What:** Página com BarChart (gastos por categoria), LineChart (evolução mensal), tabela comparativo orçado vs. realizado
**Where:** `apps/web/app/dashboard/obras/[id]/relatorio/page.tsx`
**Depends on:** T-M4-06, recharts instalado
**Done when:** Gráficos renderizam com dados reais da API; comparativo mostra totalOrcado vs totalGasto vs totalContrato
**Status:** DONE

### T-M4-10 · Atualizar obra detail page
**What:** Adicionar seção "Gastos recentes" (últimos 3) + links para /gastos e /relatorio
**Where:** `apps/web/app/dashboard/obras/[id]/page.tsx`
**Depends on:** T-M4-06
**Done when:** Links funcionam; seção mostra gastos recentes com valor e categoria
**Status:** DONE

---

## Critério de pronto do M4

Registrar gastos de categorias diferentes → ver gráfico de barras atualizado → filtrar por período → exportar CSV correto com BOM → alerta de 80% aparece quando esperado.
