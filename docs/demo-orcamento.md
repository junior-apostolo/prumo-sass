# Demo de Orçamento — PRUMO

A feature de demo permite que qualquer pessoa — sem criar conta, sem inserir cartão — acesse a landing page, responda algumas perguntas e **baixe um orçamento profissional em PDF em menos de 3 minutos**. É a vitrine do produto: o usuário experimenta o valor real antes de decidir se cadastrar.

---

## A analogia do cardápio

Imagine que o PRUMO é um restaurante. A demo é a **degustação gratuita na porta**: o garçom traz um prato pequeno para você provar antes de decidir sentar e pedir a refeição completa. Se você gostar, entra e cria sua conta. Se não gostar… bem, pelo menos você comeu de graça.

O fluxo completo é:

```
Landing Page → /demo → Wizard (5 passos) → PDF baixado → CTA "Criar conta"
```

---

## O Wizard — a ficha de pedido

O wizard funciona como a **ficha que um atendente preenche antes de registrar seu pedido**. Em vez de você preencher um formulário técnico gigante, ele te faz perguntas simples uma por vez:

| Passo | Pergunta | Analogia |
|-------|----------|----------|
| 1 — Ofício | Qual é sua profissão? | "Você quer cardápio de frutos do mar ou churrasco?" |
| 2 — Prestador | Seu nome e contato | "Como devo chamar você na reserva?" |
| 3 — Cliente | Para quem é o serviço? | "Para quantas pessoas é a mesa?" |
| 4 — Serviços | O que vai fazer? Quanto custa? | "O que você vai pedir?" |
| 5 — Condições | Como vai pagar? Qual o prazo? | "Vai pagar à vista ou parcelado?" |

Cada profissão tem suas próprias perguntas no passo 4 — o pintor vê campos de m², o eletricista vê campos de pontos elétricos, o piseiro vê m² de piso e azulejo. Isso é definido em [apps/web/lib/demo-precos.ts](../apps/web/lib/demo-precos.ts).

### O modo "verba"

Para reparos rápidos e serviços que não cabem em itens (ex: "desentupimento de emergência"), existe o **modo preço fechado**. Em vez de detalhar item por item, o prestador digita apenas: descrição do serviço + valor total. Simples, sem atrito.

---

## Os preços sugeridos

Quando o usuário chega no passo de serviços, os campos já vêm pré-preenchidos com **valores de referência do mercado**. É como ir ao mecânico e ele já ter uma tabela de preços na parede — você não precisa pesquisar do zero, só confirma ou ajusta.

```
Pintura de paredes internas (2 demãos) → R$ 22/m²  ← sugerido, editável
Ponto de tomada simples               → R$ 85/ponto ← sugerido, editável
Assentamento de piso                  → R$ 65/m²   ← sugerido, editável
```

O aviso "valores de referência — ajuste para sua região" existe porque preços variam muito entre São Paulo capital e o interior do Nordeste. O sistema oferece um ponto de partida, não uma verdade absoluta.

---

## A geração do PDF — a gráfica express

Quando o usuário clica em "Baixar orçamento em PDF", o frontend envia os dados para a API que age como uma **gráfica express**: recebe as informações, monta o documento em segundos e devolve o arquivo pronto.

### Fluxo técnico

```
Browser                         API Fastify (apps/api)
  │                                     │
  ├── POST /demo/pdf ──────────────────►│
  │   {oficio, prestador,               │
  │    cliente, itens...}               ├── Zod valida o payload
  │                                     │
  │                                     ├── renderOrcamentoDemoToBuffer(payload)
  │                                     │     └── OrcamentoDemoPdf({ payload })
  │                                     │           └── @react-pdf/renderer
  │                                     │               monta o Document → Buffer
  │                                     │
  │◄── application/pdf ─────────────────┤
  │    (arquivo binário)                │
  │                                     │
  ├── URL.createObjectURL(blob)         │
  └── <a>.click() → download           │
```

O endpoint `POST /demo/pdf` em [apps/api/src/routes/demo.ts](../apps/api/src/routes/demo.ts) é **público** (sem autenticação), aceita o payload do wizard e devolve bytes de PDF diretamente.

### O template PDF

O template em [apps/api/src/pdf/orcamento-demo.tsx](../apps/api/src/pdf/orcamento-demo.tsx) usa `@react-pdf/renderer` — uma biblioteca que transforma componentes React em um documento PDF, sem precisar de Chrome ou navegador rodando no servidor.

Pense nele como um **timbrado pré-formatado**: o cabeçalho com o nome PRUMO e os dados do prestador já estão posicionados, a tabela de itens se expande automaticamente, e o rodapé com o watermark "Gerado com PRUMO" aparece em todas as páginas.

O PDF inclui:
- Cabeçalho: logo PRUMO + número do orçamento + data de emissão e validade
- Duas colunas: dados do prestador | dados do cliente
- Tabela de serviços (ou bloco de preço fechado, no modo verba)
- Total geral em destaque
- Condições de pagamento e validade
- Rodapé azul: "Gerado com PRUMO — Crie sua conta grátis"

---

## A marca d'água como estratégia

O rodapé do PDF não é só uma assinatura técnica — é **marketing passivo**. Quando o prestador envia o orçamento para o cliente via WhatsApp, o cliente também vê o PRUMO. Cada PDF entregue é um anúncio gratuito para o produto.

---

## Problema técnico resolvido: dois Reacts no mesmo processo

Durante o desenvolvimento, a geração de PDF retornava `Cannot read properties of null (reading 'props')`. A causa foi um problema clássico em monorepos chamado **múltiplas instâncias de React**.

**Analogia:** imagine dois cozinheiros na mesma cozinha, cada um usando uma receita de "bolo de chocolate" diferente. Quando um pede para o outro decorar o bolo que fez, o segundo não reconhece a receita do primeiro — e o bolo cai.

O que aconteceu:
- `apps/api` tinha instalado `react@18` localmente
- `@react-pdf/renderer` (na raiz do monorepo) usava `react@19`
- Os dois Reacts usam `Symbol()` para identificar elementos — e cada instância cria um symbol diferente
- O reconciliador do react-pdf recebia elementos do React 18 e não os reconhecia

**Solução:** mudar `apps/api` para `react@^19`. O npm unificou em uma única cópia hoistada para a raiz — uma cozinha, uma receita.

---

## Rotas e arquivos

### API (`apps/api`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/routes/demo.ts` | Endpoint `POST /demo/pdf` — valida payload com Zod, chama o renderizador |
| `src/pdf/orcamento-demo.tsx` | Template React do PDF + função `renderOrcamentoDemoToBuffer` |

### Frontend (`apps/web`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/demo/page.tsx` | Página pública `/demo` com header mínimo e wizard |
| `components/demo/wizard.tsx` | Container do wizard — gerencia estado e navegação entre passos |
| `components/demo/step-oficio.tsx` | Passo 1 — cards de seleção de ofício |
| `components/demo/step-prestador.tsx` | Passo 2 — nome, CPF/CNPJ, telefone |
| `components/demo/step-cliente.tsx` | Passo 3 — nome e endereço do cliente |
| `components/demo/step-servicos.tsx` | Passo 4 — itens por ofício + toggle modo verba |
| `components/demo/step-condicoes.tsx` | Passo 5 — pagamento, validade, observações |
| `components/demo/preview.tsx` | Resumo final + botão "Baixar PDF" + CTA de cadastro |
| `lib/demo-precos.ts` | Tabela de preços sugeridos por ofício |
| `lib/demo-api.ts` | `fetch` para o endpoint + `downloadBlob` |
| `middleware.ts` | `/demo` adicionado como rota pública (sem redirect para login) |

### Tipos compartilhados (`packages/shared`)

```typescript
TipoOficio       // "PINTURA" | "ELETRICA" | "REVESTIMENTO" | "HIDRAULICA" | "OUTRO"
DemoItemServico  // { descricao, unidade, quantidade, valorUnitario }
DemoVerba        // { descricao, valorTotal }
DemoWizardPayload // payload completo enviado para POST /demo/pdf
```

---

## O que acontece depois do PDF

Assim que o usuário baixa o arquivo, o componente `Preview` exibe um bloco de conversão:

```
✅ PDF gerado com sucesso!
"Gostou? Crie sua conta grátis e salve todos os seus orçamentos."
[Criar conta grátis]   [Baixar novamente]
```

A ideia: o usuário acabou de ter a experiência do produto. Esse é o momento de maior receptividade para o cadastro — capturar ele antes que feche a aba.
