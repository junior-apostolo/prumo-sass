# Tasks — Landing Page (LP)

**Milestone:** LP
**Status:** DONE (2026-06-07)
**Spec:** spec.md

---

## Fase A — Infraestrutura + Navbar + Hero

| ID    | Task | Status |
|-------|------|--------|
| LP-T01 | Atualizar `middleware.ts`: adicionar `/` na lista de rotas públicas e redirecionar autenticado em `/` para `/dashboard` | DONE |
| LP-T02 | Criar `apps/web/components/landing/navbar.tsx` — logo, links âncora, CTA "Começar grátis" | DONE |
| LP-T03 | Criar `apps/web/components/landing/hero.tsx` — headline, sub, CTAs duplos, trust signal | DONE |

## Fase B — Conteúdo Central

| ID    | Task | Status |
|-------|------|--------|
| LP-T04 | Criar `apps/web/components/landing/problem-section.tsx` — 3 cards de dor | DONE |
| LP-T05 | Criar `apps/web/components/landing/features-section.tsx` — 3 cards de features com ícone Lucide | DONE |
| LP-T06 | Criar `apps/web/components/landing/how-it-works.tsx` — 3 passos com timeline numerada | DONE |

## Fase C — Conversão + Footer

| ID    | Task | Status |
|-------|------|--------|
| LP-T07 | Criar `apps/web/components/landing/pricing-section.tsx` — cards Gratuito vs Pro com lista de itens | DONE |
| LP-T08 | Criar `apps/web/components/landing/faq-section.tsx` — 5 perguntas em accordion (usar `<details>` nativo ou componente shadcn) | DONE |
| LP-T09 | Criar `apps/web/components/landing/cta-final.tsx` — headline emocional + botão | DONE |
| LP-T10 | Criar `apps/web/components/landing/footer.tsx` — links produto, legal, contato | DONE |

## Fase D — Integração

| ID    | Task | Status |
|-------|------|--------|
| LP-T11 | Atualizar `apps/web/app/page.tsx` — remover redirect, importar e compor todas as seções | DONE |
| LP-T12 | Testar build TypeScript sem erros (`turbo run type-check`) | DONE |
| LP-T13 | Testar responsividade em 375px | DONE |

---

## Fase E — Tipografia e Animações

| ID    | Task | Status |
|-------|------|--------|
| LP-T14 | Substituir Geist por Inter (`next/font/google`) em `layout.tsx` e `globals.css` | DONE |
| LP-T15 | Adicionar `@keyframes fade-up`, `fade-in`, `.scroll-animate` + `scroll-behavior: smooth` em `globals.css` | DONE |
| LP-T16 | Criar `components/landing/animate-in.tsx` — wrapper `"use client"` com IntersectionObserver para animação de entrada nas seções | DONE |
| LP-T17 | Aplicar `animate-fade-up` com delays escalonados nos elementos do hero (badge, sub, CTAs, trust) | DONE |
| LP-T18 | Instalar `motion` v12 e criar `components/landing/hero-headline.tsx` — animação de palavras em loop contínuo com `useAnimation` | DONE |
| LP-T19 | Aplicar `<AnimateIn>` com stagger em cards de ProblemSection, FeaturesSection, HowItWorks, PricingSection e FaqSection | DONE |

---

## Notas de implementação

- **Fonte** — Inter substituiu Geist; variável CSS `--font-inter` usada em `--font-sans`, `--font-mono` e `--font-heading`
- **Accordion do FAQ** — `<details>/<summary>` HTML nativo, estilizado com Tailwind
- **Smooth scroll** — `scroll-behavior: smooth` no seletor `html` em globals.css; âncoras `#funcionalidades`, `#precos`, `#como-funciona`
- **AnimateIn** — usa IntersectionObserver com threshold 0.12; adiciona classe `in-view` que dispara CSS transition; desconecta observer após primeira entrada
- **HeroHeadline** — loop: entrada em stagger (70ms/palavra, blur+fade+slide-up) → pausa 2.8s → saída em stagger reverso (40ms/palavra, slide-up+fade) → pausa 0.3s → reinicia
- **Imagens** — nenhuma no MVP; visual por ícones Lucide, gradientes e tipografia
