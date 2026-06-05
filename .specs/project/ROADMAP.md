# Roadmap

**Current Milestone:** MVP v1.0
**Status:** Planning

---

## MVP v1.0 — Produto funcional para primeiros usuários

**Goal:** Usuário consegue criar conta, cadastrar obra, gerar orçamento em PDF e registrar gastos sem assistência.
**Target:** Critério de saída — fluxo completo funcionando em produção com conta real.

### Features

**M1 — Autenticação** - PLANNED

- Cadastro com email + senha (RF-01)
- Slot para Google OAuth preparado (RF-02)
- Recuperação de senha via email (RF-04)
- Workspace criado automaticamente no cadastro (RF-06)
- Sessões com JWT 7 dias + refresh 30 dias (RF-05, RNF-06)

**M2 — Obras** - PLANNED

- CRUD completo de obras com campos opcionais (RF-07, RF-08)
- Controle de status: Planejamento → Em execução → Concluída / Pausada (RF-09)
- Listagem com resumo financeiro por obra (RF-10)
- Soft delete / arquivamento (RF-11)
- Tela de detalhe com cards financeiros (RF-12)

**M3 — Orçamentos** - PLANNED

- Criação de orçamento vinculado a uma obra (RF-13, RF-14)
- Editor de itens com total em tempo real (RF-15, RF-16, RF-17)
- Duplicação de orçamento com versão incremental (RF-18)
- Geração de PDF profissional no servidor (RF-19, RF-20) — **wow moment**
- Alteração manual de status (RF-21)

**M4 — Controle financeiro** - PLANNED

- Registro de gastos por obra (RF-22, RF-23)
- Listagem com filtros por categoria e período (RF-24)
- Relatório com gráficos (barras + linha) e comparativo orçado vs. realizado (RF-25)
- Alerta visual quando gastos ultrapassam 80% do contrato (RF-26)
- Exportação CSV (RF-27)

**M5 — Configurações** - PLANNED

- Atualização de perfil: nome, email, senha (RF-28)
- Dados da empresa: nome, CNPJ, telefone, email, endereço (RF-29)
- Upload de logo PNG/JPG máx. 2 MB — usada no PDF (RF-30)

**Fase 0 — Fundação (infraestrutura)** - PLANNED

- Monorepo Turborepo: apps/web (Next.js) + apps/api (Express) + packages/db + packages/shared
- Schema Prisma completo com todas as entidades e migrations
- Middleware de API: cors, helmet, rate limiting, error handler
- shadcn/ui configurado com componentes base

**Fase 6 — Polish e lançamento** - PLANNED

- Validação de input com Zod em todos os endpoints
- Rate limiting nas rotas de auth (10 req/min/IP)
- Audit de segurança: workspace isolation em todas as queries
- Sentry para captura de erros
- Empty states e loading skeletons em todas as telas
- Responsividade testada em 375px
- Deploy: Railway (API + Postgres) + Vercel (frontend)
- Landing page + Política de privacidade + Termos de uso (LGPD)

---

## v1.1 — Validação e retenção

**Goal:** Aumentar engajamento e reduzir churn dos primeiros usuários.

### Features

**Lista de materiais** - PLANNED
**Cadastro de fornecedores** - PLANNED
**Link público do orçamento** - PLANNED
**Notificações por email** - PLANNED

---

## v1.2 — Crescimento

**Goal:** Adquirir novos usuários e converter freemium → Pro.

### Features

**Dashboard consolidado (todas as obras)** - PLANNED
**Templates de orçamento por tipo de serviço** - PLANNED
**Integração de pagamentos (Asaas/Pagar.me — Pix/Boleto)** - PLANNED

---

## v2.0 — Times e escala

**Goal:** Habilitar uso por equipes e expandir canais.

### Features

**Multiusuário por workspace (convite de membros, roles)** - PLANNED
**App mobile (React Native ou PWA)** - PLANNED
**Integração com WhatsApp Business** - PLANNED
**Histórico de preços de materiais** - PLANNED

---

## Future Considerations

- API pública para integrações de terceiros
- Cronograma de obra (Gantt)
- Importação de planilhas existentes
- Portal do cliente para visualização de orçamentos sem login
