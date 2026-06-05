# Feature Spec — M4 Controle Financeiro

**ID:** M4
**Status:** PLANNED
**Tasks:** tasks.md Fase 4 (T-083 a T-095)
**Depends on:** M2 (Obras)

---

## Requisitos

| ID    | Requisito |
|-------|-----------|
| RF-22 | Registrar gasto vinculado a obra: descrição*, valor*, data, categoria, fornecedor (texto livre) |
| RF-23 | Editar ou excluir gasto registrado |
| RF-24 | Listagem de gastos filtrável por categoria e período |
| RF-25 | Relatório por obra: total gasto por categoria (tabela + gráfico de barras), evolução mensal (gráfico de linha), comparativo orçado vs. realizado |
| RF-26 | Alerta visual (badge/cor) quando total gasto > 80% do valor contratado |
| RF-27 | Exportar lista de gastos em CSV |
| RNF-04 | Toda query filtra por `workspaceId` |

## Modelo de dados relevante

```prisma
model Gasto {
  id          String        @id @default(cuid())
  obraId      String
  descricao   String
  categoria   ItemCategoria @default(OUTROS)
  valor       Decimal       @db.Decimal(12, 2)
  data        DateTime      @default(now())
  fornecedor  String?       // texto livre no MVP
  comprovante String?       // URL storage — UI de upload fica para v1.1
}
```

## Resumo financeiro calculado

```typescript
{
  totalContrato: Decimal     // valorContrato da Obra
  totalOrcado:   Decimal     // SUM totais de orçamentos da obra
  totalGasto:    Decimal     // SUM valor dos gastos
  saldo:         Decimal     // totalContrato - totalGasto
  porCategoria:  { categoria: string; total: Decimal }[]
  porMes:        { mes: string; total: Decimal }[]   // formato "YYYY-MM"
}
```

## Gráficos (Recharts — AD-005)

- `BarChart`: gastos por categoria (eixo X = categorias, eixo Y = R$)
- `LineChart`: evolução de gastos por mês

## Exportação CSV

Colunas: `data`, `descricao`, `categoria`, `valor`, `fornecedor`
Header: linha com nomes das colunas em português
Encoding: UTF-8 com BOM (para Excel abrir corretamente)

## Endpoints

```
GET    /obras/:obraId/gastos              → listar com filtros: categoria, dataInicio, dataFim
POST   /obras/:obraId/gastos              → registrar gasto
PUT    /gastos/:id                         → editar gasto
DELETE /gastos/:id                         → excluir gasto
GET    /obras/:obraId/financeiro/resumo   → resumo financeiro completo
GET    /obras/:obraId/financeiro/export   → download CSV
```

## Critério de pronto

Registrar 10 gastos de categorias diferentes → ver gráfico de barras atualizado → filtrar por período → exportar CSV correto com BOM → alerta de 80% aparece no card da obra quando esperado.
