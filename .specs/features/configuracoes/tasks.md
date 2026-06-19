# Tasks — M5 Configurações

**Status:** DONE (RF-30 / T-M5-07 DEFERRED)
**Spec:** spec.md
**Started:** 2026-06-19
**Depends on:** M1 (Auth — UserRepository, bcryptjs, authenticate middleware)

---

## Mapa de dependências

```
T-01 (UserRepository.updateProfile)
 └─ T-03 (settings routes) ─── T-05 (frontend page)
T-02 (WorkspaceRepository) ─┘        │
T-04 (lib/settings.ts) ──────────────┘
T-06 (nav link) — independente

T-07 (storage.ts + RF-30) — bloqueado por TODO: conta R2/S3
```

---

## T-M5-01 · Estender UserRepository com `updateProfile`

**What:** Adicionar método `updateProfile(userId, data)` ao UserRepository existente. Checar unicidade de email antes de atualizar (retornar erro se já existe em outro usuário).
**Where:** `apps/api/src/repositories/user.repository.ts`
**Reuses:** `prisma.user.findUnique`, `prisma.user.update` — padrão já usado no arquivo
**Done when:**
- Método `updateProfile(userId: string, data: { name?: string; email?: string }): Promise<UserRecord>` adicionado
- Lança `EmailAlreadyInUseError` (importado de `auth.service.ts`) se novo email já pertence a outro usuário
**Gate:** `tsc --noEmit` sem erros em `apps/api`
**Status:** PENDING

---

## T-M5-02 · Criar WorkspaceRepository (apenas settings)

**What:** Métodos para ler e atualizar dados do workspace. Não criar repositório genérico — apenas os dois métodos necessários para M5.
**Where:** `apps/api/src/repositories/workspace.repository.ts`
**Done when:**
- `findById(workspaceId): Promise<WorkspaceRecord>` — retorna todos os campos configuráveis
- `update(workspaceId, data: UpdateWorkspaceData): Promise<WorkspaceRecord>` — atualiza name, razaoSocial, cnpj, telefone, emailContato, endereco, logoUrl
- Tipo `WorkspaceRecord` definido inline no arquivo (sem interface separada — pequeno demais)
- Tipo `UpdateWorkspaceData` = Partial dos campos configuráveis
**Gate:** `tsc --noEmit` sem erros em `apps/api`
**Status:** PENDING

---

## T-M5-03 · Criar `routes/settings.ts` e registrar em `app.ts`

**What:** 5 endpoints de configurações. Todos com `preHandler: authenticate`.
**Where:** `apps/api/src/routes/settings.ts` + edit `apps/api/src/app.ts`
**Depends on:** T-M5-01, T-M5-02
**Endpoints:**

| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | `/settings/workspace` | — | WorkspaceRecord |
| PUT | `/settings/workspace` | name?, razaoSocial?, cnpj?, telefone?, emailContato?, endereco? | WorkspaceRecord |
| PUT | `/settings/profile` | name?, email? | { id, name, email, workspaceId } |
| PUT | `/settings/password` | currentPassword, newPassword | 204 |
| POST | `/settings/workspace/logo` | multipart/form-data (campo `logo`) | { logoUrl } |

**Regras de negócio:**
- `PUT /settings/password`: verificar `currentPassword` com `bcrypt.compare` contra `user.passwordHash`; nova senha: mín. 8 chars, pelo menos 1 número; retornar 400 se senha atual inválida
- `PUT /settings/profile`: rejeitar se email já existe em outro usuário (409)
- `POST /settings/workspace/logo`: validar MIME (`image/png`, `image/jpeg`) e tamanho (≤ 2 MB) no servidor; chamar `storage.uploadFile` se `STORAGE_ENDPOINT` configurado, retornar 503 com `{ error: "Armazenamento não configurado" }` se não
- Zod para validação dos bodies

**Done when:** Todos os endpoints respondem corretamente; `app.ts` registra `settingsRoutes` e tag "Configurações" no Swagger
**Gate:** `tsc --noEmit` sem erros em `apps/api`
**Status:** PENDING

---

## T-M5-04 · Criar `apps/web/lib/settings.ts`

**What:** Client API tipado para todos os endpoints de settings. Mesmo padrão de `lib/obras.ts` — funções que chamam `api.get/post/put`.
**Where:** `apps/web/lib/settings.ts`
**Done when:**
```typescript
export type WorkspaceSettings = { ... }  // todos os campos configuráveis
export type ProfileData = { id, name, email, workspaceId }

export const settingsApi = {
  getWorkspace: () => api.get<WorkspaceSettings>("/settings/workspace"),
  updateWorkspace: (data: Partial<WorkspaceSettings>) => api.put<WorkspaceSettings>("/settings/workspace", data),
  updateProfile: (data: { name?: string; email?: string }) => api.put<ProfileData>("/settings/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<void>("/settings/password", data),
  uploadLogo: (file: File) => {
    const form = new FormData(); form.append("logo", file);
    // usa fetch direto — api.blob não aceita FormData; retorna { logoUrl: string }
  },
}
```
**Gate:** `tsc --noEmit` sem erros em `apps/web`
**Status:** PENDING

---

## T-M5-05 · Criar página `/dashboard/configuracoes/page.tsx`

**What:** Página única de configurações com 3 seções verticais: Perfil, Empresa, Logo da empresa.
**Where:** `apps/web/app/dashboard/configuracoes/page.tsx`
**Depends on:** T-M5-04
**Layout:**
```
h1 Configurações

[Card: Perfil]
  Input Nome
  Input Email
  [Salvar perfil]

[Card: Trocar senha]
  Input Senha atual
  Input Nova senha
  [Alterar senha]

[Card: Dados da empresa]
  Input Nome da empresa
  Input Razão social
  Input CNPJ (máscara: ##.###.###/####-##)
  Input Telefone
  Input Email de contato
  Input Endereço
  [Salvar empresa]

[Card: Logo da empresa]
  Se logoUrl: exibir preview <img>
  Input file (aceita image/png, image/jpeg) + validação 200×200px no cliente
  [Fazer upload]
  Se STORAGE não configurado (campo desabilitado, badge "Em breve")
```

**Pré-carregamento:** ao montar, chama `settingsApi.getWorkspace()` para preencher dados da empresa + logo; chama `/users/me` (já existente) para preencher perfil do usuário.

**Done when:**
- Perfil: salva com toast.success; atualiza nome no AuthContext após salvar
- Senha: limpa campos após sucesso; toast.error("Senha atual incorreta") em 400
- Empresa: salva com toast.success
- Logo: upload funciona se storage configurado; desabilitado se não

**Gate:** `tsc --noEmit` sem erros em `apps/web`
**Status:** PENDING

---

## T-M5-06 · Adicionar link "Configurações" no nav do dashboard

**What:** Adicionar `{ href: "/dashboard/configuracoes", label: "Configurações" }` ao array `NAV_LINKS` em `layout.tsx`. Link ativo quando `pathname.startsWith("/dashboard/configuracoes")`.
**Where:** `apps/web/app/dashboard/layout.tsx`
**Done when:** Link aparece no header ao lado de "Orçamento Rápido"
**Gate:** arquivo salva sem erro TS
**Status:** PENDING

---

## T-M5-07 · lib/storage.ts — upload para S3/R2 [BLOQUEADO]

**What:** Cliente S3 (`@aws-sdk/client-s3`) com `uploadFile(key, buffer, mimeType)`. Guard por `STORAGE_ENDPOINT` env var.
**Where:** `apps/api/src/lib/storage.ts`
**Blocked by:** TODO "Abrir conta no Cloudflare R2 ou AWS S3 antes de T-098" — credenciais não disponíveis
**Workaround ativo:** `POST /settings/workspace/logo` retorna 503 se `STORAGE_ENDPOINT` não configurado
**Done when:** `STORAGE_ENDPOINT`, `STORAGE_KEY`, `STORAGE_SECRET`, `STORAGE_BUCKET` configurados + `@aws-sdk/client-s3` instalado
**Status:** BLOCKED

---

## Ordem de execução

1. **[P]** T-M5-01 + T-M5-02 + T-M5-04 + T-M5-06 — paralelo (sem dependências entre si)
2. T-M5-03 — depende de T-M5-01 e T-M5-02
3. T-M5-05 — depende de T-M5-03 e T-M5-04

---

## Critério de pronto do M5

[ ] Atualizar nome e email → recarregar página → dados persistidos
[ ] Trocar senha → logout → login com nova senha → sucesso
[ ] Preencher dados da empresa → gerar PDF de orçamento rápido → razão social aparece no PDF
[ ] Link "Configurações" no nav funciona
[ ] Logo upload desabilitado (badge "Em breve") — ativado quando T-M5-07 concluído
