# M1 — Tasks

**Status:** DONE  
**Started:** 2026-06-06  
**Completed:** 2026-06-07

---

## T-M1-001: Schema — RefreshToken + PasswordResetToken
**Status:** done  
**Where:** `packages/db/prisma/schema.prisma`

Adicionado:
- model `RefreshToken` (id, token unique, userId FK, expiresAt, revokedAt?, createdAt)
- model `PasswordResetToken` (id, token unique, userId FK, expiresAt, usedAt?, createdAt)
- Relações inversas em `User`
- Migrations aplicadas: `20260606200902_init`, `20260606203523_m1_auth_tokens`

---

## T-M1-002: API — lib/jwt.ts
**Status:** done  
**Where:** `apps/api/src/lib/jwt.ts`

Funções implementadas:
- `signAccessToken(userId, workspaceId)` → JWT string (7d, assina com `jose`)
- `verifyAccessToken(token)` → `{ userId, workspaceId }` ou throw
- `generateRefreshToken()` → UUID string
- `refreshTokenExpiresAt()` → Date +30 dias

---

## T-M1-003: API — routes/auth.ts (register + login)
**Status:** done  
**Where:** `apps/api/src/routes/auth.ts`

- `POST /auth/register` — Zod schema, bcrypt hash (12 rounds), `prisma.$transaction` (Workspace + User + RefreshToken). Retorna `{ accessToken, refreshToken, user }`.
- `POST /auth/login` — valida credenciais, `bcrypt.compare`, cria novo RefreshToken. Retorna `{ accessToken, refreshToken, user }`.

---

## T-M1-004: API — routes/auth.ts (refresh + logout)
**Status:** done  
**Where:** `apps/api/src/routes/auth.ts`

- `POST /auth/refresh` — busca RefreshToken, valida `revokedAt` e `expiresAt`, emite novo access token.
- `POST /auth/logout` — marca RefreshToken como revogado via `updateMany` (preHandler: authenticate).

---

## T-M1-005: API — routes/auth.ts (forgot + reset password)
**Status:** done  
**Where:** `apps/api/src/routes/auth.ts`

- `POST /auth/forgot-password` — gera PasswordResetToken (1h), loga link no console (workaround B-002). Resposta genérica independente de o email existir.
- `POST /auth/reset-password` — valida token, bcrypt hash nova senha, marca token usado, revoga todos os refresh tokens do usuário em `prisma.$transaction`.

---

## T-M1-006: API — Registrar rotas em app.ts + middleware authenticate
**Status:** done  
**Where:** `apps/api/src/app.ts`, `apps/api/src/middlewares/authenticate.ts`

- Rotas registradas via `app.register(authRoutes)` e `app.register(userRoutes)`.
- `GET /users/me` adicionado em `routes/users.ts` (retorna perfil do usuário autenticado).
- `authenticate` middleware extrai Bearer token, chama `verifyAccessToken`, injeta `req.user`.
- Error handler normalizado: erros de validação Fastify retornam `{ error }` consistente com Zod.
- **Bônus:** Swagger UI adicionado em `GET /docs` com `@fastify/swagger` + `@fastify/swagger-ui`.

---

## ~~T-M1-007: Web — Instalar next-auth@5~~ — SUBSTITUÍDO

**Decisão:** NextAuth não utilizado. Implementado auth custom com httpOnly cookies + `jose`.  
**Motivo:** Google OAuth diferido no MVP; NextAuth adiciona abstração desnecessária com apenas credentials provider. Auth custom é mais transparente para dev solo.  
**Alternativa implementada:**
- Cookies httpOnly `prumo_token` (access) e `prumo_refresh` (refresh token) gerenciados por Route Handlers do Next.js
- `jose` para verificação JWT Edge-compatible no middleware
- `AuthProvider` React para manter token em memória no cliente

---

## T-M1-008: Web — AuthProvider + Root layout
**Status:** done  
**Where:** `apps/web/components/providers/auth-provider.tsx`, `apps/web/app/layout.tsx`

- `AuthProvider` com contexto `{ user, loading, login, logout, setUser }` via `useContext`
- `login()` chama `/api/auth/login` e depois `/api/auth/me` para hidratar o estado
- `logout()` chama `/api/auth/logout`, limpa estado e faz `router.push("/login")`
- `setApiToken()` mantém token em memória para chamadas autenticadas via `lib/api.ts`
- Root layout atualizado: título "PRUMO", `AuthProvider` envolvendo `{children}`

---

## T-M1-009: Web — Auth layout + Login page
**Status:** done  
**Where:** `apps/web/app/(auth)/`

- `app/(auth)/layout.tsx` — layout centralizado com card
- `app/(auth)/login/page.tsx` — form email + senha, link "Esqueci senha", link "Criar conta"

---

## T-M1-010: Web — Register page
**Status:** done  
**Where:** `apps/web/app/(auth)/register/page.tsx`

Formulário de cadastro chama `POST /api/auth/login` após registrar para emitir os cookies, e redireciona para `/dashboard`.

---

## T-M1-011: Web — Forgot-password + Reset-password pages
**Status:** done  
**Where:** `apps/web/app/(auth)/forgot-password/page.tsx`, `apps/web/app/(auth)/reset-password/page.tsx`

- `forgot-password`: submete email, exibe mensagem genérica de confirmação.
- `reset-password`: lê `?token=` da URL, submete nova senha, redireciona para `/login`.

---

## T-M1-012: Web — Middleware + Dashboard shell
**Status:** done  
**Where:** `apps/web/middleware.ts`, `apps/web/app/dashboard/`

- `middleware.ts` usa `verifyToken` (`jose`) para verificar `prumo_token` cookie — Edge-compatible.
  - Não autenticado em rota protegida → redirect `/login`
  - Autenticado em rota de auth → redirect `/dashboard`
- `app/dashboard/layout.tsx` — header com nome do usuário e botão "Sair"
- `app/dashboard/page.tsx` — placeholder de boas-vindas
- Root `page.tsx` redireciona para `/dashboard`

---

## T-M1-013: Web — lib/api.ts atualizado
**Status:** done  
**Where:** `apps/web/lib/api.ts`

- Removido `localStorage.getItem("token")` — migrado para token em memória via `setApiToken()`
- Token injetado como `Authorization: Bearer` nas chamadas à API Fastify

---

## BFF Route Handlers (Next.js)
**Status:** done  
**Where:** `apps/web/app/api/auth/`

Adicionados como camada de proxy entre o frontend e a API Fastify, gerenciando os cookies:

| Handler | Ação |
|---------|------|
| `POST /api/auth/login` | Chama `/auth/login` na API, grava cookies `prumo_token` + `prumo_refresh` |
| `POST /api/auth/logout` | Chama `/auth/logout` na API, limpa cookies |
| `GET /api/auth/me` | Lê `prumo_token` do cookie, retorna usuário via `/users/me` |
| `POST /api/auth/refresh` | Usa `prumo_refresh` para renovar access token, atualiza cookie |

---

## Ordem de execução (realizada)

```
T-001 → T-002 → T-003 → T-004 ┐
                      → T-005 ┘→ T-006

T-008 → T-009 → T-010 ┐
              → T-011 ┘→ T-012 → T-013
BFF handlers (paralelo ao frontend)
```
