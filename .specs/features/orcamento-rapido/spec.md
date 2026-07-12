# Orçamento Rápido — Spec

**Feature ID:** F-ORC-RAPIDO  
**Milestone:** M3.5 — Orçamento Rápido (Fase 3e)  
**Status:** ESPECIFICADO  
**Posição no roadmap:** Após M3 completo (T-21 done), antes de M4  
**Tasks:** `.specs/features/orcamento-rapido/tasks.md`

---

## Contexto e Motivação

Usuários autenticados precisam gerar orçamentos em PDF para enviar a clientes **sem necessariamente ter criado uma obra** no sistema. O fluxo atual (M3) exige criar obra → criar orçamento → adicionar itens → gerar PDF. Para orçamentos exploratórios, informais ou de prospecção, esse fluxo é pesado demais.

A feature `/demo` (pública) já resolve parte disso para usuários não autenticados, mas não usa dados da empresa do usuário. O Orçamento Rápido preenche essa lacuna: forma autenticada, transiente (nada salvo no DB), com nome e logo da empresa no PDF.

---

## Viabilidade

| Critério | Status |
|---|---|
| Schema mudanças | ✅ Nenhuma — `Workspace` já tem `name`, `logoUrl`, `cnpj`, `telefone`, `emailContato` |
| Depende de M3 completo | ✅ Não — pode rodar em paralelo ou logo após |
| Depende de M5 (Configurações) | ✅ Não — logo é opcional; fallback para nome textual já implementado em `orcamento.tsx` |
| Depende de upload de logo | ⚠️ Parcial — PDF sai com nome da empresa sem logo; logo só aparece se M5 for implementado. Aceitável no MVP. |
| Reutiliza código existente | ✅ Sim — padrão do endpoint `/demo/pdf` + template `orcamento.tsx` |

---

## Requisitos

### Funcionais

**RF-RAPIDO-01 — Acesso**  
Usuário autenticado acessa "Orçamento Rápido" via link no nav do dashboard.  
Rota: `/dashboard/orcamentos/rapido`

**RF-RAPIDO-02 — Formulário**  
Página contém formulário com os campos:
- **Dados do cliente:** Nome (obrigatório), Endereço (opcional)
- **Itens:** tabela com linhas editáveis — Descrição (obrigatório), Unidade, Quantidade, Valor Unitário. Botão "+ Adicionar item". Botão remover por linha. Mínimo 1 item.
- **Condições:** Condições de pagamento (texto livre, opcional), Validade em dias (inteiro 1–365, default 15), Observações (textarea, opcional)

**RF-RAPIDO-03 — Dados da empresa automáticos**  
Os dados do workspace do usuário (`name`, `logoUrl`, `cnpj`, `telefone`, `emailContato`) são carregados no backend via `req.user.workspaceId` — o usuário não precisa preenchê-los.

**RF-RAPIDO-04 — Geração de PDF**  
Ao submeter o formulário, o frontend chama `POST /orcamentos/rapido/pdf`. O servidor:
1. Carrega workspace via `workspaceId` do usuário autenticado
2. Renderiza PDF com template `orcamento-rapido.tsx`
3. Retorna buffer com `Content-Type: application/pdf`

**RF-RAPIDO-05 — Download automático**  
O frontend recebe o blob e inicia download automático com filename `orcamento-rapido-[data].pdf`. Estado de loading durante o call.

**RF-RAPIDO-06 — PDF: conteúdo**  
O PDF deve conter:
- **Cabeçalho:** Logo da empresa (se `logoUrl` preenchido) ou nome textual + CNPJ (se preenchido)
- **Número e data:** número gerado aleatoriamente (formato ORC-AAAA-NNNN), data de emissão, validade
- **Dados do cliente:** nome, endereço
- **Tabela de itens:** Descrição, Unidade, Qtd, Valor Unitário, Total por linha
- **Total geral**
- **Condições de pagamento** (se preenchidas)
- **Observações** (se preenchidas)
- **Rodapé:** Nome da empresa + contatos (telefone, email)
- **Sem** campo "Obra" (não há obra vinculada)
- **Sem** watermark PRUMO (usuário autenticado, documento da empresa dele)

---

### Não-funcionais

- Tempo de geração do PDF < 3s (p95)
- PDF e itens sem persistência no DB — transiente como `/demo/pdf`. Desde 2026-07-12, um **registro-resumo leve** (cliente, ofício, valor total) é salvo por geração para alimentar o histórico de controle — ver `F-ORC-RAPIDO-HISTORICO`
- Autenticação obrigatória: `authenticate` middleware na rota
- Workspace isolation: carregar workspace via `req.user.workspaceId`, nunca via corpo da requisição

---

## Fora do Escopo

- Salvar o orçamento rápido no banco (sem vínculo a obra) — isso seria uma mudança de schema (obraId opcional no Orcamento)
- ~~Histórico de orçamentos rápidos gerados~~ — **superado em 2026-07-12** por `F-ORC-RAPIDO-HISTORICO` (`.specs/features/orcamento-rapido-historico/spec.md`): existe hoje um registro leve (cliente, ofício, valor total, data) via model `OrcamentoRapidoLog`, exibido como "Últimos orçamentos" na tela. Os **itens** e o **PDF em si continuam transientes** — não há re-download a partir do histórico.
- Duplicação de orçamento rápido
- Modo "verba" (preço fechado) — o formulário usa itens linha a linha apenas

---

## Fluxo Principal

```
Usuário clica "Orçamento Rápido" no nav
  → /dashboard/orcamentos/rapido
  → Preenche cliente, itens, condições
  → Clica "Gerar PDF"
  → Loading "Gerando PDF..."
  → PDF baixado automaticamente
  → Botão retorna ao estado inicial (pode gerar outro)
```

---

## Impacto nos Arquivos

| Arquivo | Mudança |
|---|---|
| `packages/shared/src/index.ts` | Exporta `OrcamentoRapidoPayload`, `OrcamentoRapidoItem` |
| `apps/api/src/pdf/orcamento-rapido.tsx` | Novo template PDF (sem seção "Obra") |
| `apps/api/src/routes/orcamentos-rapido.ts` | Novo arquivo com `POST /orcamentos/rapido/pdf` |
| `apps/api/src/app.ts` | Registrar `orcamentosRapidoRoutes` |
| `apps/web/lib/orcamentos.ts` | Adicionar `orcamentosApi.gerarRapido(payload)` |
| `apps/web/app/dashboard/orcamentos/rapido/page.tsx` | Nova página com formulário |
| `apps/web/app/dashboard/layout.tsx` | Adicionar link "Orçamento Rápido" em `NAV_LINKS` |

---

## Rastreabilidade

| Req | Implementado por |
|---|---|
| RF-RAPIDO-01 | TA-05 |
| RF-RAPIDO-02 | TA-04 |
| RF-RAPIDO-03 | TA-03 |
| RF-RAPIDO-04 | TA-01, TA-02, TA-03 |
| RF-RAPIDO-05 | TA-04 |
| RF-RAPIDO-06 | TA-02 |
