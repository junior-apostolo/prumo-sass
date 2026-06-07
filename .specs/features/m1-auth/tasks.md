# M1 — Tasks

**Status:** In Progress  
**Started:** 2026-06-06

---

## T-M1-001: Schema — RefreshToken + PasswordResetToken
**Status:** pending  
**Where:** `packages/db/prisma/schema.prisma`  
**Done when:** `prisma migrate dev` roda sem erros, modelos disponíveis no Prisma Client

Adicionar:
- model `RefreshToken` (id, token unique, userId FK, expiresAt, revokedAt?, createdAt)
- model `PasswordResetToken` (id, token unique, userId FK, expiresAt, usedAt?, createdAt)
- Relações inversas em `User`

---

## T-M1-002: API — lib/jwt.ts
**Status:** pending  
**Where:** `apps/api/src/lib/jwt.ts`  
**Done when:** funções exportadas, sem erros de tipo

Funções:
- `signAccessToken(userId, workspaceId)` → JWT string (7d)
- `verifyAccessToken(token)` → `{ userId, workspaceId }` ou throw
- `generateRefreshToken()` → UUID string

---

## T-M1-003: API — routes/auth.ts (register + login)
**Status:** pending  
**Where:** `apps/api/src/routes/auth.ts`  
**Depends on:** T-M1-001, T-M1-002  
**Done when:** POST /auth/register e POST /auth/login respondem corretamente

- `POST /auth/register` — Zod schema, bcrypt hash, prisma.$transaction (User + Workspace + RefreshToken)
- `POST /auth/login` — validar credenciais, bcrypt.compare, retornar tokens

---

## T-M1-004: API — routes/auth.ts (refresh + logout)
**Status:** pending  
**Where:** `apps/api/src/routes/auth.ts`  
**Depends on:** T-M1-003  
**Done when:** POST /auth/refresh e POST /auth/logout respondem corretamente

- `POST /auth/refresh` — buscar RefreshToken no banco, validar, emitir novo access token
- `POST /auth/logout` — marcar RefreshToken como revogado (authenticate preHook)

---

## T-M1-005: API — routes/auth.ts (forgot + reset password)
**Status:** pending  
**Where:** `apps/api/src/routes/auth.ts`  
**Depends on:** T-M1-003  
**Done when:** POST /auth/forgot-password e POST /auth/reset-password funcionam

- `POST /auth/forgot-password` — gerar PasswordResetToken, console.log do link
- `POST /auth/reset-password` — validar token, bcrypt hash nova senha, marcar usado, revogar refresh tokens

---

## T-M1-006: API — Registrar rotas em app.ts
**Status:** pending  
**Where:** `apps/api/src/app.ts`  
**Depends on:** T-M1-003  
**Done when:** `GET /health` ainda responde, `POST /auth/register` acessível

---

## T-M1-007: Web — Instalar next-auth@5, configurar auth.ts
**Status:** pending  
**Where:** `apps/web/`  
**Done when:** `pnpm build` sem erros de tipo em auth.ts

- `pnpm add next-auth@5` em `apps/web`
- Criar `apps/web/auth.ts` com credentials provider
- Criar `apps/web/app/api/auth/[...nextauth]/route.ts`
- Criar `apps/web/types/next-auth.d.ts` com extensão de Session

---

## T-M1-008: Web — Providers + Root layout update
**Status:** pending  
**Where:** `apps/web/components/providers.tsx`, `apps/web/app/layout.tsx`  
**Depends on:** T-M1-007  
**Done when:** SessionProvider no root layout, sem erros de hidratação

- Criar `components/providers.tsx` com `SessionProvider`
- Envolver `{children}` em `RootLayout` com `<Providers>`
- Atualizar título: "PRUMO — Gestão de Obras"

---

## T-M1-009: Web — Auth layout + Login page
**Status:** pending  
**Where:** `apps/web/app/(auth)/`  
**Depends on:** T-M1-007  
**Done when:** Página de login renderiza, submit chama NextAuth signIn

- `app/(auth)/layout.tsx` — layout centralizado (logo + card)
- `app/(auth)/login/page.tsx` — form com email + senha, link "Esqueci senha", link "Criar conta"

---

## T-M1-010: Web — Register page
**Status:** pending  
**Where:** `apps/web/app/(auth)/register/page.tsx`  
**Depends on:** T-M1-009  
**Done when:** Formulário de cadastro funciona, chama POST /auth/register, redireciona ao login

---

## T-M1-011: Web — Forgot-password + Reset-password pages
**Status:** pending  
**Where:** `apps/web/app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`  
**Depends on:** T-M1-009  
**Done when:** Ambas as páginas renderizam e submetem corretamente

---

## T-M1-012: Web — Middleware + Dashboard shell
**Status:** pending  
**Where:** `apps/web/middleware.ts`, `apps/web/app/(dashboard)/`  
**Depends on:** T-M1-007  
**Done when:** Rota `/dashboard` redireciona para `/auth/login` sem sessão

- `middleware.ts` — proteção de rotas usando `auth()` do NextAuth
- `app/(dashboard)/layout.tsx` — shell mínimo (sidebar vazia, header com logout)
- `app/(dashboard)/page.tsx` — redirect para `/obras` (placeholder por ora)

---

## T-M1-013: Web — Atualizar lib/api.ts
**Status:** pending  
**Where:** `apps/web/lib/api.ts`  
**Depends on:** T-M1-007  
**Done when:** Chamadas à API incluem Authorization header com token da sessão NextAuth

---

## Ordem de execução

```
T-001 → T-002 → T-003 → T-004 (paralelo) → T-006
                      ↘ T-005 (paralelo)

T-007 → T-008 → T-009 → T-010 (paralelo) → T-012 → T-013
                       ↘ T-011 (paralelo)
```
