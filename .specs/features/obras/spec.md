# Feature Spec — M2 Obras

**ID:** M2
**Status:** PLANNED
**Tasks:** tasks.md Fase 2 (T-048 a T-063)
**Depends on:** M1 (Auth)

---

## Requisitos

| ID    | Requisito |
|-------|-----------|
| RF-07 | Criar obra: nome (obrigatório), cliente, endereço, valor do contrato, data início e fim |
| RF-08 | Editar qualquer campo a qualquer momento |
| RF-09 | Alterar status: Planejamento → Em execução → Concluída / Pausada |
| RF-10 | Listagem com nome, cliente, status, valor contratado, total gasto, % consumido |
| RF-11 | Arquivar obra (soft delete — não aparece na lista mas dados mantidos) |
| RF-12 | Tela de detalhe com resumo financeiro: contratado, orçado, gasto, saldo |
| RNF-04 | Toda query filtra por `workspaceId` — nunca confiar apenas no ID da URL |
| RNF-11 | Confirmação explícita em operações destrutivas (arquivar obra) |

## Modelo de dados relevante

```prisma
model Obra {
  id            String     @id @default(cuid())
  workspaceId   String
  nome          String
  cliente       String?
  endereco      String?
  status        ObraStatus @default(PLANEJAMENTO)
  valorContrato Decimal?   @db.Decimal(12, 2)
  dataInicio    DateTime?
  dataFim       DateTime?
  archivedAt    DateTime?  // soft delete — adicionado via migration T-049
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  orcamentos    Orcamento[]
  gastos        Gasto[]
}

enum ObraStatus { PLANEJAMENTO | EM_EXECUCAO | PAUSADA | CONCLUIDA }
```

## Valores calculados (não armazenados)

- `totalOrcado` = SUM dos totais de orçamentos aprovados da obra
- `totalGasto` = SUM dos gastos da obra
- `saldo` = valorContrato - totalGasto
- `percentualConsumido` = (totalGasto / valorContrato) * 100

## Alerta visual

Badge "Atenção" quando `percentualConsumido > 80%` — aparece no card da listagem e na tab Resumo.

## Endpoints

```
GET    /obras              → lista obras não arquivadas do workspace
POST   /obras              → criar obra
GET    /obras/:id          → detalhe com resumo financeiro
PUT    /obras/:id          → editar campos
PATCH  /obras/:id/status   → alterar status
DELETE /obras/:id          → arquivar (soft delete, seta archivedAt)
```

## Critério de pronto

Criar obra → ver na lista com resumo financeiro → entrar no detalhe → editar → mudar status → arquivar → sumir da lista principal. Uma obra de outro workspace não é acessível via ID direto.
