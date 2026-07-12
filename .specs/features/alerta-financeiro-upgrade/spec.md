# Gatilho de Upgrade no Alerta Financeiro — Specification

**Feature ID:** F-FINANCEIRO-UPGRADE
**Status:** ESPECIFICADO
**Depende de:** M4 — Controle Financeiro (RF-26, já implementado)
**Origem:** Pesquisa de mercado (2026-07-12) — momento de maior dor validada (SPC Brasil: ~15% dos brasileiros que não conseguem poupar citam gastos com obra) é justamente quando o orçamento estoura; hoje o PRUMO só exibe um badge passivo nesse momento

---

## Problem Statement

O alerta "Atenção: X% consumido" (implementado em `apps/web/app/dashboard/obras/[id]/page.tsx:136-140`, disparado por `RF-26` quando `percentualConsumido > 80`) hoje é puramente informativo — mostra o problema mas não oferece nenhuma ação. Esse é exatamente o momento em que a dor identificada na pesquisa de mercado fica visível e o usuário está mais propenso a querer mais controle/recursos. O PRUMO ainda não tem sistema de cobrança implementado (Asaas/Pagar.me está no roadmap para v1.2), então "upgrade" nesta feature significa captura de interesse, não paywall.

## Goals

- [ ] O alerta de >80% do orçamento consumido passa a incluir uma ação clicável de interesse em upgrade
- [ ] A ação não depende de nenhuma integração de pagamento — é uma captura de interesse (CTA para contato)
- [ ] O clique é registrado de alguma forma simples para medir taxa de conversão do gatilho (mesmo sem CRM formal)

## Out of Scope

| Item | Motivo |
|---|---|
| Feature-gating real (bloquear recursos do plano Gratuito) | Não existe modelo de plano/assinatura no schema hoje — implementar isso é um projeto de billing à parte (v1.2) |
| Cobrança real (Pix, cartão) | Depende de escolher e integrar gateway de pagamento — fora do escopo desta feature por decisão do usuário |
| CRM ou automação de e-mail para leads capturados | Fora de escopo — a captura pode ser tão simples quanto um registro em tabela ou um webhook |
| Mudar o cálculo ou o threshold de 80% (RF-26) | Este é o gatilho de negócio já validado; a feature só adiciona uma ação ao alerta existente |

---

## User Stories

### P1: CTA de upgrade dentro do alerta de estouro ⭐ MVP

**User Story**: Como um usuário do plano Gratuito cuja obra passou de 80% do orçamento consumido, eu quero ver uma sugestão clara de como ter mais controle financeiro (Pro), para saber que existe uma solução quando estou na dor.

**Why P1**: É o momento de maior propensão a conversão identificado na pesquisa — a dor (estouro de orçamento) já está acontecendo e é visível, então é o ponto de menor resistência para introduzir a oferta.

**Acceptance Criteria**:

1. WHEN `obra.percentualConsumido > 80` THEN o badge de alerta existente SHALL continuar aparecendo (comportamento atual preservado)
2. WHEN o alerta de estouro é exibido THEN o sistema SHALL exibir, junto ao badge, um elemento adicional (banner ou botão) com uma chamada do tipo "Quer alertas automáticos e relatórios mais completos? Fale com a gente sobre o Pro"
3. WHEN o usuário clica nessa chamada THEN o sistema SHALL abrir um contato direto (WhatsApp com número/mensagem pré-preenchida ou `mailto:` — a definir qual canal, ver Edge Cases) sem exigir nenhum cadastro adicional
4. WHEN o usuário já seria um "usuário Pro" (não aplicável hoje, pois não há plano implementado) THEN este CTA não deve ser considerado — todos os usuários veem o mesmo CTA até que exista distinção de plano

**Independent Test**: Criar uma obra com gastos que ultrapassem 80% do valor contratado, verificar que o badge de alerta aparece acompanhado do novo CTA, e que clicar nele abre o canal de contato definido.

---

### P2: Registro simples do clique de interesse

**User Story**: Como responsável pelo produto, eu quero saber quantas vezes o CTA de upgrade foi clicado, para validar se esse gatilho realmente gera interesse antes de investir em billing completo.

**Why P2**: Não bloqueia o lançamento do P1, mas sem esse dado não há como validar a hipótese de conversão que motivou a feature.

**Acceptance Criteria**:

1. WHEN o usuário clica no CTA de upgrade THEN o sistema SHALL registrar o evento (mínimo: `workspaceId`, `obraId`, timestamp) — pode ser uma tabela simples nova ou um log estruturado
2. WHEN necessário consultar quantos cliques ocorreram THEN deve ser possível via query direta no banco (não precisa de dashboard visual nesta fase)

**Independent Test**: Clicar no CTA e verificar no banco (ou nos logs) que o evento foi registrado com os dados corretos.

---

## Edge Cases

- WHEN a obra está arquivada (soft delete) THEN o alerta e o CTA SHALL seguir a mesma regra atual de não aparecer para obras arquivadas (comportamento herdado, não deve mudar)
- WHEN o usuário não tem telefone de contato configurado no PRUMO (não é o telefone do cliente, é o canal de contato do próprio PRUMO com o usuário) THEN o canal de contato do CTA SHALL ser um número/email fixo do PRUMO, não dependente de dados do usuário
- WHEN o mesmo usuário vê o alerta em múltiplas obras estouradas simultaneamente THEN o CTA SHALL aparecer em cada card de obra individualmente (sem deduplicação nesta fase — simplicidade sobre precisão de métricas)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| FIN-UPG-01 | P1: CTA no alerta | Pending | Pending |
| FIN-UPG-02 | P2: Registro de clique | Pending | Pending |

**Coverage:** 2 total, 0 mapeados a tasks, 2 não mapeados ⚠️

---

## Success Criteria

- [ ] Toda obra com >80% consumido exibe o CTA de upgrade junto ao alerta existente
- [ ] Clicar no CTA abre o canal de contato em no máximo 1 clique, sem exigir login adicional (usuário já está autenticado)
- [ ] Existe um número (mesmo que rudimentar) de quantos cliques o CTA recebeu, disponível para consulta manual

---

## Nota de Escopo

Escopo **Medium** — é essencialmente um novo elemento de UI ancorado em uma condição que já existe (`obra.percentualConsumido > 80`), mais um registro simples de evento. Não precisa de Design formal; pode ir direto para Execute com listagem inline de passos (adicionar CTA no componente existente + endpoint/registro simples de clique + definir canal de contato: WhatsApp vs e-mail — **decisão pendente do usuário antes de implementar**, ver pergunta abaixo).

**Pendência a resolver antes de implementar:** qual canal de contato o CTA deve abrir — WhatsApp (`wa.me` com número fixo do PRUMO) ou e-mail (`mailto:`)? Dado o padrão de comunicação do público-alvo identificado na pesquisa (forte preferência por WhatsApp), a recomendação é usar WhatsApp, mas fica como decisão explícita a confirmar antes de iniciar a Execute.
