# Feature Spec — Landing Page (LP)

**ID:** LP
**Status:** DONE (2026-06-07)
**Tasks:** tasks.md
**Depends on:** nenhum (rota pública)

---

## Objetivo

Página de entrada do PRUMO para usuários não autenticados. Deve comunicar o valor do produto em segundos, gerar confiança e converter visitantes em cadastros via "Começar grátis". O gatilho emocional central é o **wow moment do PDF em 3 minutos**.

## Referências de Design

- **Pora** (usepora.com.br): copy direto ao ponto, trust signals fortes ("14 dias grátis · Sem fidelidade"), seções de dor antes de features, FAQ com WhatsApp
- **AbacatePay** (abacatepay.com): headline curta + punchline, múltiplos CTAs por estágio da jornada, transparência de preços explícita

## Requisitos

| ID    | Requisito |
|-------|-----------|
| LP-01 | Navbar fixa: logo PRUMO + links âncora (Funcionalidades, Preços) + CTA "Começar grátis" |
| LP-02 | Hero: headline principal, subheadline, CTA primário e trust signal |
| LP-03 | Seção de dor: 3 cards com os problemas que o público reconhece |
| LP-04 | Seção de features: 3 cards (Obras, Orçamentos PDF, Controle Financeiro) com ícone e descrição |
| LP-05 | Como funciona: 3 passos numerados com visual de timeline |
| LP-06 | Pricing: cards Gratuito e Pro lado a lado com lista de limites e CTAs |
| LP-07 | FAQ: 5 perguntas em accordion |
| LP-08 | CTA final: headline emocional + botão "Criar conta grátis" |
| LP-09 | Footer: links de produto, legal e contato |
| LP-10 | Middleware atualizado: rota `/` é pública (landing); usuário autenticado vendo `/` vai para `/dashboard` |
| LP-11 | Responsivo de 375px a 1440px — mobile-first |
| LP-12 | Fonte Inter (`next/font/google`) aplicada globalmente via variável CSS `--font-inter` |
| LP-13 | Animações com `motion` (v12): headline do hero em loop contínuo palavra-a-palavra; seções com `AnimateIn` (IntersectionObserver + CSS transition) |

---

## Copy & Conteúdo

### Navbar
- Logo: **PRUMO**
- Links: Funcionalidades · Preços
- CTA: "Começar grátis" → `/register`

### Hero
- **Headline:** "Seu primeiro orçamento profissional em menos de 3 minutos"
- **Sub:** "Gestão completa de obras para engenheiros e empreiteiros. Chega de planilha e WhatsApp."
- **CTA primário:** "Criar conta grátis" → `/register`
- **CTA secundário:** "Ver como funciona" (scroll âncora)
- **Trust:** "Grátis para começar · Sem cartão de crédito · Cancele quando quiser"

### Seção de Dor
- **Headline:** "Você ainda gerencia obras assim?"
- Card 1: "Orçamentos no Word que parecem amadores" / Clientes pedem desconto porque não confiam no profissionalismo do documento.
- Card 2: "Custo real só você sabe quando a obra termina" / Sem visibilidade, você descobre o prejuízo no final.
- Card 3: "Dados espalhados em planilha, WhatsApp e caderninho" / Uma hora de procurar onde anotou aquele gasto.

### Features
- **Headline:** "Tudo que você precisa, sem curva de aprendizado"
- Feature 1 — **Gestão de Obras**: Cadastre obras, acompanhe status (Planejamento → Em execução → Concluída) e monitore o custo em tempo real.
- Feature 2 — **Orçamentos em PDF**: Monte o orçamento com itens por categoria e gere um PDF com a sua logo em segundos. Envie para o cliente direto pelo WhatsApp.
- Feature 3 — **Controle Financeiro**: Registre cada gasto e veja um gráfico de orçado vs. realizado. Alerta automático quando os gastos passam de 80% do contrato.

### Como Funciona
- **Headline:** "Comece em 3 passos"
- Passo 1: **Crie sua conta** — Workspace configurado automaticamente. Nenhum dado de cartão necessário.
- Passo 2: **Cadastre sua obra** — Nome, cliente, valor do contrato e data de início. Pronto em 30 segundos.
- Passo 3: **Gere o orçamento** — Adicione itens, veja o total em tempo real e exporte o PDF profissional.

### Pricing
- **Headline:** "Simples e transparente"
- **Sub:** "Comece grátis. Escale quando precisar."

**Gratuito**
- 2 obras ativas
- 5 orçamentos por mês
- PDF sem logo da empresa
- Controle financeiro básico
- CTA: "Começar grátis"

**Pro — R$ 89/mês** (destaque — "Mais popular")
- Obras ilimitadas
- Orçamentos ilimitados
- PDF com logo da sua empresa
- Controle financeiro completo com gráficos
- Exportação CSV
- Suporte prioritário
- CTA: "Assinar Pro"

### FAQ
1. "Preciso de cartão de crédito para criar conta?" → Não. O plano gratuito não exige cartão. Você só paga se decidir assinar o Pro.
2. "O PDF realmente parece profissional?" → Sim. O PDF inclui a logo da sua empresa (plano Pro), dados do cliente, tabela de itens organizada por categoria, subtotais e total geral.
3. "Funciona no celular?" → Funciona. O PRUMO é responsivo e pensado para uso na obra — de iPhone SE a desktop.
4. "Como funciona o controle de gastos?" → Você registra cada gasto na obra (material, mão de obra, equipamento). O sistema calcula automaticamente o quanto foi gasto vs. orçado e exibe um gráfico comparativo.
5. "Posso cancelar quando quiser?" → Sim. Sem fidelidade, sem multa. Se cancelar, volta para o plano gratuito automaticamente.

### CTA Final
- **Headline:** "Pare de perder contratos por orçamentos mal formatados"
- **Sub:** "Junte-se a profissionais que já gerenciam obras com mais controle e mais profissionalismo."
- CTA: "Criar conta grátis" → `/register`

### Footer
- Produto: Funcionalidades · Preços
- Legal: Política de Privacidade · Termos de Uso
- Contato: contato@prumo.com.br

---

## Estrutura de arquivos

```
apps/web/
  app/
    page.tsx                          ← rota raiz: landing (unauth) ou redirect /dashboard (auth)
  components/
    landing/
      navbar.tsx
      hero.tsx
      problem-section.tsx
      features-section.tsx
      how-it-works.tsx
      pricing-section.tsx
      faq-section.tsx
      cta-final.tsx
      footer.tsx
  middleware.ts                       ← adicionar "/" como rota pública
```

## Design Tokens

- **Cores primárias:** usar as variáveis CSS do shadcn/ui já configurado (preset Nova)
- **Tipografia:** Geist (já configurado via shadcn Nova)
- **Ícones:** Lucide (já instalado)
- **Componentes:** Card, Badge, Button, Separator do shadcn/ui
- **Animações:** nenhuma no MVP — sem Framer Motion ou libs extras

## Critério de pronto

- [ ] `/` abre a landing page para usuário não autenticado
- [ ] `/` redireciona para `/dashboard` para usuário autenticado
- [ ] Todas as 9 seções renderizam sem erro
- [ ] CTA "Começar grátis" leva para `/register`
- [ ] Responsivo: 375px mobile sem scroll horizontal
- [ ] Build passa sem erros de TypeScript
