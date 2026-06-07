# M1 — Design de Arquitetura

## Fluxo de autenticação

```
[Browser] → [NextAuth credentials provider] → [Fastify /auth/login]
                                                      ↓
                                           { accessToken, refreshToken, user }
                                                      ↓
                              [NextAuth JWT session cookie (httpOnly)]
                                                      ↓
                              [Browser usa accessToken em chamadas à API]
```

## Novos modelos Prisma

```prisma
model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}
```

Adicionalmente, `User` precisa receber `@@index([email])` (já tem `@unique`, então já está indexado).

## API — Novas rotas

**Arquivo:** `apps/api/src/routes/auth.ts`  
**Prefixo:** `/auth`  
**Registrado em:** `apps/api/src/app.ts`

| Método | Rota                    | Auth | Descrição                        |
|--------|-------------------------|------|----------------------------------|
| POST   | /auth/register          | ❌   | Cadastro + cria workspace        |
| POST   | /auth/login             | ❌   | Login, retorna tokens            |
| POST   | /auth/refresh           | ❌   | Renova access token              |
| POST   | /auth/logout            | ✅   | Revoga refresh token             |
| POST   | /auth/forgot-password   | ❌   | Gera token de reset (console)    |
| POST   | /auth/reset-password    | ❌   | Aplica novo password             |

**Utilitário JWT:** `apps/api/src/lib/jwt.ts`
```typescript
// signAccessToken(userId, workspaceId) → string (7 dias)
// signRefreshToken() → string UUID (armazenado no banco, 30 dias)
// verifyAccessToken(token) → JwtPayload | null
```

## Frontend — Estrutura de arquivos

```
apps/web/
  auth.ts                              # NextAuth v5 config
  middleware.ts                        # Proteção de rotas
  app/
    (auth)/                            # Route group: páginas sem sidebar
      layout.tsx                       # Layout centralizado
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
    (dashboard)/                       # Route group: páginas protegidas
      layout.tsx                       # Shell com sidebar (apenas estrutura)
      page.tsx                         # Redirect → /obras (futuro)
    layout.tsx                         # Root layout (adiciona SessionProvider)
  lib/
    api.ts                             # Atualizado: token via getSession()
  components/
    providers.tsx                      # SessionProvider wrapper (client)
```

## NextAuth v5 — Session shape

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    accessToken: string
    user: {
      id: string
      workspaceId: string
      name: string
      email: string
    }
  }
  interface JWT {
    accessToken: string
    refreshToken: string
    userId: string
    workspaceId: string
  }
}
```

## Middleware Next.js

```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")

  if (isAuthRoute && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (!isAuthRoute && !isAuth) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

## Variáveis de ambiente necessárias

**API (`apps/api/.env`):**
```
JWT_SECRET=<random 64-char hex>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_DAYS=30
DATABASE_URL=...
```

**Web (`apps/web/.env.local`):**
```
NEXTAUTH_SECRET=<random 64-char hex>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```
