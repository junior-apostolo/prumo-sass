# PRUMO — Plataforma de Gestão de Obras

**Vision:** microSaaS web para engenheiros, empreiteiros e prestadores de serviço da construção civil gerenciarem obras, gerarem orçamentos profissionais e controlarem gastos — simples o suficiente para funcionar sem treinamento.

**For:** Engenheiros autônomos, gestores de pequenas construtoras, empreiteiros e prestadores de serviço (elétrica, hidráulica, pintura etc.) no mercado brasileiro.

**Solves:** Profissionais da construção civil gerenciam obras em planilhas, cadernos e WhatsApp — sem visibilidade financeira em tempo real, mandando orçamentos mal formatados e perdendo contratos por falta de profissionalismo.

## Goals

- Usuário consegue gerar o primeiro PDF profissional em menos de 3 minutos (wow moment / gatilho de conversão)
- Engenheiro tem visibilidade consolidada de custo por obra: orçado vs. realizado em tempo real
- Produto funciona sem onboarding ou manual — zero curva de aprendizado

## Tech Stack

**Core:**

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: PostgreSQL (via Railway)
- ORM: Prisma
- Backend: Node.js + Express (API REST separada)

**Key dependencies:** Tailwind CSS + shadcn/ui, NextAuth.js, @react-pdf/renderer, Recharts, Turborepo (monorepo)

**Hospedagem:** Vercel (frontend) + Railway (API + Postgres)

**Armazenamento:** Cloudflare R2 ou AWS S3 (logo da empresa, comprovantes)

## Scope

**v1.0 inclui:**

- M1 — Auth: cadastro, login, recuperação de senha, workspace automático
- M2 — Obras: CRUD, controle de status, resumo financeiro por obra
- M3 — Orçamentos: criação com itens, geração de PDF profissional no servidor
- M4 — Controle financeiro: registro de gastos, relatório com gráficos, exportação CSV
- M5 — Configurações: perfil do usuário, dados da empresa, upload de logo

**Explicitamente fora de escopo (v1.0):**

- Multiusuário / times por workspace
- Integração de pagamentos (cobrança dos usuários)
- Aplicativo mobile nativo
- Cadastro de fornecedores como entidade própria
- Lista de materiais com controle de estoque
- Cronograma de obra (Gantt)
- Importação de planilhas
- Integração com WhatsApp
- Portal do cliente (link público de orçamento)
- API pública

## Constraints

- **Recursos:** Solo dev/founder — sem equipe
- **Modelo de negócio:** Freemium — plano gratuito (2 obras, 5 orçamentos/mês) + Pro (R$ 89/mês, ilimitado)
- **Multitenancy MVP:** 1 conta = 1 workspace isolado. `workspace_id` em todas as tabelas para preparar multi-user (v2)
- **Segurança:** Toda requisição autenticada valida `workspace_id` — nunca confiar apenas no ID da URL
- **Mobile:** Responsivo de 375px (iPhone SE) até 1440px — 3G usável na obra
