# State

**Last Updated:** 2026-06-19
**Current Work:** M3.5 — Orçamento Rápido (Fase 3e). M3 concluído (T-20 dnd-kit + T-21 PDF download done). Spec e tasks definidos em `.specs/features/orcamento-rapido/`. Pendente: TA-01 → TA-05.

---

## Completed Milestones

### LP — Landing Page (concluído 2026-06-07)

**Frontend (Next.js):**
- Rota `/` pública: mostra landing para usuário não autenticado, redireciona para `/dashboard` se autenticado
- 9 seções: Navbar · Hero · Problema · Features · Como Funciona · Pricing · FAQ · CTA Final · Footer
- `components/landing/hero-headline.tsx` — animação de palavras em loop com `motion` v12 (`useAnimation` + stagger + exit reverso)
- `components/landing/animate-in.tsx` — wrapper com IntersectionObserver para fade-up nas seções
- Fonte Inter aplicada globalmente via `next/font/google`
- `middleware.ts` atualizado para tratar `/` como rota pública

**Decisões:**
- `motion` v12 (não Framer Motion legacy) — import via `motion/react`
- `AnimateIn` usa CSS transitions (sem JS no runtime após mount) — melhor performance que motion em cada elemento
- Badge "Mais popular" movido para wrapper externo ao `Card` para evitar clip do `overflow-hidden`

---

### M1 — Autenticação (concluído 2026-06-07)

**API (Fastify):**
- `POST /auth/register` — cria usuário + workspace + refresh token em transação
- `POST /auth/login` — valida credenciais, emite access + refresh token
- `POST /auth/refresh` — renova access token via refresh token
- `POST /auth/logout` — revoga refresh token (requer Bearer)
- `POST /auth/forgot-password` — gera token de reset (logado no console — B-002)
- `POST /auth/reset-password` — redefine senha + revoga todas as sessões
- `GET /users/me` — retorna perfil do usuário autenticado (requer Bearer)
- Swagger UI disponível em `GET /docs`

**Frontend (Next.js):**
- Páginas: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Route handlers BFF: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/refresh`
- `AuthProvider` com contexto global de usuário + `setApiToken` para chamadas autenticadas
- Middleware de proteção de rotas: redireciona para `/login` se não autenticado; para `/dashboard` se já logado e acessar rota pública de auth
- Dashboard shell com header (nome do usuário + botão "Sair" com redirect para `/login`)
- Tokens armazenados em httpOnly cookies (`prumo_token`, `prumo_refresh`)

**Infra:**
- `docker-compose.yml` para Postgres 16 local
- `packages/db/prisma/schema.prisma` com modelos `RefreshToken` e `PasswordResetToken`
- Migration aplicada localmente

---

### M2 — Obras (concluído 2026-06-12)

**API (Fastify):**
- `GET /obras` — lista obras não arquivadas do workspace com totais calculados
- `POST /obras` — cria obra com campos opcionais
- `GET /obras/:id` — detalhe com resumo financeiro (totalOrcado, totalGasto, saldo, percentualConsumido)
- `PUT /obras/:id` — edita campos da obra
- `PATCH /obras/:id/status` — altera status (PLANEJAMENTO → EM_EXECUCAO → PAUSADA / CONCLUIDA)
- `DELETE /obras/:id` — arquiva obra via soft delete (seta `archivedAt`)
- Todos os endpoints com `authenticate` middleware + filtro por `workspaceId` em todas as queries

**Frontend (Next.js):**
- `/dashboard/obras` — listagem com cards, barra de progresso e badge "Atenção" quando >80% consumido
- `/dashboard/obras/nova` — formulário de criação com campos opcionais
- `/dashboard/obras/[id]` — 4 cards financeiros (contratado / orçado / gasto / saldo), dropdown de status, AlertDialog de confirmação antes de arquivar
- `/dashboard/obras/[id]/editar` — formulário pré-preenchido
- `components/obras/obra-status-badge.tsx` — badge reutilizável com cores por status
- Dashboard home (`/dashboard`) redireciona para `/dashboard/obras`
- Nav do dashboard com link "Obras" ativo por pathname

**Decisões:**
- Totais financeiros calculados em runtime no repository (não armazenados) — via aggregate dos gastos e itens de orçamentos aprovados
- `Decimal` do Prisma serializado como `string` na API e parseado no frontend

---

---

### M3 — Orçamentos / Fase 3d — Polish (concluído, 2026-06-19)

**Todas as tasks concluídas (T-00 → T-21). Ver `.specs/features/orcamentos/tasks.md`.**

**Bugs corrigidos:**
- `orcamentosApi.upsertItens` enviava array diretamente; API Fastify esperava `{ itens: [...] }` → corrigido em `apps/web/lib/orcamentos.ts`
- Auto-save entrava em loop infinito: `saveItens` chamava `setItens` (sync de IDs) → acionava debounce → loop → corrigido com `isSyncing` ref em `apps/web/app/dashboard/orcamentos/[id]/page.tsx`

---

### M3.5 — Orçamento Rápido / Fase 3e (planejado, 2026-06-19)

**Spec:** `.specs/features/orcamento-rapido/spec.md`  
**Tasks:** `.specs/features/orcamento-rapido/tasks.md`

**Contexto:** Feature de última hora — geração de PDF "sem compromisso" para usuários autenticados, sem vínculo a obra.

**Análise de viabilidade:**
- Schema `Workspace` já tem `name`, `logoUrl`, `cnpj`, `telefone`, `emailContato` — sem migração necessária
- Template `orcamento.tsx` já faz fallback logo → nome textual
- Padrão do endpoint `/demo/pdf` (transiente, sem salvar no DB) será reutilizado
- Sem dependência de M5 (Configurações) — logo é opcional

**Pendente:**
- TA-01: Tipos `OrcamentoRapidoPayload` em packages/shared
- TA-02: Template `orcamento-rapido.tsx`
- TA-03: Endpoint `POST /orcamentos/rapido/pdf` (autenticado)
- TA-04: Página `/dashboard/orcamentos/rapido`
- TA-05: Link no nav do dashboard

---

### M3 — Orçamentos / Fase 3c — Frontend Dashboard (concluído 2026-06-15)

**Frontend (Next.js):**
- `apps/web/lib/api.ts` — método `api.blob()` adicionado (para download de PDF autenticado)
- `apps/web/lib/orcamentos.ts` — client API tipado com todos os 8 métodos: list, create, get, update, upsertItens, duplicar, updateStatus, downloadPdf
- `apps/web/components/orcamentos/orcamento-status-badge.tsx` — badge reutilizável (RASCUNHO/cinza, ENVIADO/azul, APROVADO/verde, RECUSADO/vermelho)
- `apps/web/app/dashboard/obras/[id]/page.tsx` — seção "Orçamentos" adicionada abaixo dos cards financeiros, com lista clicável, botão "Novo orçamento" e estado vazio
- `apps/web/app/dashboard/obras/[id]/orcamentos/nova/page.tsx` — formulário de criação (título obrigatório, validade, observações) → redireciona para editor ao criar
- `apps/web/app/dashboard/orcamentos/[id]/page.tsx` — editor completo: cabeçalho editável, status dropdown, tabela de itens inline editável, subtotais por categoria, total geral, prep para T-19 (saveStatus) e T-21 (Gerar PDF desabilitado)
- `apps/web/components/ui/textarea.tsx` — criado (não existia)

---

### M3 — Orçamentos / Fase 3a — Demo Pública (concluído 2026-06-12)

**API (Fastify):**
- `POST /demo/pdf` — endpoint público (sem auth), recebe payload do wizard, gera e retorna PDF binário
- Validação com Zod antes da renderização
- `@react-pdf/renderer` instalado em `apps/api`; template em `src/pdf/orcamento-demo.tsx`
- Suporta dois modos: `wizard` (itens itemizados) e `verba` (preço fechado global)

**Frontend (Next.js):**
- `/demo` — rota pública (adicionada ao middleware), sem autenticação
- Wizard de 5 passos + preview: Ofício → Prestador → Cliente → Serviços → Condições → PDF
- Preços sugeridos editáveis por ofício em `lib/demo-precos.ts`
- Modo "verba" para reparos com preço fechado dentro do passo de serviços
- CTA pós-download: "Criar conta grátis" exibido após geração bem-sucedida
- Hero da landing page atualizado: CTA principal → "Gerar orçamento grátis" apontando para `/demo`

**Tipos compartilhados:**
- `TipoOficio`, `DemoItemServico`, `DemoVerba`, `DemoWizardPayload` em `packages/shared`

**Documentação:**
- `docs/demo-orcamento.md` — guia didático com analogias explicando toda a feature

---

## Recent Decisions (Last 60 days)

### AD-011: React unificado em `^19` no monorepo (2026-06-12)

**Decision:** `apps/api` usa `react@^19` (igual a `apps/web`), não `^18`.
**Reason:** `@react-pdf/renderer` e `apps/web` usavam `react@19` da raiz. Com `react@18` instalado localmente em `apps/api`, havia duas instâncias de React em memória — símbolos JSX incompatíveis causavam `Cannot read properties of null (reading 'props')` no reconciliador do react-pdf.
**Trade-off:** Nenhum para o uso atual (a API não usa React no browser, apenas para renderização de PDF no servidor).
**Impact:** Ao adicionar qualquer dependência que use React em `apps/api`, garantir que seja compatível com React 19.

---

### AD-010: Formato de data `date` em vez de `date-time` nos body schemas (2026-06-12)

**Decision:** Os campos `dataInicio` e `dataFim` nos body schemas do Fastify usam `format: "date"` (não `"date-time"`).
**Reason:** O `<input type="date">` do HTML envia `"YYYY-MM-DD"`, que falha na validação `"date-time"` do Fastify antes de chegar ao Zod. O Zod já usa `z.coerce.date()` que aceita ambos os formatos.
**Trade-off:** Nenhum.
**Impact:** Aplicar o mesmo padrão em M3+ sempre que houver campos de data em formulários.

---

### AD-009: Nome do produto definido como PRUMO (2026-06-06)

**Decision:** O produto se chama **PRUMO**.
**Reason:** Nome escolhido pelo fundador — referência a "prumo" da construção civil (verticalidade, precisão), alinhado ao público-alvo da plataforma.
**Trade-off:** Nenhum.
**Impact:** Resolve B-001. Desbloqueia: registro de domínio, Google OAuth, branding da landing page, configuração do Vercel com domínio customizado (T-127).

---

### AD-001: Monorepo com Turborepo (2026-06-05)

**Decision:** Usar Turborepo com apps/web (Next.js), apps/api (Express) e packages/db + packages/shared.
**Reason:** Permite compartilhar tipos TypeScript entre frontend e backend sem duplicação. Schema Prisma vira fonte de verdade dos tipos.
**Trade-off:** Setup inicial mais trabalhoso que um projeto único.
**Impact:** Todos os tipos compartilhados ficam em packages/shared; Prisma client fica em packages/db.

### AD-007: Fastify em vez de Express (2026-06-05)

**Decision:** Usar Fastify 5 no apps/api em vez de Express.
**Reason:** Melhor performance, schema validation nativa, plugin system mais limpo, pino logger built-in.
**Trade-off:** Menos material de referência que Express; plugins @fastify/* em vez de middlewares Express.
**Impact:** Atualizar tasks.md e spec.md — substituir Express por Fastify em todas as referências. Dev script usa `tsx watch` em vez de nodemon.

### AD-008: shadcn/ui com preset Nova + Radix (2026-06-05)

**Decision:** shadcn@4 com biblioteca Radix e preset Nova (Geist + Lucide).
**Reason:** Versão mais nova do shadcn com Tailwind v4. `toast` depreciado — usar `sonner` no lugar.
**Trade-off:** API de alguns componentes ligeiramente diferente das versões anteriores.
**Impact:** Toaster vem de `components/ui/sonner.tsx`, não de `components/ui/toast.tsx`. Componentes base-ui usam `render` prop em vez de `asChild`.

### AD-002: API REST separada do Next.js (2026-06-05)

**Decision:** Backend em Fastify separado (Railway), não como Route Handlers do Next.js.
**Reason:** Evita acoplamento. Futuramente um app mobile pode consumir a mesma API sem mudanças.
**Trade-off:** Dois serviços para fazer deploy e monitorar em vez de um.
**Impact:** Frontend usa fetch para `NEXT_PUBLIC_API_URL`; CORS configurado no Express.

### AD-003: PDF com @react-pdf/renderer (2026-06-05)

**Decision:** Usar @react-pdf/renderer no servidor (Node) em vez de Puppeteer.
**Reason:** Roda em Node sem Chrome headless — deploy trivial no Railway sem configurar Chromium. Elimina DA-03 (deploy do Puppeteer).
**Trade-off:** Menos flexibilidade de CSS comparado ao HTML renderizado pelo Puppeteer.
**Impact:** Template PDF em packages/shared ou apps/api como componente React tipado.

### AD-004: 1 conta = 1 workspace isolado no MVP (2026-06-05)

**Decision:** Sem multiusuário por workspace no MVP. Toda tabela tem workspace_id para preparar v2.
**Reason:** Dev solo em validação — multiusuário aumenta complexidade de auth, permissões e billing sem valor comprovado agora.
**Trade-off:** Usuários não podem convidar colaboradores até v2.
**Impact:** Middleware authenticate injeta req.user = { id, workspaceId }; todos os services filtram por workspaceId.

### AD-005: Gráficos com Recharts (2026-06-05)

**Decision:** Usar Recharts para gráficos do M4 (BarChart + LineChart).
**Reason:** Integração nativa com React, sem canvas externo, bundle razoável.
**Trade-off:** Menos customização que D3, mas suficiente para o MVP.
**Impact:** Resolve DA-06. Instalar recharts apenas em apps/web.

### AD-006: Google OAuth como slot preparado, não ativo no MVP (2026-06-05)

**Decision:** Não implementar Google OAuth no v1.0. Preparar slot (RF-02 marcado como "opcional no MVP").
**Reason:** Credenciais OAuth exigem domínio definido (DA-01 ainda aberto). Não bloquear o MVP por isso.
**Trade-off:** Usuários precisam de email + senha; sem login social no lançamento.
**Impact:** Resolve DA-04. NextAuth configurado apenas com credentials provider por ora.

---

## Active Blockers

### ~~B-001: Nome do produto (DA-01)~~ — RESOLVIDO (2026-06-06)

**Nome definido: PRUMO.** Ver AD-009.

### B-002: Estratégia de email transacional (DA-05) não decidida

**Discovered:** 2026-06-05
**Impact:** Bloqueia RF-03 (verificação de email) e RF-04 (recuperação de senha) — necessários para M1.
**Workaround:** Implementar M1 sem envio de email primeiro (mock/log no console), integrar email na Fase 6.
**Resolution:** Decidir entre Resend vs. Postmark vs. SES antes de finalizar M1. Resend tem free tier generoso e DX simples — recomendado.

---

## Lessons Learned

- **Campos de data em formulários HTML:** `<input type="date">` envia `"YYYY-MM-DD"`. Fastify valida antes do Zod — usar `format: "date"` (não `"date-time"`) nos body schemas da API. Ver AD-010.
- **Componentes base-ui no shadcn:** Não suportam `asChild`. Usar `render={<Component />}` em vez de `asChild` em `DropdownMenuTrigger`, `AlertDialogTrigger` etc.
- **Body de array no Fastify:** Fastify rejeita `PUT` com body array puro (`"body must be object"`). Sempre envolver em objeto: `{ itens: [...] }` em vez de `[...]`.
- **Auto-save + `setItens` da API causam loop infinito:** Ao sincronizar IDs do servidor via `setItens`, o `useEffect([itens])` dispara novamente. Solução: ref `isSyncing` — setar `true` antes do `setItens`, checar e resetar no `useEffect`.
- **Multiple React instances em monorepo + @react-pdf/renderer:** Instalar `react` em um workspace com versão diferente da raiz cria dois Reacts em memória. Os `Symbol()` JSX não coincidem e o reconciliador lança `Cannot read properties of null`. Solução: alinhar todas as versões de React no monorepo. Ver AD-011.
- **`@react-pdf/renderer` e componente wrapper:** `renderToBuffer` espera o elemento `<Document>` diretamente. Ao passar `<MeuComponente />` (que retorna um Document), chamar o componente como função `MeuComponente({ payload })` antes de passar ao `renderToBuffer` evita que o reconciliador receba um tipo desconhecido.

---

## Quick Tasks Completed

_(nenhuma ainda)_

---

## Deferred Ideas

- [ ] Verificação de email no cadastro (RF-03) — implementar após decidir DA-05 (provedor de email)
- [ ] Google OAuth (RF-02) — aguarda DA-01 (nome/domínio) e DA-04
- [ ] Refresh token — implementar junto com RF-05 (sessões 30 dias) se houver tempo no MVP
- [ ] Upload de comprovante de gasto (campo `comprovante` no modelo `Gasto`) — campo existe no schema mas UI de upload fica para v1.1

---

## Todos

- [x] Decidir nome do produto (DA-01) — RESOLVIDO
- [ ] Decidir provedor de email (DA-05) — Resend recomendado — desbloqueador para B-002
- [ ] Abrir conta no Railway e Vercel antes de iniciar Fase 6
- [ ] Abrir conta no Cloudflare R2 ou AWS S3 antes de T-098 (upload de logo)

---

## Preferences

**Model Guidance Shown:** never
