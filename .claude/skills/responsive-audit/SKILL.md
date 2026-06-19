---
name: responsive-audit
description: >
  Audita e corrige problemas de responsividade em telas e componentes do PRUMO.
  Use quando o usuário pedir para "testar responsividade de X", "corrigir layout
  mobile de X", "verificar como X fica em 375px", "melhorar responsividade de X"
  ou qualquer variação. Identifica problemas e aplica os fixes diretamente no código.
---

# Responsive Audit — PRUMO

Stack: **Next.js 15 + Tailwind v4 + shadcn/ui v4 (Radix, preset Nova)**
Breakpoint crítico do projeto: **375px** (iPhone SE / dispositivos pequenos)

## Fluxo

1. Ler o(s) arquivo(s) especificados
2. Auditar contra todos os itens da checklist abaixo
3. Listar findings no formato `arquivo:linha — problema → fix`
4. Aplicar os fixes diretamente nos arquivos (não apenas sugerir)
5. Confirmar o que foi alterado

## Checklist de Auditoria

### Layout & Container

- [ ] Nenhum container com `min-w` fixo maior que a viewport (`min-w-[Xpx]` > 375)
- [ ] Nenhum `w-[Xpx]` fixo em elementos que precisam ser fluidos
- [ ] Tabelas com scroll horizontal (`overflow-x-auto`) em vez de overflow escondido
- [ ] Grids com fallback para 1 coluna em mobile (`grid-cols-1 sm:grid-cols-N`)
- [ ] Flex rows que quebram corretamente (`flex-wrap` quando necessário)
- [ ] Seções com padding horizontal adequado em mobile (`px-4` mínimo)

### Tipografia

- [ ] Headings grandes usam tamanho responsivo (`text-2xl sm:text-4xl`, não fixo)
- [ ] Nenhum texto com `text-[Xpx]` fixo que quebre em mobile
- [ ] `truncate` ou `line-clamp` aplicado onde textos longos podem vazar
- [ ] Nomes de usuário, títulos de obra e CNPJ têm fallback de quebra de linha

### Touch & Interação

- [ ] Botões e links com área de toque mínima de 44×44px (`min-h-11 min-w-11`)
- [ ] Nenhum hover-only — ações críticas não dependem exclusivamente de hover
- [ ] Inputs com `text-base` (16px) para prevenir zoom automático no iOS
- [ ] Espaçamento entre itens clicáveis ≥ 8px para evitar toque errado

### Navegação & Sidebar

- [ ] Nav lateral oculta em mobile com toggle (`hidden md:flex` ou Sheet/Drawer do shadcn)
- [ ] Breadcrumbs truncados em mobile se necessário
- [ ] Links de nav com área de toque adequada

### Cards & Tabelas

- [ ] Cards de dados (obra, orçamento, gasto) empilham verticalmente em mobile
- [ ] Tabelas com `overflow-x-auto` no container pai
- [ ] Colunas menos importantes ocultadas em mobile (`hidden sm:table-cell`)
- [ ] Valores monetários não quebram com `whitespace-nowrap`

### Formulários

- [ ] Campos de formulário com `w-full` em mobile
- [ ] Labels acima dos inputs em mobile (não inline)
- [ ] Botões de submit com `w-full` em mobile
- [ ] Grids de formulário com `grid-cols-1 sm:grid-cols-2`

### Gráficos (Recharts)

- [ ] Container do Recharts com `width="100%"` e sem largura fixa
- [ ] `ResponsiveContainer` usado em todo gráfico
- [ ] Legenda do gráfico não vaza em mobile

### Modais & Sheets (shadcn)

- [ ] `Dialog` com `max-w-[95vw]` ou `sm:max-w-lg` para não vazar
- [ ] Conteúdo interno do modal com scroll (`overflow-y-auto max-h-[80vh]`)
- [ ] Sheets do shadcn usam `side="bottom"` em mobile quando faz mais sentido

### PDF (não se aplica — renderizado no servidor)

## Formato de Output

```
arquivo:linha — PROBLEMA → FIX
```

Agrupar por arquivo. Após listar todos os findings, aplicar os fixes.
Se um fix exigir refatoração maior (ex: transformar tabela em cards mobile),
descrever a abordagem e pedir confirmação antes de aplicar.

## Atenção — Peculiaridades do Stack

- **base-ui NÃO suporta `asChild`** — usar `render={<Component />}` em `SheetTrigger`, `DialogTrigger`, `AlertDialogTrigger`, `DropdownMenuTrigger`, etc.
- **Toast depreciado** — usar `sonner` via `components/ui/sonner.tsx`
- **`<input type="date">` envia `"YYYY-MM-DD"`** — Fastify body schema deve usar `format: "date"` (não `"date-time"`)

## Fixes Padrão por Stack

**Grid responsivo:**
```tsx
// antes
<div className="grid grid-cols-3 gap-4">
// depois
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Tabela com scroll:**
```tsx
// antes
<table>
// depois
<div className="overflow-x-auto">
  <table className="min-w-full">
```

**Input sem zoom no iOS:**
```tsx
// antes
<Input className="text-sm" />
// depois
<Input className="text-base sm:text-sm" />
```

**Heading responsivo:**
```tsx
// antes
<h1 className="text-4xl font-bold">
// depois
<h1 className="text-2xl sm:text-4xl font-bold">
```

**Container de gráfico Recharts:**
```tsx
// antes
<BarChart width={600} height={300}>
// depois
<ResponsiveContainer width="100%" height={300}>
  <BarChart>
```

**Dialog responsivo:**
```tsx
// antes
<DialogContent className="sm:max-w-lg">
// depois
<DialogContent className="max-w-[95vw] sm:max-w-lg">
```
