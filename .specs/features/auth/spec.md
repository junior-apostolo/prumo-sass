# Feature Spec — M1 Autenticação

**ID:** M1
**Status:** PLANNED
**Tasks:** tasks.md Fase 1 (T-029 a T-047)
**Depends on:** Fase 0 (Fundação)

---

## Requisitos

| ID    | Requisito |
|-------|-----------|
| RF-01 | Cadastro com email + senha |
| RF-02 | Slot para Google OAuth preparado (não ativo no MVP — ver AD-006) |
| RF-03 | Email de verificação após cadastro (bloqueado por B-002 — DA-05) |
| RF-04 | Recuperação de senha via email (bloqueado por B-002 — DA-05) |
| RF-05 | Sessões expiram após 30 dias de inatividade |
| RF-06 | Workspace criado automaticamente ao criar conta |
| RNF-05 | Senhas com bcrypt, salt rounds ≥ 12 |
| RNF-06 | JWT 7 dias + refresh token 30 dias |
| RNF-07 | Rate limiting nas rotas de auth: máx. 10 tentativas/minuto por IP |

## Comportamentos principais

**Cadastro (RF-01, RF-06):**
- Campos: nome, email, senha
- Criar Workspace + User em transação atômica
- Retornar access token (JWT 7d) + refresh token (30d)
- Email de verificação: implementar após DA-05 decidido

**Login:**
- Validar email + senha com bcrypt
- Retornar novos tokens
- Rate limiting: bloquear após 10 tentativas/min por IP

**Recuperação de senha (RF-04):**
- Campo de email → enviar link com token temporário
- Bloqueado por B-002 — implementar após provedor de email definido

**Proteção de rotas:**
- Middleware `authenticate` injeta `req.user = { id, workspaceId }` em todas as rotas protegidas
- Frontend: Next.js middleware redireciona `/dashboard/*` → `/login` se sem token válido

## Decisões abertas resolvidas

- DA-04: Google OAuth NÃO no MVP (AD-006)
- DA-05: Resolver antes de finalizar M1 — Resend recomendado

## Critério de pronto

Usuário consegue criar conta → ver dashboard → fechar aba → reabrir → ainda autenticado → logout → redirecionado para login.
