# TASKS — Plataforma de Gestão de Obras
**Versão:** 0.1.0  
**Gerado em:** 2026-06-05  
**Método:** Spec Driven Development (SDD)  
**Referência:** spec.md v0.1.0

> Cada task é atômica: tem entrada clara, saída verificável e não depende de trabalho não listado acima dela na mesma trilha. Marque com `[x]` ao concluir. Nunca inicie uma task sem que suas dependências estejam marcadas.

---

## Índice

- [Fase 0 — Fundação](#fase-0--fundação)
- [Fase 1 — M1 Auth](#fase-1--m1-auth)
- [Fase 2 — M2 Obras](#fase-2--m2-obras)
- [Fase 3 — M3 Orçamentos](#fase-3--m3-orçamentos)
- [Fase 4 — M4 Controle financeiro](#fase-4--m4-controle-financeiro)
- [Fase 5 — M5 Configurações](#fase-5--m5-configurações)
- [Fase 6 — Polish e lançamento](#fase-6--polish-e-lançamento)

---

## Fase 0 — Fundação

> Infraestrutura, monorepo e ambiente. Sem código de produto aqui. Entregável: `npm run dev` funciona nos dois apps.

### 0.1 Monorepo

- [ ] **T-001** Inicializar repositório Git com `.gitignore` para Node, Next.js e `.env`
- [ ] **T-002** Configurar Turborepo: criar `package.json` raiz com `workspaces` apontando para `apps/*` e `packages/*`
- [ ] **T-003** Criar app `apps/web` com `create-next-app` (TypeScript, App Router, Tailwind)
- [ ] **T-004** Criar app `apps/api` com Express + TypeScript (`tsconfig`, `nodemon`, `ts-node`)
- [ ] **T-005** Criar package `packages/shared` com tipos TypeScript base (exporta interfaces vazias por ora)
- [ ] **T-006** Criar package `packages/db` com Prisma: instalar dependências, criar `schema.prisma` vazio, configurar `DATABASE_URL` via `.env`
- [ ] **T-007** Verificar que `turbo run dev` sobe `web` e `api` em paralelo sem erros

### 0.2 Banco de dados

- [ ] **T-008** `packages/db`: adicionar modelo `Workspace` no schema Prisma (campos da spec seção 6)
- [ ] **T-009** Adicionar modelo `User` com relação para `Workspace`
- [ ] **T-010** Adicionar enum `UserRole` (OWNER, MEMBER)
- [ ] **T-011** Adicionar modelo `Obra` com enum `ObraStatus`
- [ ] **T-012** Adicionar modelos `Orcamento`, `ItemOrcamento` com enums
- [ ] **T-013** Adicionar modelo `Gasto` com enum `ItemCategoria`
- [ ] **T-014** Rodar `prisma migrate dev --name init` e verificar que todas as tabelas são criadas
- [ ] **T-015** Criar `packages/db/src/client.ts` exportando instância singleton do PrismaClient
- [ ] **T-016** Criar seed (`packages/db/prisma/seed.ts`) com 1 workspace, 1 user, 1 obra, 2 itens de orçamento e 3 gastos para desenvolvimento

### 0.3 Infraestrutura de API

- [ ] **T-017** `apps/api`: configurar middleware global: `cors`, `helmet`, `express.json()`, `morgan` (log de requests)
- [ ] **T-018** Criar estrutura de pastas: `src/routes/`, `src/controllers/`, `src/middlewares/`, `src/services/`, `src/lib/`
- [ ] **T-019** Criar `src/lib/prisma.ts` importando o client de `packages/db`
- [ ] **T-020** Criar helper `src/lib/apiResponse.ts` com funções `ok(res, data)`, `created(res, data)`, `noContent(res)`, `badRequest(res, message)`, `unauthorized(res)`, `forbidden(res)`, `notFound(res)`, `serverError(res, err)`
- [ ] **T-021** Criar middleware `src/middlewares/errorHandler.ts` capturando erros não tratados e logando no console (Sentry depois)
- [ ] **T-022** Criar rota `GET /health` retornando `{ status: "ok", timestamp }` — usada para uptime check
- [ ] **T-023** Verificar que `apps/api` responde na porta 3001 e `apps/web` na 3000

### 0.4 Infraestrutura de Frontend

- [ ] **T-024** `apps/web`: instalar e configurar `shadcn/ui` (`npx shadcn-ui@latest init`)
- [ ] **T-025** Adicionar componentes base do shadcn: `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`, `form`, `table`, `badge`, `separator`, `toast`
- [ ] **T-026** Criar `src/lib/api.ts`: wrapper em torno de `fetch` com base URL da API, headers padrão e tratamento de erro padronizado
- [ ] **T-027** Criar layout raiz `app/layout.tsx` com fonte, Toaster e providers globais
- [ ] **T-028** Criar página `app/page.tsx` com placeholder "Em construção" para confirmar que o roteamento funciona

---

## Fase 1 — M1 Auth

> Entregável: usuário consegue criar conta, fazer login e acessar área autenticada. RF-01 a RF-06.

### 1.1 Backend — Auth

- [ ] **T-029** Instalar dependências: `bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`
- [ ] **T-030** Criar `src/lib/jwt.ts` com funções `signAccessToken(userId)` (expira 7d) e `verifyAccessToken(token)`. Ler segredo de `JWT_SECRET` no `.env`
- [ ] **T-031** Criar `src/lib/password.ts` com funções `hashPassword(plain)` e `comparePassword(plain, hash)` usando bcrypt com 12 rounds
- [ ] **T-032** Criar `src/middlewares/authenticate.ts`: lê header `Authorization: Bearer <token>`, verifica JWT, injeta `req.user = { id, workspaceId }`. Retorna 401 se inválido
- [ ] **T-033** Criar `src/services/authService.ts`:
  - `register(name, email, password)`: valida unicidade de email, cria Workspace + User atomicamente em transaction, retorna tokens
  - `login(email, password)`: valida credenciais, retorna tokens
- [ ] **T-034** Criar `src/controllers/authController.ts` com handlers `register` e `login` chamando o service
- [ ] **T-035** Criar `src/routes/auth.ts`: `POST /auth/register` e `POST /auth/login`
- [ ] **T-036** Montar rota no `app.ts`: `app.use('/auth', authRouter)`
- [ ] **T-037** Testar manualmente com curl ou Insomnia: register cria user + workspace, login retorna JWT, token inválido retorna 401

### 1.2 Frontend — Auth

- [ ] **T-038** Instalar `js-cookie` e `@types/js-cookie` para persistir o token no cliente
- [ ] **T-039** Criar `src/lib/auth.ts` no web: funções `saveToken(token)`, `getToken()`, `clearToken()` e `isAuthenticated()`
- [ ] **T-040** Criar `src/hooks/useAuth.ts`: hook que expõe `user`, `login(email, password)`, `register(name, email, password)`, `logout()` e estado `isLoading`
- [ ] **T-041** Criar layout de auth `app/(auth)/layout.tsx`: tela centralizada com logo e card — sem navbar
- [ ] **T-042** Criar página `app/(auth)/login/page.tsx`: form com email + senha, link para cadastro, chama `useAuth().login`, redireciona para `/dashboard` em caso de sucesso
- [ ] **T-043** Criar página `app/(auth)/register/page.tsx`: form com nome + email + senha + confirmação de senha, chama `useAuth().register`
- [ ] **T-044** Criar middleware Next.js `middleware.ts` na raiz: redireciona rotas `/dashboard/*` para `/login` se não houver token válido; redireciona `/login` e `/register` para `/dashboard` se já autenticado
- [ ] **T-045** Criar layout autenticado `app/(app)/layout.tsx`: sidebar com navegação (Obras, Configurações), header com nome do usuário e botão de logout
- [ ] **T-046** Criar página `app/(app)/dashboard/page.tsx` com placeholder "Bem-vindo, [nome]"
- [ ] **T-047** Teste E2E manual: criar conta → ver dashboard → fechar aba → reabrir → ainda autenticado → logout → redirecionado para login

---

## Fase 2 — M2 Obras

> Entregável: CRUD completo de obras com resumo financeiro. RF-07 a RF-12.

### 2.1 Backend — Obras

- [ ] **T-048** Criar `src/services/obraService.ts`:
  - `listObras(workspaceId)`: retorna obras com `totalGasto` e `totalOrcado` calculados via Prisma aggregations
  - `getObra(id, workspaceId)`: valida pertencimento ao workspace, retorna obra com resumo financeiro
  - `createObra(workspaceId, data)`: cria obra
  - `updateObra(id, workspaceId, data)`: valida pertencimento, atualiza
  - `archiveObra(id, workspaceId)`: soft delete via campo `archivedAt`
- [ ] **T-049** Adicionar campo `archivedAt DateTime?` no modelo `Obra` do schema Prisma + migration
- [ ] **T-050** Criar `src/controllers/obraController.ts` com handlers para cada operação do service
- [ ] **T-051** Criar `src/routes/obras.ts` com rotas protegidas pelo middleware `authenticate`:
  - `GET    /obras`
  - `POST   /obras`
  - `GET    /obras/:id`
  - `PUT    /obras/:id`
  - `PATCH  /obras/:id/status`
  - `DELETE /obras/:id` (archive)
- [ ] **T-052** Garantir que todos os services filtram por `workspaceId` — nunca confiar apenas no `:id` da URL (RNF-04)
- [ ] **T-053** Testar: criar obra, listar, editar, mudar status, arquivar. Verificar que uma obra de outro workspace não é acessível

### 2.2 Frontend — Obras

- [ ] **T-054** Criar `src/hooks/useObras.ts` com funções que chamam a API e gerenciam estado local (sem biblioteca de cache no MVP — `useState` + `useEffect` basta)
- [ ] **T-055** Criar página `app/(app)/obras/page.tsx`: listagem de obras com cards mostrando nome, cliente, status (badge colorido), valor contratado, barra de progresso de gastos
- [ ] **T-056** Criar componente `ObraCard.tsx`: card clicável, badge de status com cor por estado, barra de progresso vermelha quando > 80%
- [ ] **T-057** Criar componente `NovaObraDialog.tsx`: dialog com form (nome obrigatório, demais opcionais), validação inline, chama API ao submeter
- [ ] **T-058** Criar página `app/(app)/obras/[id]/page.tsx`: detalhe da obra com tabs (Resumo, Orçamentos, Gastos)
  - Tab Resumo: cards financeiros (contratado, orçado, gasto, saldo) + dados cadastrais da obra
- [ ] **T-059** Criar componente `EditarObraSheet.tsx`: slide-over lateral para editar dados da obra
- [ ] **T-060** Criar componente `AlterarStatusObra.tsx`: dropdown para mudar status com confirmação se regredindo status
- [ ] **T-061** Implementar confirmação de arquivamento com `AlertDialog` do shadcn
- [ ] **T-062** Adicionar rota de obras na sidebar do layout autenticado
- [ ] **T-063** Teste manual: criar obra → ver na lista → entrar no detalhe → editar → mudar status → arquivar → sumir da lista principal

---

## Fase 3 — M3 Orçamentos

> Entregável: criação de orçamento com itens, PDF profissional gerado no servidor. RF-13 a RF-21.

### 3.1 Backend — Orçamentos

- [ ] **T-064** Criar `src/services/orcamentoService.ts`:
  - `listOrcamentos(obraId, workspaceId)`
  - `getOrcamento(id, workspaceId)`: inclui itens ordenados por `ordem`
  - `createOrcamento(obraId, workspaceId, data)`
  - `updateOrcamento(id, workspaceId, data)`: atualiza cabeçalho
  - `upsertItens(orcamentoId, workspaceId, itens)`: recebe array completo de itens, deleta os removidos, cria/atualiza os demais
  - `duplicarOrcamento(id, workspaceId)`: copia orçamento como nova versão (versao + 1)
  - `updateStatus(id, workspaceId, status)`
- [ ] **T-065** Criar `src/controllers/orcamentoController.ts`
- [ ] **T-066** Criar `src/routes/orcamentos.ts`:
  - `GET    /obras/:obraId/orcamentos`
  - `POST   /obras/:obraId/orcamentos`
  - `GET    /orcamentos/:id`
  - `PUT    /orcamentos/:id`
  - `PUT    /orcamentos/:id/itens`
  - `POST   /orcamentos/:id/duplicar`
  - `PATCH  /orcamentos/:id/status`
- [ ] **T-067** Testar: criar orçamento, adicionar itens, editar, duplicar, checar que `versao` incrementa corretamente

### 3.2 Geração de PDF

> Decisão DA-02: usar `@react-pdf/renderer` — roda em Node sem Chrome headless, mais simples de deployar no Railway.

- [ ] **T-068** Instalar `@react-pdf/renderer` no `apps/api`
- [ ] **T-069** Criar `src/templates/pdf/OrcamentoPDF.tsx`: componente React PDF com:
  - Cabeçalho: logo do workspace (se existir), nome da empresa, dados de contato
  - Dados da obra: nome, cliente, endereço
  - Tabela de itens: descrição, unidade, qtd, valor unitário, total — com zebra de linhas
  - Subtotal por categoria
  - Total geral em destaque
  - Rodapé: validade, observações, "Gerado em [data]"
- [ ] **T-070** Criar `src/services/pdfService.ts`: função `generateOrcamentoPDF(orcamentoId, workspaceId)` que busca os dados e renderiza o PDF como `Buffer`
- [ ] **T-071** Criar rota `GET /orcamentos/:id/pdf` que retorna o buffer com headers `Content-Type: application/pdf` e `Content-Disposition: attachment; filename=orcamento-[id].pdf`
- [ ] **T-072** Testar geração de PDF com e sem logo, com múltiplas categorias, com texto longo em descrições

### 3.3 Frontend — Orçamentos

- [ ] **T-073** Na tab "Orçamentos" da página da obra: listar orçamentos com título, versão, status (badge), total e data
- [ ] **T-074** Criar página `app/(app)/obras/[id]/orcamentos/novo/page.tsx`: form de cabeçalho do orçamento (título, validade, observações)
- [ ] **T-075** Criar página `app/(app)/obras/[id]/orcamentos/[orcId]/page.tsx`: editor de orçamento
- [ ] **T-076** Criar componente `TabelaItens.tsx`: tabela editável de itens com:
  - Linha de adição de novo item no final
  - Campos inline: descrição (input), categoria (select), unidade (input curto), quantidade (input numérico), valor unitário (input numérico)
  - Total da linha calculado em tempo real
  - Botão de remover linha
  - Drag-and-drop para reordenar (usar `@dnd-kit/sortable`)
- [ ] **T-077** Criar componente `ResumoOrcamento.tsx`: painel lateral (sticky no desktop) com subtotal por categoria e total geral — atualiza em tempo real conforme edição
- [ ] **T-078** Implementar auto-save: debounce de 1s após última edição, chama `PUT /orcamentos/:id/itens`, exibe indicador "Salvando…" / "Salvo"
- [ ] **T-079** Criar botão "Gerar PDF": chama `GET /orcamentos/:id/pdf`, faz download do blob no navegador. Exibir loading durante geração
- [ ] **T-080** Criar botão "Duplicar orçamento" com confirmação. Redirecionar para o novo orçamento após criação
- [ ] **T-081** Criar componente `AlterarStatusOrcamento.tsx`: select de status com cores por estado
- [ ] **T-082** Teste E2E manual: criar orçamento → adicionar 5 itens de 3 categorias → reordenar → editar valor → gerar PDF → verificar que PDF tem logo, totais corretos e layout profissional

---

## Fase 4 — M4 Controle financeiro

> Entregável: registro de gastos e relatório por obra. RF-22 a RF-27.

### 4.1 Backend — Gastos

- [ ] **T-083** Criar `src/services/gastoService.ts`:
  - `listGastos(obraId, workspaceId, filters)`: aceita filtros `categoria`, `dataInicio`, `dataFim`
  - `createGasto(obraId, workspaceId, data)`
  - `updateGasto(id, workspaceId, data)`
  - `deleteGasto(id, workspaceId)`
  - `getResumoFinanceiro(obraId, workspaceId)`: retorna `{ totalContrato, totalOrcado, totalGasto, saldo, porCategoria: [], porMes: [] }`
  - `exportGastosCSV(obraId, workspaceId, filters)`: retorna string CSV
- [ ] **T-084** Criar `src/controllers/gastoController.ts`
- [ ] **T-085** Criar `src/routes/gastos.ts`:
  - `GET    /obras/:obraId/gastos`
  - `POST   /obras/:obraId/gastos`
  - `PUT    /gastos/:id`
  - `DELETE /gastos/:id`
  - `GET    /obras/:obraId/financeiro/resumo`
  - `GET    /obras/:obraId/financeiro/export`
- [ ] **T-086** Testar: registrar gasto, listar com filtro de categoria, verificar que `totalGasto` no resumo da obra atualiza, testar CSV gerado

### 4.2 Frontend — Controle financeiro

- [ ] **T-087** Na tab "Gastos" da página da obra: listar gastos com filtros de período e categoria
- [ ] **T-088** Criar componente `NovoGastoDialog.tsx`: form com descrição, valor (com máscara BRL), data, categoria (select), fornecedor (input livre)
- [ ] **T-089** Criar componente `GastoRow.tsx`: linha da tabela com botões de editar e excluir inline. Edição abre o mesmo dialog em modo de edição
- [ ] **T-090** Criar tab/página `app/(app)/obras/[id]/relatorio/page.tsx`:
  - Cards de resumo: Contratado / Orçado / Gasto / Saldo (com cor vermelha se saldo negativo)
  - Gráfico de barras: gastos por categoria (usar Recharts `BarChart`)
  - Gráfico de linha: evolução de gastos por mês (Recharts `LineChart`)
  - Tabela de gastos filtrada
- [ ] **T-091** Instalar `recharts` no `apps/web`, criar componente `GraficoGastosPorCategoria.tsx`
- [ ] **T-092** Criar componente `GraficoEvolucaoMensal.tsx`
- [ ] **T-093** Implementar botão "Exportar CSV": chama `GET /obras/:id/financeiro/export`, faz download do arquivo
- [ ] **T-094** Implementar alerta visual de 80%: no `ObraCard.tsx` e na tab Resumo, exibir badge "Atenção: 83% do contrato consumido" quando `totalGasto / valorContrato > 0.8`
- [ ] **T-095** Teste manual: registrar 10 gastos de categorias diferentes → ver gráfico → filtrar por período → exportar CSV → verificar alerta de 80% aparece quando esperado

---

## Fase 5 — M5 Configurações

> Entregável: usuário atualiza perfil e dados da empresa com logo. RF-28 a RF-30.

### 5.1 Backend — Configurações

- [ ] **T-096** Criar `src/services/workspaceService.ts`:
  - `getWorkspace(workspaceId)`
  - `updateWorkspace(workspaceId, data)`: atualiza nome, CNPJ, telefone, email, endereço
  - `updateLogo(workspaceId, fileBuffer, mimeType)`: faz upload para R2/S3, salva URL no banco
- [ ] **T-097** Criar `src/services/userService.ts`:
  - `updateProfile(userId, data)`: atualiza nome e email (validar unicidade)
  - `updatePassword(userId, currentPassword, newPassword)`: valida senha atual antes de trocar
- [ ] **T-098** Configurar cliente de armazenamento: instalar `@aws-sdk/client-s3`, criar `src/lib/storage.ts` com função `uploadFile(key, buffer, mimeType)` retornando URL pública. Ler credenciais do `.env`
- [ ] **T-099** Criar `src/routes/settings.ts` com middleware `multer` para upload:
  - `GET    /settings/workspace`
  - `PUT    /settings/workspace`
  - `POST   /settings/workspace/logo` (multipart, máx 2MB, somente image/png e image/jpeg)
  - `PUT    /settings/profile`
  - `PUT    /settings/password`
- [ ] **T-100** Validar tipo MIME e tamanho no servidor antes de fazer upload (RNF-08)

### 5.2 Frontend — Configurações

- [ ] **T-101** Criar página `app/(app)/configuracoes/page.tsx` com duas seções: Perfil pessoal e Dados da empresa
- [ ] **T-102** Criar `ProfileForm.tsx`: campos nome e email com `react-hook-form` + `zod`, botão salvar
- [ ] **T-103** Criar `PasswordForm.tsx`: campos senha atual, nova senha, confirmação — validação de força mínima (8 chars, 1 número)
- [ ] **T-104** Criar `WorkspaceForm.tsx`: campos nome da empresa, CNPJ (com máscara), telefone, email de contato, endereço
- [ ] **T-105** Criar `LogoUpload.tsx`: área de drag-and-drop (ou clique) para upload da logo, preview imediato, botão de remover. Validar dimensões mínimas (200x200px) no cliente antes de enviar
- [ ] **T-106** Adicionar link "Configurações" na sidebar do layout autenticado
- [ ] **T-107** Teste manual: atualizar nome → trocar senha → fazer login com nova senha → fazer upload de logo → gerar PDF de um orçamento e verificar que a logo aparece

---

## Fase 6 — Polish e lançamento

> Entregável: produto pronto para os primeiros usuários reais.

### 6.1 Qualidade e segurança

- [ ] **T-108** Adicionar validação de input em todos os endpoints da API com `zod` — criar schemas em `src/lib/schemas/` e middleware `validate(schema)`
- [ ] **T-109** Adicionar rate limiting nas rotas de auth: instalar `express-rate-limit`, configurar máx. 10 req/min por IP em `POST /auth/login` e `POST /auth/register` (RNF-07)
- [ ] **T-110** Revisar todos os services e garantir que nenhum query acessa dados de outro workspace — fazer audit completo das cláusulas `where` do Prisma
- [ ] **T-111** Configurar Sentry no `apps/api`: instalar `@sentry/node`, inicializar no `app.ts`, capturar erros não tratados no `errorHandler.ts`
- [ ] **T-112** Adicionar variáveis de ambiente ao `.env.example` com comentários descritivos — nunca commitar `.env` real

### 6.2 UX e estados vazios

- [ ] **T-113** Criar componente `EmptyState.tsx` reutilizável com ícone, título, descrição e CTA opcional
- [ ] **T-114** Aplicar `EmptyState` em: lista de obras (0 obras), lista de orçamentos (0 orçamentos na obra), lista de gastos (0 gastos na obra)
- [ ] **T-115** Criar componente `LoadingState.tsx` com skeleton cards para listagens
- [ ] **T-116** Aplicar loading states em todas as páginas com fetch assíncrono
- [ ] **T-117** Adicionar toast de confirmação para todas as ações de criação, edição e exclusão (`useToast` do shadcn)
- [ ] **T-118** Implementar página `404` customizada com link de volta ao dashboard
- [ ] **T-119** Garantir que todos os formulários bloqueiam o botão de submit durante loading (evitar double-submit)

### 6.3 Responsividade

- [ ] **T-120** Testar e ajustar layout da sidebar em mobile: converter para bottom nav ou hamburger menu em telas < 768px
- [ ] **T-121** Testar `TabelaItens.tsx` em 375px — tornar scroll horizontal no mobile se necessário
- [ ] **T-122** Testar todos os dialogs em mobile — garantir que não ficam cortados
- [ ] **T-123** Testar fluxo completo (criar conta → obra → orçamento → PDF) no Chrome mobile DevTools em iPhone SE (375px)

### 6.4 Deploy

- [ ] **T-124** Configurar projeto no Railway: criar serviço para `apps/api` e banco PostgreSQL, configurar variáveis de ambiente
- [ ] **T-125** Configurar projeto no Vercel: apontar para `apps/web`, configurar variáveis de ambiente com URL da API no Railway
- [ ] **T-126** Rodar `prisma migrate deploy` no ambiente de produção
- [ ] **T-127** Configurar domínio customizado no Vercel (quando nome do produto estiver decidido — DA-01)
- [ ] **T-128** Testar fluxo completo em produção com conta real — não usar seed data
- [ ] **T-129** Configurar backup automático do banco no Railway (ativar nas configurações do serviço)

### 6.5 Landing page

- [ ] **T-130** Criar `app/page.tsx` como landing page com: headline, 3 benefícios principais, screenshot do produto (ou mockup), CTA "Criar conta grátis", link para login
- [ ] **T-131** Criar `app/privacidade/page.tsx` e `app/termos/page.tsx` com texto básico (necessário para Google OAuth e para usuários brasileiros — LGPD)

---

## Checklist de definição de "pronto" por task

Uma task está concluída quando:

1. **Funciona** — o comportamento descrito pode ser demonstrado manualmente
2. **Não quebra** — as tasks dependentes ainda funcionam após a mudança
3. **Está segura** — dados de um workspace não vazam para outro
4. **Trata erros** — estados de erro são exibidos ao usuário (não console.error silencioso)
5. **É responsiva** — funciona em 375px e em 1280px

---

## Dependências críticas entre fases

```
Fase 0 (Fundação)
  └── Fase 1 (Auth)
        └── Fase 2 (Obras)
              ├── Fase 3 (Orçamentos)   ← depende de Obras existirem
              └── Fase 4 (Financeiro)   ← depende de Obras existirem
Fase 1 (Auth)
  └── Fase 5 (Configurações)            ← depende de User + Workspace existirem
Fases 2–5 completas
  └── Fase 6 (Polish + Deploy)
```

**Dentro da Fase 3**, a ordem é obrigatória:
`T-064 → T-065 → T-066` (backend) antes de `T-073 → T-074 → T-075 → T-076` (frontend).
O PDF (`T-068 → T-072`) pode ser desenvolvido em paralelo com o frontend da fase 3, mas o botão de download (`T-079`) só pode ser integrado após `T-071`.

---

*Total de tasks: 131 | Fases: 6 | Estimativa solo dev: 6–10 semanas em tempo parcial*
