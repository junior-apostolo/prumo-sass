# Feature Spec — M3 Orçamentos

**ID:** M3
**Status:** PLANNED
**Tasks:** tasks.md Fase 3 (T-064 a T-082)
**Depends on:** M2 (Obras)

---

## Requisitos

| ID    | Requisito |
|-------|-----------|
| RF-13 | Criar orçamento vinculado a uma obra existente |
| RF-14 | Orçamento tem: título, status, validade, observações |
| RF-15 | Adicionar, editar, reordenar e remover itens |
| RF-16 | Item: descrição, categoria, unidade, quantidade, valor unitário. Total calculado automaticamente |
| RF-17 | Subtotal por categoria e total geral em tempo real durante edição |
| RF-18 | Duplicar orçamento → versão nova (versão + 1) |
| RF-19 | Gerar PDF com: logo, dados do workspace, dados da obra, tabela de itens, totais por categoria, total geral, observações, validade |
| RF-20 | PDF gerado no servidor, disponibilizado para download |
| RF-21 | Alterar status manualmente |

## Modelo de dados relevante

```prisma
model Orcamento {
  id          String          @id @default(cuid())
  obraId      String
  titulo      String
  versao      Int             @default(1)
  status      OrcamentoStatus @default(RASCUNHO)
  observacoes String?
  validadeAt  DateTime?
  itens       ItemOrcamento[]
}

model ItemOrcamento {
  id            String        @id @default(cuid())
  orcamentoId   String
  descricao     String
  categoria     ItemCategoria @default(OUTROS)
  unidade       String        @default("un")
  quantidade    Decimal       @db.Decimal(10, 3)
  valorUnitario Decimal       @db.Decimal(12, 2)
  ordem         Int           @default(0)
}

enum OrcamentoStatus { RASCUNHO | ENVIADO | APROVADO | RECUSADO }
enum ItemCategoria   { MATERIAL | MAO_DE_OBRA | EQUIPAMENTO | SERVICO | OUTROS }
```

## Decisões técnicas

- **PDF:** @react-pdf/renderer no servidor (AD-003) — sem Puppeteer/Chrome headless
- **Auto-save:** Debounce 1s após última edição → `PUT /orcamentos/:id/itens` → indicador "Salvando…" / "Salvo"
- **Reordenação de itens:** @dnd-kit/sortable (drag-and-drop na tabela)
- **Upsert de itens:** Endpoint recebe array completo → deleta removidos, cria/atualiza demais

## Design do PDF (wow moment)

Tipografia limpa, logo da empresa no cabeçalho, rodapé com dados de contato, tabela com zebra de linhas, subtotais por categoria, total geral em destaque. Template HTML → @react-pdf/renderer.

## Endpoints

```
GET    /obras/:obraId/orcamentos       → listar orçamentos da obra
POST   /obras/:obraId/orcamentos       → criar orçamento
GET    /orcamentos/:id                 → detalhe com itens
PUT    /orcamentos/:id                 → atualizar cabeçalho
PUT    /orcamentos/:id/itens           → upsert array de itens
POST   /orcamentos/:id/duplicar        → duplicar (versao+1)
PATCH  /orcamentos/:id/status          → alterar status
GET    /orcamentos/:id/pdf             → gerar e baixar PDF
```

## Critério de pronto

Criar orçamento → adicionar 5 itens de 3 categorias → reordenar → editar valor → auto-save funciona → gerar PDF → verificar que PDF tem logo, totais corretos por categoria e layout profissional.
