# Orçamento Rápido como Porta de Entrada — Specification

**Feature ID:** F-ORC-RAPIDO-GROWTH
**Status:** ESPECIFICADO
**Depende de:** M3.5 — Orçamento Rápido (já implementado)
**Origem:** Pesquisa de mercado (2026-07-12) — baixa adesão digital do público-alvo (61% usa caderno), preferência estrutural por WhatsApp, nenhum concorrente nacional com tração visível

---

## Problem Statement

O Orçamento Rápido já resolve o "wow moment" do PRUMO (PDF profissional em minutos), mas hoje é uma funcionalidade a mais no nav, não a porta de entrada do produto. Além disso, cada PDF gerado não carrega nenhum sinal de origem — perde-se o efeito de propagação boca-a-boca quando o prestador envia o orçamento para o cliente final. E o caminho de "gerar → enviar ao cliente" ainda depende do usuário baixar o PDF e anexá-lo manualmente em outro app.

## Goals

- [ ] Orçamento Rápido é a primeira tela vista após login/cadastro, não `/dashboard/obras`
- [ ] Todo PDF gerado (autenticado) carrega uma chamada discreta de marca ("Gerado com PRUMO") capaz de gerar novos cadastros a partir do cliente final que recebe o orçamento
- [ ] Enviar o orçamento por WhatsApp é 1 clique a partir da tela de geração, sem passar por download manual + anexo

## Out of Scope

| Item | Motivo |
|---|---|
| Gerar orçamento sem login (tipo `/demo`) | Usuário optou por manter fluxo autenticado — a demo pública já cumpre o papel de "experimentar antes de criar conta"; recriar isso autenticado duplicaria lógica sem ganho validado |
| Integração com WhatsApp Business API (bot gerando orçamento dentro do WhatsApp) | Envolve custo e integração com API oficial da Meta — projeto à parte, não cabe nesta feature |
| Cobrança avulsa por orçamento rápido (pagamento único, sem assinatura) | Depende de meio de pagamento (Pix/cartão avulso) que o PRUMO não tem hoje — registrado abaixo como P2, mas implementação real fica bloqueada até escolha do gateway |
| Qualquer mudança na função interna do PDF (itens, verba, condições) | Fora do escopo de aquisição/growth desta feature |

---

## User Stories

### P1: Orçamento Rápido como tela padrão pós-login ⭐ MVP

**User Story**: Como um prestador que acabou de criar conta ou logar, eu quero cair direto na tela de gerar orçamento, para chegar ao "wow moment" (PDF pronto) o mais rápido possível, sem precisar entender o resto do produto primeiro.

**Why P1**: É a mudança de menor esforço técnico (rota de redirect + link do nav) com maior impacto direto em ativação — a pesquisa mostra que o público não tem hábito de "explorar" software, então o primeiro clique precisa já entregar valor.

**Acceptance Criteria**:

1. WHEN o usuário completa login THEN o sistema SHALL redirecionar para `/dashboard/orcamentos/rapido` (não mais `/dashboard/obras`)
2. WHEN o usuário completa cadastro (registro) THEN o sistema SHALL redirecionar para `/dashboard/orcamentos/rapido`
3. WHEN o usuário acessa `/dashboard` diretamente THEN o sistema SHALL redirecionar para `/dashboard/orcamentos/rapido`
4. WHEN o usuário está no nav do dashboard THEN "Orçamento Rápido" SHALL aparecer como primeiro item da lista (antes de "Obras")

**Independent Test**: Logar com uma conta existente e verificar que a primeira tela é o formulário de Orçamento Rápido, não a listagem de obras.

---

### P1: Branding e CTA discreto no PDF gerado ⭐ MVP

**User Story**: Como fundador do PRUMO, eu quero que cada PDF gerado por um usuário autenticado carregue uma chamada discreta para o produto, para que o cliente final (que recebe o orçamento) também descubra o PRUMO — transformando cada envio em um canal de aquisição gratuito.

**Why P1**: É a alavanca de distribuição de menor custo identificada na pesquisa — o PDF já viaja para fora da base de usuários por natureza do fluxo (prestador → cliente final).

**Acceptance Criteria**:

1. WHEN um orçamento rápido autenticado é renderizado em PDF THEN o rodapé SHALL conter, além dos dados da empresa, uma linha discreta do tipo "Orçamento gerado com PRUMO — prumo.app" (texto pequeno, sem link clicável obrigatório já que é PDF estático)
2. WHEN o usuário visualiza o PDF THEN a marca do PRUMO SHALL ser visualmente subordinada à marca/logo da empresa do prestador (o documento continua parecendo profissional e "do prestador", não um anúncio)
3. WHEN o workspace não tem logo cadastrado (fallback textual) THEN a chamada do PRUMO SHALL permanecer no rodapé da mesma forma

**Independent Test**: Gerar um Orçamento Rápido autenticado e verificar visualmente que o rodapé do PDF contém a chamada da marca PRUMO sem comprometer a legibilidade dos dados da empresa do prestador.

---

### P1: Botão "Enviar por WhatsApp" ⭐ MVP

**User Story**: Como um prestador que acabou de gerar um orçamento, eu quero enviar o PDF direto para o WhatsApp do meu cliente com um clique, para não precisar baixar o arquivo e procurar a conversa manualmente.

**Why P1**: Elimina a fricção do último passo do fluxo mais importante do produto (o wow moment só vira valor real quando o cliente recebe o orçamento) — e reforça o posicionamento do PRUMO no canal que o público já usa.

**Acceptance Criteria**:

1. WHEN o PDF termina de ser gerado THEN a tela SHALL exibir, junto ao botão de download, um botão "Enviar por WhatsApp"
2. WHEN o usuário clica em "Enviar por WhatsApp" em um dispositivo/navegador com suporte à Web Share API (`navigator.share` com `files`) THEN o sistema SHALL abrir o menu nativo de compartilhamento com o PDF anexado, permitindo escolher o WhatsApp
3. WHEN o navegador não suporta Web Share API com arquivos THEN o sistema SHALL abrir um link `wa.me` (sem anexo automático) como fallback, orientando o usuário a anexar o PDF já baixado
4. WHEN o cliente tem telefone preenchido no formulário (campo já existente ou novo campo opcional) THEN o link `wa.me` SHALL vir pré-preenchido com esse número

**Independent Test**: Gerar um orçamento em um navegador mobile (Chrome Android) e verificar que o botão abre o menu de compartilhamento nativo com o PDF anexado, pronto para selecionar o WhatsApp.

---

### P2: Cobrança avulsa por Orçamento Rápido individual (sem assinatura)

**User Story**: Como um prestador que só quer gerar um orçamento pontual sem assinar o plano Pro, eu quero pagar um valor baixo por aquele orçamento específico, para não sentir que preciso me comprometer com uma mensalidade só para testar o valor do PDF.

**Why P2**: Monetiza o segmento que nunca converteria em assinatura recorrente, mas ainda assim está dentro do escopo desta feature por decisão do usuário — porém a implementação real do cobrança depende de uma integração de pagamento que o PRUMO ainda não tem (ver Riscos/Dependências).

**Acceptance Criteria**:

1. WHEN um usuário sem assinatura Pro atinge um limite de orçamentos rápidos gratuitos no período (a definir — ex.: N por mês) THEN o sistema SHALL oferecer a opção de pagar um valor avulso baixo para gerar aquele orçamento específico, como alternativa a assinar o Pro
2. WHEN o pagamento avulso é confirmado THEN o sistema SHALL liberar a geração do PDF daquele orçamento específico, sem conceder acesso a nenhum outro recurso do plano Pro
3. WHEN o usuário já é assinante Pro THEN a cobrança avulsa SHALL nunca ser oferecida (orçamentos ilimitados no plano)

**Independent Test**: Não testável de ponta a ponta enquanto não houver gateway de pagamento integrado — no mínimo, validar que a UI de oferta aparece corretamente no limite definido.

**Dependência bloqueante**: escolher e integrar um meio de cobrança avulsa (Pix dinâmico ou cartão avulso via Asaas/Pagar.me) antes de implementar os critérios 2 e 3. Este item deve ser registrado em `STATE.md` como blocker/todo antes de iniciar a implementação desta user story.

---

## Edge Cases

- WHEN o usuário não tem `logoUrl` nem nome de workspace preenchido (caso raro, cadastro incompleto) THEN o rodapé do PDF SHALL exibir a chamada do PRUMO normalmente, sem quebrar o layout
- WHEN o navegador é desktop sem suporte a `navigator.share` THEN o botão "Enviar por WhatsApp" SHALL cair no fallback `wa.me` sem erro visível ao usuário
- WHEN o usuário edita o formulário do Orçamento Rápido e clica em "Enviar por WhatsApp" antes de gerar o PDF THEN o sistema SHALL gerar o PDF primeiro (mesmo fluxo do botão de download) e só então abrir o compartilhamento

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| ORC-GROWTH-01 | P1: Tela padrão pós-login | Pending | Pending |
| ORC-GROWTH-02 | P1: Branding no PDF | Pending | Pending |
| ORC-GROWTH-03 | P1: Botão WhatsApp | Pending | Pending |
| ORC-GROWTH-04 | P2: Cobrança avulsa | Blocked (depende de gateway) | Pending |

**Coverage:** 4 total, 0 mapeados a tasks, 4 não mapeados ⚠️ (design/tasks ainda não elaborados — feature de escopo Medium/Large, ver nota abaixo)

---

## Success Criteria

- [ ] Novo usuário autenticado, sem nenhuma ação adicional, vê a tela de Orçamento Rápido como primeira tela após login/cadastro
- [ ] 100% dos PDFs de orçamento rápido autenticado gerados contêm a chamada de marca PRUMO no rodapé
- [ ] Enviar um orçamento gerado via WhatsApp leva no máximo 2 cliques a partir da tela de sucesso da geração

---

## Nota de Escopo

P1 (as 3 primeiras stories) é escopo **Medium** — mudanças em rotas de redirect, nav, template PDF e um botão de compartilhamento, sem necessidade de Design formal. Pode ir direto para Execute com listagem inline de passos.

P2 (cobrança avulsa) é escopo **Large/bloqueado** — depende de uma decisão de arquitetura (qual gateway, como modelar limite gratuito, como registrar pagamento avulso no schema) que deve passar por uma fase de Design própria **antes** de virar tasks, e só deve ser iniciada depois que a dependência bloqueante (escolha do gateway) for resolvida.
