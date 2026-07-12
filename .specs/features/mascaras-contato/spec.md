# Máscaras de Telefone, CNPJ/CPF e Email — Specification

**Feature ID:** F-MASCARAS-CONTATO
**Status:** ESPECIFICADO
**Escopo:** Medium — sem gray areas, sem decisão arquitetural; vai direto para Execute com checklist inline.

---

## Problem Statement

Os campos de telefone, CNPJ/CPF e email são digitados livremente (sem formatação) nos formulários do PRUMO e exibidos como texto cru nos PDFs gerados. Isso gera inconsistência visual (ex.: `11987654321` em vez de `(11) 98765-4321`) e passa impressão pouco profissional nos PDFs enviados ao cliente final — justamente o documento que carrega a marca do prestador (e agora também a chamada discreta do PRUMO, ver `F-ORC-RAPIDO-GROWTH`).

Adicionalmente, o nome do arquivo do PDF do Orçamento Rápido hoje é `orcamento-rapido-AAAA-MM-DD.pdf` — genérico demais para quem gera vários orçamentos no mesmo dia para clientes diferentes.

## Goals

- [ ] Telefone, CNPJ/CPF formatam progressivamente enquanto o usuário digita, em todos os formulários que têm esses campos
- [ ] Email é normalizado (minúsculas) enquanto digitado
- [ ] PDFs exibem esses campos formatados, independentemente de como o dado foi originalmente salvo (defensivo — reformata na renderização)
- [ ] Nome do arquivo do PDF do Orçamento Rápido usa o nome/razão social do cliente informado

## Out of Scope

| Item | Motivo |
|---|---|
| Validação de CPF/CNPJ (dígito verificador) | Pedido foi por máscara/formatação visual, não validação de documento válido |
| Máscara de telefone internacional (fora do Brasil) | Produto é 100% Brasil; DDD de 2 dígitos + 8/9 dígitos é suficiente |
| Biblioteca externa de máscara (react-input-mask etc.) | Formatação é simples o bastante para funções puras — evita nova dependência |

---

## Escopo Técnico

**Funções de formatação (novas, em `packages/shared/src/index.ts` — reuso entre `apps/web` e `apps/api`):**
- `formatTelefone(value: string): string` — `(DD) XXXXX-XXXX` (celular, 11 dígitos) ou `(DD) XXXX-XXXX` (fixo, 10 dígitos), progressivo
- `formatCnpj(value: string): string` — `00.000.000/0000-00`, progressivo
- `formatCpfCnpj(value: string): string` — alterna CPF (`000.000.000-00`, até 11 dígitos) / CNPJ (acima de 11 dígitos), para o campo combinado da demo pública
- `formatEmail(value: string): string` — força minúsculas (sem alterar estrutura)

Todas as funções são **idempotentes**: extraem apenas dígitos (`replace(/\D/g, "")`) antes de reformatar, então aplicar a função a um valor já formatado produz o mesmo resultado — seguro tanto para o `onChange` do formulário quanto para a formatação defensiva no PDF.

**Formulários (aplicar a função no `onChange`, sem mudar o tipo do campo no backend — o valor formatado com pontuação continua sendo salvo como está hoje):**
| Arquivo | Campo(s) |
|---|---|
| `apps/web/components/demo/step-prestador.tsx` | `cpfCnpj` (formatCpfCnpj), `telefone` (formatTelefone) |
| `apps/web/app/dashboard/configuracoes/page.tsx` | `EmpresaSection`: `cnpj` (formatCnpj), `telefone` (formatTelefone), `emailContato` (formatEmail) · `PerfilSection`: `email` (formatEmail) |
| `apps/web/app/dashboard/orcamentos/rapido/page.tsx` | `clienteTelefone` (formatTelefone) |

**PDFs (aplicar a função no momento da renderização, sobre o dado vindo do banco/payload):**
| Arquivo | Campo(s) |
|---|---|
| `apps/api/src/pdf/orcamento-rapido.tsx` | `workspace.cnpj`, `workspace.telefone`, `workspace.emailContato` |
| `apps/api/src/pdf/orcamento.tsx` | `workspace.cnpj`, `workspace.telefone`, `workspace.emailContato` |
| `apps/api/src/pdf/orcamento-demo.tsx` | `prestador.cpfCnpj` (formatCpfCnpj), `prestador.telefone` |

**Nome do arquivo (Orçamento Rápido):**
- `apps/web/app/dashboard/orcamentos/rapido/page.tsx` — `gerarPdf()` monta o filename como `orcamento-<slug-do-nome-do-cliente>-<AAAA-MM-DD>.pdf` (slug: remove acentos, minúsculas, espaços/especiais viram hífen, fallback `"cliente"` se o slug ficar vazio).

## Edge Cases

- WHEN o campo de telefone/CNPJ está vazio THEN a função de formatação SHALL retornar string vazia (sem quebrar)
- WHEN o dado já salvo no banco não tem nenhuma pontuação (registros antigos) THEN o PDF SHALL formatá-lo do mesmo jeito (idempotência via extração de dígitos)
- WHEN o nome do cliente no Orçamento Rápido contém apenas caracteres especiais (raro, já que o campo é obrigatório) THEN o filename SHALL cair no fallback `"cliente"` em vez de gerar um nome de arquivo vazio ou inválido

## Success Criteria

- [ ] Digitar um telefone ou CNPJ em qualquer um dos 3 formulários listados formata em tempo real
- [ ] Gerar um PDF (Orçamento Rápido, Orçamento completo ou Demo) exibe telefone/CNPJ/email formatados mesmo que o dado de origem esteja sem pontuação
- [ ] Gerar um Orçamento Rápido para "João da Silva" baixa um arquivo chamado `orcamento-joao-da-silva-AAAA-MM-DD.pdf`
