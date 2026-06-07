# State

**Last Updated:** 2026-06-07
**Current Work:** M2 — Obras. M1 e LP concluídos.

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

## Recent Decisions (Last 60 days)

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
**Impact:** Toaster vem de `components/ui/sonner.tsx`, não de `components/ui/toast.tsx`.

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

_(vazio — projeto em início)_

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

- [ ] Decidir nome do produto (DA-01) — desbloqueador para B-001
- [ ] Decidir provedor de email (DA-05) — Resend recomendado — desbloqueador para B-002
- [ ] Abrir conta no Railway e Vercel antes de iniciar Fase 6
- [ ] Abrir conta no Cloudflare R2 ou AWS S3 antes de T-098 (upload de logo)

---

## Preferences

**Model Guidance Shown:** never
