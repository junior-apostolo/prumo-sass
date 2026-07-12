# Feedback pós-geração + Histórico do Orçamento Rápido — Specification

**Feature ID:** F-ORC-RAPIDO-HISTORICO
**Status:** ESPECIFICADO
**Depende de:** M3.5 — Orçamento Rápido (já implementado)
**Escopo:** Large — muda uma decisão de arquitetura anterior (M3.5 definia o Orçamento Rápido como transiente, sem persistência). Esta spec supera esse ponto do "Fora do Escopo" original com decisão explícita do usuário (ver Contexto).

---

## Contexto e Motivação

Dois problemas relatados pelo usuário no uso real:

1. **Sem feedback de sucesso:** ao gerar o PDF ou enviar por WhatsApp, a tela permanece idêntica (mesmos campos preenchidos), sem nenhuma confirmação visual de que o processo foi concluído.
2. **Sem controle do que já foi gerado:** o usuário quer ver uma listagem dos últimos orçamentos rápidos gerados, "só para questão de controle".

**Decisão de escopo (confirmada com o usuário):** o Orçamento Rápido continua transiente quanto ao **conteúdo** (itens, condições, PDF em si não são salvos — não há re-download do PDF gerado). Passa a existir, porém, um **registro leve** por geração: nome do cliente, ofício e valor total, para fins de controle/histórico. Isso é uma mudança de escopo em relação à spec original do M3.5 (`.specs/features/orcamento-rapido/spec.md`, seção "Fora do Escopo"), que será atualizada ao final desta implementação.

**Reset do formulário:** confirmado que, após sucesso (gerar PDF ou enviar por WhatsApp), o formulário deve voltar ao estado inicial (ofício não selecionado), pronto para o próximo orçamento.

---

## Goals

- [ ] Usuário recebe confirmação visual clara após gerar PDF ou enviar por WhatsApp com sucesso
- [ ] Formulário reseta completamente após sucesso, evitando reenvio acidental do mesmo orçamento
- [ ] Usuário vê uma lista dos últimos orçamentos rápidos gerados (cliente, ofício, valor, data) na própria tela de Orçamento Rápido
- [ ] Nenhum dado sensível adicional é persistido além do necessário para o controle (sem itens, sem PDF)

## Out of Scope

| Item | Motivo |
|---|---|
| Re-gerar/baixar o PDF a partir do histórico | Decisão do usuário: histórico é só registro leve (cliente, ofício, valor, data), sem os itens nem o PDF |
| Editar ou excluir entradas do histórico | Não solicitado; histórico é somente leitura nesta fase |
| Paginação completa / filtros no histórico | "Últimos orçamentos" sugere lista curta recente — limitar a um número fixo (ex.: 10) é suficiente |
| Vincular orçamento rápido a uma obra a partir do histórico | Fora do pedido original; fluxo de "orçamento completo vinculado a obra" já existe separadamente (M3) |

---

## User Stories

### P1: Feedback de sucesso + reset do formulário ⭐ MVP

**User Story**: Como um prestador que acabou de gerar um orçamento rápido, eu quero uma confirmação clara de que o processo funcionou e o formulário limpo para o próximo cliente, para não ficar em dúvida se already enviei/baixei o arquivo certo.

**Acceptance Criteria**:

1. WHEN o PDF é gerado com sucesso (botão "Gerar PDF") THEN o sistema SHALL exibir um toast de sucesso (ex.: "PDF gerado e baixado com sucesso")
2. WHEN o envio por WhatsApp é concluído com sucesso (Web Share API completada ou fallback wa.me aberto) THEN o sistema SHALL exibir um toast de sucesso apropriado ao caminho (compartilhado vs. fallback)
3. WHEN qualquer um dos dois fluxos conclui com sucesso THEN o formulário SHALL resetar para o estado inicial (ofício nulo, cliente/condições limpos)
4. WHEN o usuário cancela o menu de compartilhamento nativo (Web Share API) THEN o sistema SHALL NOT tratar como sucesso nem resetar o formulário (usuário pode querer tentar de novo)

**Independent Test**: Preencher o formulário completo, clicar em "Gerar PDF", ver o toast de sucesso e o formulário voltar ao estado inicial (seleção de ofício).

---

### P1: Registro leve por orçamento gerado ⭐ MVP

**User Story**: Como responsável pela API, preciso registrar um resumo mínimo de cada orçamento rápido gerado, para alimentar a listagem de histórico sem persistir dados sensíveis desnecessários.

**Acceptance Criteria**:

1. WHEN `POST /orcamentos/rapido/pdf` gera o PDF com sucesso THEN o sistema SHALL criar um registro com `workspaceId`, `clienteNome`, `oficio`, `valorTotal` e `createdAt`
2. WHEN o cálculo de `valorTotal` é feito (modo wizard: soma itens; modo verba: valor fechado) THEN o sistema SHALL usar a mesma lógica já usada na renderização do PDF (sem duplicar regras divergentes)
3. WHEN a criação do registro falhar por qualquer motivo THEN o sistema SHALL ainda retornar o PDF normalmente ao usuário (o registro é log auxiliar, não pode bloquear a geração do PDF)

**Independent Test**: Gerar um orçamento rápido e verificar via query direta no banco que um novo registro foi criado com os dados corretos.

---

### P1: Listagem dos últimos orçamentos rápidos ⭐ MVP

**User Story**: Como prestador, eu quero ver os últimos orçamentos rápidos que gerei (cliente, ofício, valor, quando), para ter uma noção de controle sem precisar de planilha externa.

**Acceptance Criteria**:

1. WHEN a tela de Orçamento Rápido carrega THEN o sistema SHALL buscar e exibir os últimos 10 registros do workspace, ordenados do mais recente para o mais antigo
2. WHEN um novo orçamento é gerado com sucesso THEN a lista SHALL atualizar para incluir o novo registro no topo (sem exigir reload da página)
3. WHEN não há nenhum registro ainda THEN o sistema SHALL exibir um estado vazio simples (ex.: "Nenhum orçamento gerado ainda")
4. WHEN a lista é exibida THEN cada item SHALL mostrar: nome do cliente, ofício (label legível, não o enum cru), valor formatado em BRL, data/hora relativa ou formatada em pt-BR

**Independent Test**: Gerar 2 orçamentos rápidos seguidos e verificar que ambos aparecem na lista, na ordem correta, com os dados certos.

---

## Edge Cases

- WHEN o nome do cliente é muito longo THEN a listagem SHALL truncar o texto (`truncate`) em vez de quebrar o layout
- WHEN o workspace ainda não tem nenhum orçamento rápido gerado THEN a listagem SHALL mostrar o estado vazio, não um erro
- WHEN a busca do histórico falhar (erro de rede) THEN a tela SHALL continuar funcional para gerar novos orçamentos — a listagem falha silenciosamente (mesmo padrão já usado para `orcamentos.list` e `gastos.list` na tela de obra)

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| ORC-HIST-01 | Feedback de sucesso + reset | Pending |
| ORC-HIST-02 | Registro leve no backend | Pending |
| ORC-HIST-03 | Listagem no frontend | Pending |

**Coverage:** 3 total, 0 mapeados a tasks (ver `tasks.md`)

---

## Success Criteria

- [ ] Gerar um orçamento rápido mostra toast de sucesso e reseta o formulário
- [ ] Enviar por WhatsApp com sucesso mostra toast de sucesso e reseta o formulário (cancelar o share NÃO reseta)
- [ ] A lista de últimos orçamentos aparece na tela de Orçamento Rápido e se atualiza sem reload após nova geração
- [ ] `.specs/features/orcamento-rapido/spec.md` é atualizada para refletir que agora existe um registro leve (não mais 100% transiente)
