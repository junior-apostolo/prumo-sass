# PRUMO — Instruções do Projeto

## Stack

- **Monorepo:** Turborepo — `apps/web` (Next.js 15), `apps/api` (Fastify 5), `packages/db` (Prisma), `packages/shared` (tipos)
- **Auth:** JWT + httpOnly cookies (`prumo_token`, `prumo_refresh`) — sem NextAuth
- **UI:** shadcn/ui v4 (preset Nova, Radix, Tailwind v4, Sonnet em vez de Toast)
- **PDF:** `@react-pdf/renderer` no servidor (sem Puppeteer)
- **Banco:** PostgreSQL 16 via Prisma

## Specs e Estado

- Roadmap: `.specs/project/ROADMAP.md`
- Estado atual: `.specs/project/STATE.md`
- Specs por feature: `.specs/features/<nome>/spec.md`
- Tasks por feature: `.specs/features/<nome>/tasks.md`

## Regra obrigatória: usar frontend-design ao criar UI

**SEMPRE** que o usuário pedir para criar uma tela, componente, página ou interface nova do zero — invoque o skill `/frontend-design` **antes de escrever qualquer código de UI**.

Exemplos que disparam obrigatoriamente:

- "criar tela de X", "criar página de X", "criar componente de X"
- "construir UI para X", "fazer o design de X"
- qualquer criação de interface nova que não seja ajuste em código existente

A única exceção são edições em componentes já existentes ou correções pontuais de layout.

---

## Regra obrigatória: usar web-design-guidelines ao revisar UI

**SEMPRE** que o usuário pedir para revisar, auditar ou verificar qualidade de uma tela ou componente existente — invoque o skill `/web-design-guidelines <arquivo>` **antes de qualquer análise manual**.

Exemplos que disparam obrigatoriamente:

- "revisar UI de X", "auditar design de X", "checar qualidade de X"
- "verificar acessibilidade de X", "o que está errado em X"
- qualquer pedido de revisão/auditoria em arquivo de UI já existente

A única exceção são perguntas puramente explicativas sobre o código, sem intenção de auditoria.

---

## Regra obrigatória: usar responsive-audit ao verificar/corrigir responsividade

**SEMPRE** que o usuário pedir para testar, verificar ou corrigir responsividade de uma tela ou componente. Após qualquer implementação de um novo componente ou feature — invoque o skill `/responsive-audit <arquivo>` **antes de qualquer análise manual**.

Exemplos que disparam obrigatoriamente:

- "testar responsividade de X", "como X fica em mobile"
- "corrigir layout mobile de X", "verificar em 375px"
- "melhorar responsividade de X", "X quebra no celular"

---

## Regra obrigatória: usar tlc-spec-driven

**SEMPRE** que o usuário pedir para implementar uma feature, corrigir um bug não trivial, planejar trabalho, ou qualquer tarefa que envolva código novo — invoque o skill `/tlc-spec-driven` **antes de qualquer outra ação**.

Exemplos que disparam obrigatoriamente:

- "implementar X", "criar X", "adicionar X"
- "corrigir bug de X", "resolver problema de X"
- "como devemos fazer X", "planejar X"
- "próximo milestone", "próxima feature"
- qualquer tarefa de desenvolvimento não trivial

Não escreva código, não leia arquivos de implementação, não sugira abordagens — **invoque o skill primeiro**.

A única exceção são perguntas puramente explicativas ("o que é X?", "onde fica X?") ou ajustes de 1 linha claramente triviais.
