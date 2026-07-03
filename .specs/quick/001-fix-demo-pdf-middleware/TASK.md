# Quick Task 001: Corrigir geração de PDF na demo pública

**Date:** 2026-07-03
**Status:** Done

## Description

A rota BFF `/api/demo/pdf` era bloqueada pelo `middleware.ts` (redirect 307 para `/login`) por não estar na lista de prefixos públicos, fazendo o download salvar a página de login como se fosse o PDF.

## Files Changed

- `apps/web/middleware.ts` — adicionado `/api/demo` a `STATIC_PUBLIC_PREFIXES`

## Verification

- [x] `curl -X POST http://localhost:3000/api/demo/pdf` sem cookie retorna `200 application/pdf` começando com `%PDF-`
- [x] Fluxo completo landing → `/demo` → wizard → "Baixar orçamento em PDF" (Playwright) baixa um PDF válido terminando em `%%EOF`

## Commit

_(pendente confirmação do usuário)_
