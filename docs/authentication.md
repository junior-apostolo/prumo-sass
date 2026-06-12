# Autenticação — PRUMO

Solução custom baseada em **JWT de acesso + refresh token opaco persistido no banco**, sem NextAuth. O frontend aplica o padrão **BFF (Backend for Frontend)**: rotas Next.js fazem proxy para a API Fastify e armazenam os tokens em cookies `httpOnly`, mantendo-os invisíveis ao JavaScript do browser.

---

## Arquitetura em camadas

```
Browser
  │
  ├── middleware.ts            ← guarda todas as rotas (Edge Runtime)
  │
  └── /app/api/auth/*         ← BFF: rotas Next.js (server-side)
        │
        └── apps/api          ← API Fastify (backend)
              │
              └── PostgreSQL  ← tokens persistidos via Prisma
```

---

## Tokens e cookies

| Token          | Tipo                            | Validade | Cookie                          |
|----------------|---------------------------------|----------|---------------------------------|
| `accessToken`  | JWT assinado com `JWT_SECRET`   | 7 dias   | `prumo_token` (httpOnly)        |
| `refreshToken` | UUID opaco (`randomUUID`)       | 30 dias  | `prumo_refresh` (httpOnly) + banco |

O refresh token é opaco — não é JWT. O banco controla sua validade, o que permite revogação explícita a qualquer momento, independentemente da expiração.

Todos os cookies usam `httpOnly: true`, `SameSite: lax` e `Secure: true` em produção.

---

## 1. Registro

`POST /auth/register` — cria usuário, workspace e emite tokens.

```text
1. Valida body com Zod (nome ≥ 2 chars, email válido, senha ≥ 8 chars)
2. Verifica se email já existe → 409 se existir
3. bcrypt.hash(password, 12)
4. prisma.$transaction:
     ├── cria Workspace
     ├── cria User (role: OWNER, vinculado ao workspace)
     └── cria RefreshToken inicial
5. signAccessToken(userId, workspaceId) → JWT 7 dias
6. Retorna { accessToken, refreshToken, user }
```

> Usuário e workspace são criados atomicamente. Se qualquer etapa falhar, nada é persistido.

---

## 2. Login

`POST /auth/login` — autentica com email e senha.

```text
1. AuthProvider.login()  →  POST /api/auth/login      (Next.js BFF)
2. BFF               →  POST /auth/login               (Fastify)
3. Fastify:
     ├── bcrypt.compare(password, user.passwordHash)
     ├── gera accessToken JWT  (7 dias)
     ├── gera refreshToken UUID → salva no banco (30 dias)
     └── retorna { accessToken, refreshToken, user }
4. BFF → setAuthCookies(accessToken, refreshToken)
     ├── prumo_token   → httpOnly, maxAge=7d
     └── prumo_refresh → httpOnly, maxAge=30d
5. BFF retorna apenas { user } ao browser (tokens nunca expostos ao JS)
6. AuthProvider → GET /api/auth/me → popula contexto React
```

---

## 3. Proteção de rotas

`middleware.ts` — roda no Edge Runtime em toda requisição não-estática.

```text
Requisição chega
  │
  ├── rota pública (/api/auth/*, _next/*, favicon)? → passa direto
  │
  ├── lê cookie prumo_token
  │   └── jwtVerify() via jose (Web Crypto API)
  │
  ├── rota de auth + autenticado?       → redireciona /dashboard
  └── rota protegida + não autenticado? → redireciona /login
```

> **Por que `jose` no middleware e `jsonwebtoken` na API?**
> O Edge Runtime não suporta módulos nativos do Node. `jsonwebtoken` usa `crypto` do Node; `jose` usa Web Crypto API e funciona no Edge.

---

## 4. Renovar acesso (refresh)

`POST /api/auth/refresh` — emite novo access token sem novo login.

```text
1. Lê prumo_refresh do cookie (httpOnly — invisível ao JS)
2. Envia para POST /auth/refresh (Fastify)
3. Fastify verifica no banco:
     ├── token existe?
     ├── revokedAt é null?
     └── expiresAt > agora?
4. Emite novo accessToken JWT
5. BFF atualiza cookie prumo_token
```

---

## 5. Logout

`POST /api/auth/logout` — encerra a sessão e revoga o refresh token.

```text
1. Lê prumo_token e prumo_refresh dos cookies
2. POST /auth/logout (Fastify) com Authorization: Bearer <token>
   └── atualiza refreshToken.revokedAt = now()  no banco
3. clearAuthCookies() → deleta prumo_token e prumo_refresh
```

O middleware `authenticate` do Fastify exige um access token válido — apenas o próprio usuário autenticado pode revogar sua sessão.

---

## 6. Esqueci minha senha

`POST /auth/forgot-password` — solicita redefinição por email.

```text
1. Valida email com Zod
2. Se usuário existe:
     ├── gera PasswordResetToken (UUID, expira em 1h) → salva no banco
     └── loga a URL de reset no console  [pendência B-002]
3. Retorna resposta genérica independente de o email existir
   (evita enumeração de contas)
```

`POST /auth/reset-password` — define nova senha com o token recebido.

```text
1. Valida token: existe? usedAt é null? expiresAt > agora?
2. bcrypt.hash(newPassword, 12)
3. prisma.$transaction:
     ├── user.passwordHash = novo hash
     ├── passwordResetToken.usedAt = now  (token de uso único)
     └── refreshToken.revokedAt = now  (revoga TODAS as sessões ativas)
```

> Redefinir a senha invalida todas as sessões abertas do usuário.

---

## Modelos no banco

| Tabela               | Responsabilidade                                          |
|----------------------|-----------------------------------------------------------|
| `User`               | Credenciais e vínculo com Workspace                       |
| `RefreshToken`       | Sessões ativas; `revokedAt = null` significa sessão ativa |
| `PasswordResetToken` | Tokens de reset de senha (uso único, expiram em 1h)       |

Campos relevantes para a autenticação:

```prisma
model RefreshToken {
  token     String    @unique  // UUID opaco
  userId    String
  expiresAt DateTime
  revokedAt DateTime?          // null = sessão ativa
}

model PasswordResetToken {
  token     String    @unique  // UUID opaco
  userId    String
  expiresAt DateTime
  usedAt    DateTime?          // null = token ainda válido
}
```

---

## Arquivos-chave

| Arquivo                                          | Responsabilidade                                         |
|--------------------------------------------------|----------------------------------------------------------|
| `apps/api/src/routes/auth.ts`                    | Todas as rotas de auth no Fastify                        |
| `apps/api/src/lib/jwt.ts`                        | `signAccessToken`, `verifyAccessToken`, `generateRefreshToken` |
| `apps/api/src/middlewares/authenticate.ts`       | Middleware Fastify que protege rotas da API              |
| `apps/web/middleware.ts`                         | Guard de rotas no Next.js (Edge Runtime)                 |
| `apps/web/lib/auth/cookies.ts`                   | Leitura e escrita dos cookies httpOnly                   |
| `apps/web/lib/auth/verify.ts`                    | Verificação JWT com `jose` (Edge-compatible)             |
| `apps/web/app/api/auth/`                         | BFF — proxy entre browser e API Fastify                  |
| `apps/web/components/providers/auth-provider.tsx`| Contexto React com estado de usuário e `login`/`logout`  |

---

## Variáveis de ambiente

| Variável                      | Obrigatória | Padrão                   | Descrição                                          |
|-------------------------------|-------------|--------------------------|-----------------------------------------------------|
| `JWT_SECRET`                  | Sim         | —                        | Segredo para assinar e verificar os JWTs           |
| `REFRESH_TOKEN_EXPIRES_DAYS`  | Não         | `30`                     | Dias de validade do refresh token                  |
| `NEXT_PUBLIC_API_URL`         | Não         | `http://localhost:3001`  | URL base da API Fastify                            |
| `FRONTEND_URL`                | Não         | `http://localhost:3000`  | URL do frontend, usada no link de reset de senha   |

---

## Referência rápida

| Ação                       | Endpoint (Fastify)           | Endpoint (BFF Next.js)    | Auth exigida |
|----------------------------|------------------------------|---------------------------|--------------|
| Registrar                  | `POST /auth/register`        | —                         | Não          |
| Login                      | `POST /auth/login`           | `POST /api/auth/login`    | Não          |
| Renovar access token       | `POST /auth/refresh`         | `POST /api/auth/refresh`  | Não          |
| Logout                     | `POST /auth/logout`          | `POST /api/auth/logout`   | Sim (Bearer) |
| Solicitar reset de senha   | `POST /auth/forgot-password` | —                         | Não          |
| Redefinir senha            | `POST /auth/reset-password`  | —                         | Não          |
| Dados do usuário atual     | `GET /users/me`              | `GET /api/auth/me`        | Sim (Bearer) |

---

## Pendências conhecidas

| ID    | Descrição                                                                                   |
|-------|---------------------------------------------------------------------------------------------|
| B-002 | Email transacional não configurado. O link de reset de senha é logado apenas no console da API. |
