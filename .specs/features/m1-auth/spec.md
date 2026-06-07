# M1 — Autenticação

**Status:** In Progress  
**Started:** 2026-06-06  
**Milestone:** MVP v1.0

---

## Contexto

Primeira milestone do PRUMO. Sem autenticação nada mais pode ser construído. O usuário precisa criar conta, fazer login, recuperar senha e ter seu workspace isolado criado automaticamente.

## Requisitos

### RF-M1-01: Cadastro com email + senha
- Campos: nome completo, email, senha (mín. 8 chars)
- Email deve ser único no sistema
- Senha armazenada como bcrypt hash (rounds: 12)
- Ao cadastrar: criar User + Workspace com o mesmo nome do usuário
- Retorna access token (JWT, 7 dias) + refresh token (opaco, 30 dias)

### RF-M1-02: Login com email + senha
- Campos: email, senha
- Retorna access token + refresh token
- Erros genéricos ("Credenciais inválidas") — não revelar se email existe

### RF-M1-03: Refresh de token
- Cliente envia refresh token (opaco)
- API valida: token existe no banco, não revogado, não expirado
- Retorna novo access token
- Refresh token NÃO é rotacionado no MVP (fica válido por 30 dias)

### RF-M1-04: Logout
- Cliente envia refresh token
- API marca refresh token como revogado (`revokedAt = now()`)
- Access token expira naturalmente (sem blacklist no MVP)

### RF-M1-05: Esqueci minha senha
- Campos: email
- Se email existe: gera token de reset (UUID, expira em 1h), armazena no banco
- **Workaround B-002:** Loga o link de reset no console do servidor (sem envio de email no MVP)
- Resposta sempre genérica: "Se o email existir, você receberá instruções"

### RF-M1-06: Redefinição de senha
- Campos: token (da URL), nova senha, confirmação de senha
- Valida: token existe, não usado, não expirado
- Atualiza passwordHash, marca token como usado (`usedAt = now()`)
- Invalida todos os refresh tokens do usuário após reset

### RF-M1-07: Sessões com JWT 7 dias + refresh 30 dias (RF-05)
- Access token JWT: `{ userId, workspaceId, iat, exp }`
- Refresh token: string UUID armazenada na tabela `RefreshToken`
- Middleware `authenticate` já implementado — reutilizar

### RF-M1-08: Workspace criado automaticamente no cadastro (RF-06)
- Nome do workspace = nome do usuário no cadastro
- `role = OWNER`
- Todos os campos opcionais (cnpj, telefone etc.) ficam null

### RF-M1-09: Proteção de rotas no frontend
- Rotas não-auth (`/dashboard/**`, `/obras/**`, etc.) exigem sessão ativa
- Sem sessão → redirect para `/auth/login`
- Com sessão + rota de auth → redirect para `/dashboard`

### RF-M1-10: Slot Google OAuth (preparado, não ativo)
- Apenas comentário de extensão no arquivo `auth.ts`
- Não instalar dependências extras

---

## Fora de escopo (M1)

- Verificação de email (RF-03) — aguarda DA-05 (provedor de email)
- Google OAuth (RF-02) — aguarda DA-01 resolvido + configuração OAuth
- Refresh token rotacionado
- Blacklist de access tokens
- Rate limiting específico de auth (feito na Fase 6)

---

## Critério de aceite

- [ ] POST /auth/register cria User + Workspace, retorna tokens
- [ ] POST /auth/login valida credenciais e retorna tokens
- [ ] POST /auth/refresh renova access token com refresh válido
- [ ] POST /auth/logout revoga refresh token
- [ ] POST /auth/forgot-password loga link no console (workaround B-002)
- [ ] POST /auth/reset-password atualiza senha, invalida refresh tokens
- [ ] Frontend: login page funcional com validação
- [ ] Frontend: register page funcional com validação
- [ ] Frontend: forgot-password page funcional
- [ ] Frontend: reset-password page funcional
- [ ] Middleware Next.js protege rotas `/dashboard/**` e outras
- [ ] Sessão NextAuth contém `{ userId, workspaceId, accessToken }`
