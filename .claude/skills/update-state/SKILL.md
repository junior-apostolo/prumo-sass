---
name: update-state
description: >
  Use SEMPRE que o usuário mencionar um commit, diff, mudança de código ou
  atualização do projeto. Atualiza o arquivo .specs/project/STATE.md
  refletindo decisões, bloqueadores, milestones e tarefas concluídas.
  Disparar mesmo que o usuário não mencione "STATE.md" explicitamente —
  qualquer relato de progresso no projeto deve acionar esta skill.
---

# Atualização do STATE.md

Leia o conteúdo atual de `.specs/project/STATE.md` e atualize as seções
relevantes com base no commit/mudança informada. Siga estas regras:

- **Last Updated** → data do commit (YYYY-MM-DD)
- **Current Work** → atualizar se mudar de milestone ou módulo
- **Completed Milestones** → adicionar se um módulo foi concluído
- **Recent Decisions** → adicionar AD-XXX se houver decisão arquitetural
- **Active Blockers** → resolver ou adicionar conforme o contexto
- **Todos** → marcar concluídos; adicionar novos se identificar pendências
- **Quick Tasks Completed** → registrar tarefas pontuais

Nunca remova seções existentes. Preserve o estilo e formatação do arquivo.
Retorne apenas o conteúdo completo atualizado do STATE.md.