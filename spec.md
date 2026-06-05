# SPEC — Plataforma de Gestão de Obras
**Versão:** 0.1.0  
**Data:** 2026-06-05  
**Autor:** Solo founder / dev  
**Método:** Spec Driven Development (SDD)  
**Status:** Draft

---

## Índice

1. [Visão do produto](#1-visão-do-produto)
2. [Problema e contexto](#2-problema-e-contexto)
3. [Usuários e perfis](#3-usuários-e-perfis)
4. [Escopo do MVP](#4-escopo-do-mvp)
5. [Arquitetura e decisões técnicas](#5-arquitetura-e-decisões-técnicas)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Módulos e requisitos funcionais](#7-módulos-e-requisitos-funcionais)
8. [Requisitos não-funcionais](#8-requisitos-não-funcionais)
9. [Fluxos principais](#9-fluxos-principais)
10. [Modelo de negócio](#10-modelo-de-negócio)
11. [Roadmap pós-MVP](#11-roadmap-pós-mvp)
12. [Decisões abertas](#12-decisões-abertas)
13. [Fora de escopo (MVP)](#13-fora-de-escopo-mvp)

---

## 1. Visão do produto

**Uma frase:** Plataforma web para engenheiros, empreiteiros e prestadores de serviço da construção civil gerenciarem obras, gerarem orçamentos profissionais e controlarem gastos — simples o suficiente para funcionar sem treinamento.

**Problema central que resolve:** Profissionais autônomos e pequenas empresas da construção civil gerenciam obras em planilhas, cadernos e WhatsApp. Não têm visibilidade financeira em tempo real, mandam orçamentos mal formatados e perdem contratos por falta de profissionalismo.

**Posicionamento:** microSaaS focado no mercado brasileiro, preço acessível, zero onboarding, mobile-friendly. Não compete com Sienge ou Totvs — compete com a planilha do Google.

---

## 2. Problema e contexto

### Dores mapeadas por perfil

**Engenheiro / Gestor de obras**
- Gerencia múltiplas obras simultaneamente sem visão consolidada de custo
- Não sabe, no momento, quanto já gastou em cada obra vs. o que foi orçado
- Controla materiais e fornecedores no Excel ou em caderno
- Gera orçamentos manualmente, sem template, sem histórico de versões

**Empreiteiro / Prestador de serviços**
- Manda orçamentos no WhatsApp ou em Word sem formatação
- Não tem imagem profissional ao fechar negócio
- Perde oportunidades por não ter um processo claro de aprovação
- Não registra o histórico de orçamentos enviados

### Hipóteses a validar (pré-produto)

- H1: Engenheiros autônomos pagam por uma ferramenta que consolide obras + financeiro em um único lugar
- H2: Empreiteiros pagam para parecer mais profissional na entrega de orçamentos
- H3: O gatilho de compra é a geração do primeiro PDF — o "wow moment"

---

## 3. Usuários e perfis

### Perfil A — Engenheiro / Gestor

| Atributo | Descrição |
|---|---|
| Quem é | Engenheiro civil autônomo ou gestor de pequena construtora |
| Obras simultâneas | 2 a 10 obras ativas |
| Dor principal | Falta de controle financeiro por obra |
| Dispositivo | Desktop no escritório, celular na obra |
| Familiaridade tech | Média — usa Google Sheets, WhatsApp, email |
| Disposição a pagar | R$ 50–200/mês se resolver a dor claramente |

### Perfil B — Empreiteiro / Prestador

| Atributo | Descrição |
|---|---|
| Quem é | Empreiteiro, mestre de obras, prestador autônomo (elétrica, hidráulica, pintura etc.) |
| Volume | 5–20 orçamentos/mês |
| Dor principal | Falta de profissionalismo na apresentação de propostas |
| Dispositivo | Principalmente celular |
| Familiaridade tech | Baixa — não pode ter curva de aprendizado |
| Disposição a pagar | R$ 30–80/mês |

### Decisão de multitenancy

**Recomendação adotada:** Modelo **1 conta = 1 workspace isolado** no MVP.

**Justificativa:** Como dev solo em fase de validação, adicionar multi-usuário por workspace aumenta a complexidade de auth, permissões e billing sem entregar valor comprovado. O perfil-alvo (autônomo) não precisa disso agora. A arquitetura deve ser projetada para suportar times no futuro (coluna `workspace_id` em todas as tabelas), mas a feature de convite fica para v2.

---

## 4. Escopo do MVP

### Incluído no MVP (v1.0)

| Módulo | Descrição resumida |
|---|---|
| Auth | Cadastro, login, recuperação de senha |
| Obras | Cadastro e gestão de projetos/obras |
| Orçamentos | Criação, edição, geração de PDF |
| Controle financeiro | Registro de gastos por obra, relatório simples |
| Configurações | Perfil do usuário, logo da empresa |

### Critério de saída do MVP

O MVP está pronto quando um usuário consegue, sem assistência:
1. Criar uma conta e configurar o perfil
2. Cadastrar uma obra
3. Criar um orçamento com itens e gerar o PDF
4. Registrar gastos na obra e ver o saldo orçado vs. realizado

---

## 5. Arquitetura e decisões técnicas

### Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR nativo, rotas de API, ecossistema React |
| Estilização | Tailwind CSS + shadcn/ui | Rápido de iterar, componentes acessíveis |
| Backend | Node.js + Express (API REST) | Familiar ao dev, simples de manter |
| ORM | Prisma | Type-safe, migrations, excelente DX |
| Banco de dados | PostgreSQL | Relacional, robusto, queries complexas para relatórios |
| Auth | NextAuth.js (credentials + Google OAuth) | Integrado ao Next.js, sem vendor lock-in caro |
| Geração de PDF | Puppeteer (server-side) ou @react-pdf/renderer | PDF fiel ao design, roda no servidor |
| Hospedagem | Vercel (frontend) + Railway (API + Postgres) | Low-ops, pay-as-you-go |
| Armazenamento | Cloudflare R2 ou AWS S3 | Upload de logo, documentos de obra |

### Estrutura de repositório

```
/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── db/           # Prisma schema + migrations
│   └── shared/       # Tipos TypeScript compartilhados
├── package.json      # Turborepo monorepo
└── spec.md           # Este arquivo
```

### Decisões de arquitetura

**Monorepo com Turborepo:** Permite compartilhar tipos entre frontend e backend sem duplicação. Essencial para SDD — o schema do banco vira a fonte de verdade dos tipos.

**API REST separada do Next.js:** Evita acoplamento. A API pode ser consumida futuramente por um app mobile sem mudar nada.

**PDF gerado no servidor:** Garante consistência visual independente do navegador/dispositivo do usuário. O frontend apenas requisita o PDF e faz download.

**Row Level Security preparado:** Mesmo com 1 usuário por workspace no MVP, todas as queries filtram por `workspace_id`. Migrar para multi-user depois é só adicionar a tabela de membros.

---

## 6. Modelo de dados

### Entidades principais

```prisma
// packages/db/schema.prisma

model Workspace {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String?
  createdAt DateTime @default(now())
  
  users     User[]
  obras     Obra[]
}

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String
  passwordHash String?
  role        UserRole  @default(OWNER)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  createdAt   DateTime  @default(now())
}

enum UserRole {
  OWNER
  MEMBER  // reservado para v2
}

model Obra {
  id           String      @id @default(cuid())
  workspaceId  String
  workspace    Workspace   @relation(fields: [workspaceId], references: [id])
  nome         String
  cliente      String?
  endereco     String?
  status       ObraStatus  @default(PLANEJAMENTO)
  valorContrato Decimal?   @db.Decimal(12, 2)
  dataInicio   DateTime?
  dataFim      DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  orcamentos   Orcamento[]
  gastos       Gasto[]
}

enum ObraStatus {
  PLANEJAMENTO
  EM_EXECUCAO
  PAUSADA
  CONCLUIDA
}

model Orcamento {
  id          String          @id @default(cuid())
  obraId      String
  obra        Obra            @relation(fields: [obraId], references: [id])
  titulo      String
  versao      Int             @default(1)
  status      OrcamentoStatus @default(RASCUNHO)
  observacoes String?
  validadeAt  DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  itens       ItemOrcamento[]
}

enum OrcamentoStatus {
  RASCUNHO
  ENVIADO
  APROVADO
  RECUSADO
}

model ItemOrcamento {
  id           String    @id @default(cuid())
  orcamentoId  String
  orcamento    Orcamento @relation(fields: [orcamentoId], references: [id])
  descricao    String
  categoria    ItemCategoria @default(OUTROS)
  unidade      String        @default("un")
  quantidade   Decimal       @db.Decimal(10, 3)
  valorUnitario Decimal      @db.Decimal(12, 2)
  ordem        Int           @default(0)
}

enum ItemCategoria {
  MATERIAL
  MAO_DE_OBRA
  EQUIPAMENTO
  SERVICO
  OUTROS
}

model Gasto {
  id          String        @id @default(cuid())
  obraId      String
  obra        Obra          @relation(fields: [obraId], references: [id])
  descricao   String
  categoria   ItemCategoria @default(OUTROS)
  valor       Decimal       @db.Decimal(12, 2)
  data        DateTime      @default(now())
  fornecedor  String?       // texto livre no MVP; entidade própria na v2
  comprovante String?       // URL do arquivo no storage
  createdAt   DateTime      @default(now())
}
```

### Regras derivadas (calculadas, não armazenadas)

- **Total do orçamento** = `SUM(quantidade * valorUnitario)` dos itens
- **Total gasto na obra** = `SUM(valor)` dos gastos vinculados
- **Saldo** = `valorContrato - totalGasto`
- **Desvio orçamentário** = `(totalGasto / totalOrcamento - 1) * 100`

---

## 7. Módulos e requisitos funcionais

### M1 — Autenticação

**RF-01** O sistema deve permitir cadastro com email + senha.  
**RF-02** O sistema deve permitir login com Google OAuth (opcional no MVP, mas preparar o slot).  
**RF-03** O sistema deve enviar email de verificação após cadastro.  
**RF-04** O sistema deve permitir recuperação de senha via email.  
**RF-05** Sessões devem expirar após 30 dias de inatividade.  
**RF-06** Ao criar conta, um `Workspace` é automaticamente criado para o usuário.

---

### M2 — Obras

**RF-07** O usuário pode criar uma obra com: nome (obrigatório), cliente, endereço, valor do contrato, data de início e data de fim prevista.  
**RF-08** O usuário pode editar qualquer campo da obra a qualquer momento.  
**RF-09** O usuário pode alterar o status da obra (Planejamento → Em execução → Concluída / Pausada).  
**RF-10** A listagem de obras deve exibir: nome, cliente, status, valor contratado, total gasto e percentual consumido.  
**RF-11** O usuário pode arquivar uma obra (soft delete — não aparece na listagem principal mas os dados são mantidos).  
**RF-12** A tela de detalhe da obra exibe um resumo financeiro: valor contratado, total orçado, total gasto e saldo.

---

### M3 — Orçamentos

**RF-13** O usuário pode criar um orçamento vinculado a uma obra existente.  
**RF-14** Um orçamento possui título, status (Rascunho / Enviado / Aprovado / Recusado), validade e observações.  
**RF-15** O usuário pode adicionar, editar, reordenar e remover itens do orçamento.  
**RF-16** Cada item possui: descrição, categoria, unidade, quantidade e valor unitário. O total do item é calculado automaticamente.  
**RF-17** O sistema exibe o subtotal por categoria e o total geral do orçamento em tempo real enquanto o usuário edita.  
**RF-18** O usuário pode duplicar um orçamento existente (gerando versão 2, 3…).  
**RF-19** O sistema deve gerar um PDF do orçamento com: logo da empresa (se cadastrada), dados do workspace, dados da obra, tabela de itens com totais por categoria e total geral, observações e validade.  
**RF-20** O PDF deve ser gerado no servidor e disponibilizado para download.  
**RF-21** O usuário pode alterar o status do orçamento manualmente.

> **Nota de design do PDF:** O PDF é o "wow moment" do produto. Deve ter aparência profissional — tipografia limpa, logo no cabeçalho, rodapé com dados de contato, tabela com zebra de linhas, totais destacados. Usar template HTML → Puppeteer é a abordagem recomendada.

---

### M4 — Controle financeiro

**RF-22** O usuário pode registrar um gasto vinculado a uma obra com: descrição (obrigatório), valor (obrigatório), data, categoria e nome do fornecedor (texto livre).  
**RF-23** O usuário pode editar ou excluir um gasto registrado.  
**RF-24** A listagem de gastos de uma obra deve ser filtrável por categoria e período.  
**RF-25** O sistema deve exibir um relatório por obra com: total gasto por categoria (tabela + gráfico de barras simples), evolução de gastos por mês (linha do tempo) e comparativo orçado vs. realizado.  
**RF-26** O sistema deve alertar visualmente (badge/cor) quando o total gasto ultrapassar 80% do valor contratado.  
**RF-27** O usuário pode exportar a lista de gastos de uma obra em CSV.

---

### M5 — Configurações

**RF-28** O usuário pode atualizar nome, email e senha.  
**RF-29** O usuário pode configurar os dados do workspace: nome da empresa, CNPJ, telefone, email de contato e endereço.  
**RF-30** O usuário pode fazer upload da logo da empresa (PNG/JPG, máx. 2 MB). A logo é usada no PDF dos orçamentos.

---

## 8. Requisitos não-funcionais

### Performance
- **RNF-01** Listagens devem carregar em menos de 1s para até 100 registros.
- **RNF-02** Geração do PDF deve completar em menos de 5s.
- **RNF-03** A aplicação deve ser usável em conexões 3G (mobile na obra).

### Segurança
- **RNF-04** Toda requisição autenticada deve validar que o recurso solicitado pertence ao `workspace_id` do usuário logado. Nunca confiar apenas no ID da URL.
- **RNF-05** Senhas armazenadas com bcrypt (salt rounds ≥ 12).
- **RNF-06** Tokens JWT com expiração de 7 dias; refresh token com 30 dias.
- **RNF-07** Rate limiting nas rotas de auth (máx. 10 tentativas/minuto por IP).
- **RNF-08** Uploads de arquivo validados por tipo MIME e tamanho no servidor (não confiar no cliente).

### Usabilidade
- **RNF-09** A aplicação deve ser responsiva e funcional em telas de 375px (iPhone SE) até 1440px.
- **RNF-10** Formulários devem ter validação inline com mensagens em português claro.
- **RNF-11** Operações destrutivas (excluir obra, excluir orçamento) devem exigir confirmação explícita.
- **RNF-12** O usuário deve conseguir criar seu primeiro orçamento em menos de 3 minutos, sem manual.

### Confiabilidade
- **RNF-13** Backup automático diário do banco de dados (Railway oferece isso nativamente).
- **RNF-14** Logs de erro capturados (Sentry free tier no MVP).

---

## 9. Fluxos principais

### Fluxo 1 — Novo usuário até primeiro PDF

```
1. Acessa landing page → clica "Criar conta grátis"
2. Preenche nome, email, senha → confirma email
3. Onboarding: preenche nome da empresa e faz upload da logo (pode pular)
4. Dashboard vazio → CTA "Criar primeira obra"
5. Preenche dados da obra (nome obrigatório, resto opcional) → salva
6. Na obra → clica "Novo orçamento"
7. Dá título ao orçamento → adiciona itens (descrição + qtd + valor)
8. Visualiza total calculado em tempo real
9. Clica "Gerar PDF" → download do arquivo
     ↳ [WOW MOMENT]
```

### Fluxo 2 — Registro de gasto

```
1. Acessa obra → aba "Gastos"
2. Clica "Registrar gasto"
3. Preenche: descrição, valor, data, categoria, fornecedor (opcional)
4. Salva → gasto aparece na lista
5. Resumo financeiro da obra atualiza automaticamente
6. Se total gasto > 80% do contrato → badge "Atenção" aparece no card da obra
```

### Fluxo 3 — Relatório financeiro

```
1. Acessa obra → aba "Relatório"
2. Seleciona período (padrão: mês atual)
3. Visualiza:
   - Cards: contratado / orçado / gasto / saldo
   - Gráfico de barras: gastos por categoria
   - Tabela: lista de gastos filtrada
4. Clica "Exportar CSV" → download
```

---

## 10. Modelo de negócio

### Planos (MVP)

| | **Gratuito** | **Pro** |
|---|---|---|
| Obras ativas | 2 | ilimitadas |
| Orçamentos/mês | 5 | ilimitados |
| Gastos registrados | 20/obra | ilimitados |
| PDF sem logo própria | ✓ | ✓ |
| PDF com logo própria | ✗ | ✓ |
| Exportação CSV | ✗ | ✓ |
| Suporte | comunidade | email |
| **Preço** | **R$ 0** | **R$ 89/mês** |

**Lógica do freemium:** O plano gratuito é funcional o suficiente para validar o produto mas limitado o suficiente para converter. A logo no PDF é o principal gatilho de upgrade para o Perfil B (empreiteiro). O limite de obras converte o Perfil A (engenheiro).

### Pagamentos (v2)
Integração com Asaas ou Pagar.me para suportar Pix e boleto — mais comuns no público-alvo do que cartão de crédito. No MVP, cobrança manual ou Stripe com cartão.

---

## 11. Roadmap pós-MVP

### v1.1 — Validação e retenção
- [ ] Lista de materiais vinculada ao orçamento
- [ ] Cadastro de fornecedores (entidade própria)
- [ ] Link público do orçamento (cliente visualiza sem login)
- [ ] Notificações por email (obra próxima do prazo, orçamento aprovado)

### v1.2 — Crescimento
- [ ] Dashboard consolidado (todas as obras em um painel)
- [ ] Templates de orçamento por tipo de serviço
- [ ] Integração de pagamentos (Asaas/Pagar.me)

### v2.0 — Times e escala
- [ ] Multiusuário por workspace (convite de membros, roles)
- [ ] App mobile (React Native ou PWA)
- [ ] Integração com WhatsApp Business para envio de orçamento
- [ ] Histórico de preços de materiais

---

## 12. Decisões abertas

| ID | Decisão | Opções | Prazo para decidir |
|---|---|---|---|
| DA-01 | Nome do produto | A definir | Antes do domínio |
| DA-02 | Biblioteca de PDF | Puppeteer vs. @react-pdf/renderer | Antes de M3 |
| DA-03 | Estratégia de deploy do Puppeteer | Railway com Chrome headless vs. serviço externo (Browserless.io) | Antes de M3 |
| DA-04 | Google OAuth no MVP | Incluir ou deixar para v1.1? | Antes de M1 |
| DA-05 | Estratégia de email transacional | Resend vs. Postmark vs. SES | Antes de M1 |
| DA-06 | Gráficos no relatório | Recharts vs. Chart.js vs. imagem gerada no servidor | Antes de M4 |

---

## 13. Fora de escopo (MVP)

Os itens abaixo foram explicitamente excluídos do v1.0 para manter o foco. Qualquer mudança nessa lista requer atualização desta spec.

- Multiusuário / times por workspace
- Integração de pagamentos (cobrança dos usuários)
- Aplicativo mobile nativo
- Cadastro de fornecedores como entidade (apenas texto livre no gasto)
- Lista de materiais com controle de estoque
- Cronograma de obra (Gantt)
- Importação de planilhas
- Integração com WhatsApp
- Relatórios em PDF (apenas CSV no MVP)
- Portal do cliente (link público de orçamento)
- API pública

---

*Este documento é a fonte de verdade do projeto. Qualquer feature, endpoint ou componente que não esteja especificado aqui não deve ser construído sem antes atualizar esta spec.*
