# State

**Last Updated:** 2026-06-05
**Current Work:** Fase 0 concluída — monorepo funcionando, aguardando DATABASE_URL para migrations (T-008–T-016)

---

## Recent Decisions (Last 60 days)

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

### B-001: Nome do produto (DA-01) não definido

**Discovered:** 2026-06-05
**Impact:** Bloqueia: registro de domínio, configuração de Google OAuth, branding da landing page, configuração do Vercel com domínio customizado (T-127).
**Workaround:** Deploy em subdomínio do Vercel/Railway durante desenvolvimento.
**Resolution:** Decidir nome antes de iniciar Fase 6 (deploy + landing page).

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
