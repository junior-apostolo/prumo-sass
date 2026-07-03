# Quick Task 002: Corrigir erro de build (deploy Vercel) por prop `style` ausente em `AnimateIn`

**Date:** 2026-07-03
**Status:** Done

## Description

Deploy no Vercel falhava no `next build` (`Running TypeScript`) porque `apps/web/components/landing/features-section.tsx` passava `style={{ background: ... }}` para `<AnimateIn>`, mas `AnimateInProps` não declarava essa prop. Introduzido no commit `96ebcdf` (redesign da landing).

## Files Changed

- `apps/web/components/landing/animate-in.tsx` — adicionado `style?: React.CSSProperties` a `AnimateInProps` e repassado para o elemento `Tag`

## Verification

- [x] `npx tsc --noEmit` em `apps/web` sem erros
- [x] `npm run build` em `apps/web` conclui com sucesso (mesmo comando usado pelo Vercel), incluindo `/api/demo/pdf` listado corretamente como rota dinâmica

## Commit

_(pendente)_
