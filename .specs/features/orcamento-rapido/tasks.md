# Orçamento Rápido — Tasks

**Spec:** `.specs/features/orcamento-rapido/spec.md`  
**Status:** CONCLUÍDO  
**Gate rápido (API):** `npm run type-check --workspace=apps/api`  
**Gate rápido (Web):** `cd apps/web && npx tsc --noEmit`

---

## Progresso

| Task | Descrição | Status |
|------|-----------|--------|
| TA-01 | Tipos compartilhados `OrcamentoRapidoPayload` em packages/shared | ✅ DONE |
| TA-02 | Template PDF `orcamento-rapido.tsx` na API | ✅ DONE |
| TA-03 | Endpoint `POST /orcamentos/rapido/pdf` + registro em app.ts | ✅ DONE |
| TA-04 | Página `/dashboard/orcamentos/rapido` com form + download | ✅ DONE |
| TA-05 | Link "Orçamento Rápido" no nav do dashboard | ✅ DONE |

---

## Plano de Execução

```
TA-01 ──→ TA-02 ──┐
                   ├──→ TA-03 ──→ TA-04 ──→ TA-05
TA-01 ─────────────┘
```

TA-01 desbloqueia tanto TA-02 (template) quanto TA-03 (endpoint).  
TA-02 é necessário antes de TA-03 (endpoint importa o template).  
TA-04 depende de TA-03 (chama o endpoint).  
TA-05 é independente mas faz mais sentido ao final.

---

## Tasks

### TA-01: Tipos compartilhados para Orçamento Rápido

**O que:** Adicionar `OrcamentoRapidoItem` e `OrcamentoRapidoPayload` em `packages/shared/src/index.ts`.  
**Onde:** `packages/shared/src/index.ts`  
**Depende de:** nada  
**Reutiliza:** padrão de `DemoItemServico`, `DemoWizardPayload` já existentes  
**Req:** RF-RAPIDO-04

**Done when:**
- [ ] `OrcamentoRapidoItem` exportado: `{ descricao: string; unidade: string; quantidade: number; valorUnitario: number }`
- [ ] `OrcamentoRapidoPayload` exportado: `{ cliente: { nome: string; endereco?: string }; itens: OrcamentoRapidoItem[]; pagamento?: string; validadeDias: number; observacoes?: string }`
- [ ] Gate passa: `npm run type-check --workspace=packages/shared` (ou type-check raiz)

**Tests:** none  
**Gate:** type-check  
**Commit:** `feat(orcamento-rapido): add shared types OrcamentoRapidoPayload`

---

### TA-02: Template PDF `orcamento-rapido.tsx`

**O que:** Criar template React PDF para orçamentos rápidos autenticados.  
**Onde:** `apps/api/src/pdf/orcamento-rapido.tsx`  
**Depende de:** TA-01  
**Reutiliza:** estrutura de `orcamento-demo.tsx` + lógica de logo de `orcamento.tsx`  
**Req:** RF-RAPIDO-06

**Done when:**
- [ ] Importa `OrcamentoRapidoPayload` de `@enge-pro/shared`
- [ ] Define tipo interno `OrcamentoRapidoPdfInput`: `{ payload: OrcamentoRapidoPayload; workspace: { name: string; logoUrl: string | null; cnpj: string | null; telefone: string | null; emailContato: string | null } }`
- [ ] Cabeçalho: se `workspace.logoUrl` → `<Image>` (80×40, objectFit contain); senão → `<Text>` com `workspace.name` em estilo bold/azul
- [ ] Se `workspace.cnpj` preenchido, exibe abaixo do logo/nome
- [ ] Lado direito do header: "ORÇAMENTO", número gerado (ORC-AAAA-NNNN), data de emissão, validade (hoje + validadeDias)
- [ ] Seção cliente: caixa cinza com nome e endereço (sem campo "obra")
- [ ] Tabela de itens: colunas Descrição, Unid., Qtd, Vlr Unit., Total — zebra de linhas
- [ ] Total geral em fundo azul
- [ ] Bloco de condições de pagamento (se preenchido) + validade
- [ ] Bloco de observações (se preenchido)
- [ ] Rodapé fixo azul: nome da empresa à esquerda + `telefone · emailContato` à direita (filtra nulos)
- [ ] **Sem** watermark PRUMO
- [ ] **Sem** seção de assinaturas (simplificado)
- [ ] Exporta `renderOrcamentoRapidoToBuffer(input): Promise<Buffer>` — chama componente diretamente (padrão AD-011)
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests:** none  
**Gate:** type-check  
**Commit:** `feat(orcamento-rapido): add PDF template orcamento-rapido.tsx`

---

### TA-03: Endpoint `POST /orcamentos/rapido/pdf` + registro em app.ts

**O que:** Criar rota autenticada que recebe payload, carrega workspace do usuário e retorna PDF binário. Registrar em app.ts.  
**Onde:**
- `apps/api/src/routes/orcamentos-rapido.ts` (novo arquivo)
- `apps/api/src/app.ts` (import + register)  
**Depende de:** TA-02 (template), TA-01 (tipos)  
**Reutiliza:** padrão de `demo.ts` (Zod validation + renderToBuffer) + `authenticate` middleware  
**Req:** RF-RAPIDO-03, RF-RAPIDO-04

**Done when:**
- [ ] Schema Zod valida `OrcamentoRapidoPayload`:
  - `cliente.nome`: string min 1
  - `itens`: array min 1, cada item com `descricao` (min 1), `unidade` (min 1), `quantidade` (positive), `valorUnitario` (min 0)
  - `pagamento`: string opcional
  - `validadeDias`: inteiro 1–365, default 15
  - `observacoes`: string opcional
- [ ] Rota protegida com `{ preHandler: [app.authenticate] }`
- [ ] Carrega workspace via `prisma.workspace.findUnique({ where: { id: req.user.workspaceId } })` — campos: `name`, `logoUrl`, `cnpj`, `telefone`, `emailContato`
- [ ] Retorna 500 se workspace não encontrado (nunca deve acontecer, mas defensive)
- [ ] Chama `renderOrcamentoRapidoToBuffer({ payload, workspace })`
- [ ] Retorna buffer com `Content-Type: application/pdf` + `Content-Disposition: attachment; filename="orcamento-rapido.pdf"` + `Cache-Control: no-store`
- [ ] Schema Fastify declarado para Swagger (`tags: ["Orçamentos"]`, summary, body, response)
- [ ] `orcamentosRapidoRoutes` importado e registrado em `app.ts`
- [ ] Servidor sobe sem erros após registro
- [ ] Gate passa: `npm run type-check --workspace=apps/api`

**Tests:** none  
**Gate:** type-check  
**Commit:** `feat(orcamento-rapido): add POST /orcamentos/rapido/pdf authenticated endpoint`

---

### TA-04: Página `/dashboard/orcamentos/rapido`

**O que:** Criar página com formulário de orçamento rápido e lógica de download do PDF.  
**Onde:** `apps/web/app/dashboard/orcamentos/rapido/page.tsx`  
**Depende de:** TA-03 (endpoint pronto), TA-01 (tipos para o payload)  
**Reutiliza:**
- `orcamentosApi` de `apps/web/lib/orcamentos.ts` (adicionar método `gerarRapido`)
- `downloadBlob` de `apps/web/lib/demo-api.ts` (padrão já existente)
- Componentes shadcn: `Input`, `Textarea`, `Button`, `Card`, `Label`, `Select`  
**Req:** RF-RAPIDO-01, RF-RAPIDO-02, RF-RAPIDO-05

**Subtasks:**

**TA-04a — Adicionar `gerarRapido` ao API client:**
- Em `apps/web/lib/orcamentos.ts`, adicionar:
  ```ts
  gerarRapido: (payload: OrcamentoRapidoPayload) =>
    api.blob("/orcamentos/rapido/pdf", { method: "POST", body: JSON.stringify(payload) })
  ```
- Importar `OrcamentoRapidoPayload` de `@enge-pro/shared`

**TA-04b — Página com formulário:**
- `"use client"` — componente client-side com estado local
- Estado: `cliente: { nome, endereco }`, `itens: Item[]`, `pagamento`, `validadeDias` (default 15), `observacoes`, `isLoading`, `error`
- **Seção Cliente:** campos `Input` para Nome (required) e Endereço (optional)
- **Seção Itens:**
  - Tabela com colunas: Descrição, Unid., Qtd, Valor Unit., Total (calculado), Remover
  - Botão "+ Adicionar item" insere nova linha com defaults
  - Total por linha calculado inline (`qtd * valorUnit`)
  - Total geral somado em tempo real abaixo da tabela
  - Mínimo 1 item (validação antes de submeter)
- **Seção Condições:**
  - Input "Condições de pagamento" (texto livre)
  - Input numérico "Validade (dias)" — min 1, max 365
  - Textarea "Observações"
- **Botão "Gerar PDF":**
  - Disabled durante `isLoading` ou se campos obrigatórios inválidos
  - Durante call: `isLoading = true`, texto "Gerando PDF..."
  - Sucesso: `downloadBlob(blob, "orcamento-rapido-${hoje}.pdf")` → nome no formato `YYYY-MM-DD`
  - Erro: exibe mensagem de erro via toast (`sonner`) ou inline
- **Layout:** `max-w-3xl mx-auto` com título "Orçamento Rápido" + subtítulo explicativo

**Done when:**
- [ ] `orcamentosApi.gerarRapido` adicionado em `apps/web/lib/orcamentos.ts`
- [ ] Formulário renderiza sem erros com todos os campos descritos
- [ ] Adicionar/remover itens funciona; total calculado em tempo real
- [ ] Click em "Gerar PDF" com campos válidos inicia download do PDF
- [ ] Estado de loading desabilita o botão durante o call
- [ ] Erro do endpoint exibido ao usuário (toast ou mensagem inline)
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests:** none  
**Gate:** type-check  
**Commit:** `feat(orcamento-rapido): add /dashboard/orcamentos/rapido page with PDF generation`

---

### TA-05: Link "Orçamento Rápido" no nav do dashboard

**O que:** Adicionar link de navegação para a nova página no header do dashboard.  
**Onde:** `apps/web/app/dashboard/layout.tsx`  
**Depende de:** TA-04 (página deve existir)  
**Req:** RF-RAPIDO-01

**Done when:**
- [ ] `NAV_LINKS` inclui `{ href: "/dashboard/orcamentos/rapido", label: "Orçamento Rápido" }`
- [ ] Link fica ativo (highlight) quando pathname começa com `/dashboard/orcamentos/rapido`
- [ ] Link "Obras" continua funcionando normalmente
- [ ] Gate passa: `cd apps/web && npx tsc --noEmit`

**Tests:** none  
**Gate:** type-check  
**Commit:** `feat(orcamento-rapido): add nav link — completes M3.5`

---

## Mapa de Dependências

```
TA-01 (tipos) ──→ TA-02 (template PDF) ──→ TA-03 (endpoint) ──→ TA-04 (frontend) ──→ TA-05 (nav)
```

Todas sequenciais. Total: ~5 commits atômicos.

---

## Rastreabilidade

| Req | Tasks |
|-----|-------|
| RF-RAPIDO-01 | TA-05 |
| RF-RAPIDO-02 | TA-04 |
| RF-RAPIDO-03 | TA-03 |
| RF-RAPIDO-04 | TA-01, TA-02, TA-03 |
| RF-RAPIDO-05 | TA-04 |
| RF-RAPIDO-06 | TA-02 |

---

## Verificação de Dependências

| Task | Depende de | Diagrama mostra | Coerente? |
|------|-----------|-----------------|-----------|
| TA-02 | TA-01 | TA-01 → TA-02 | ✅ |
| TA-03 | TA-02, TA-01 | TA-02 → TA-03 | ✅ |
| TA-04 | TA-03, TA-01 | TA-03 → TA-04 | ✅ |
| TA-05 | TA-04 | TA-04 → TA-05 | ✅ |
