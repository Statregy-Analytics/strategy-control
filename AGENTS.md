# Orientações para agentes e colaboradores

## Escopo

Este repositório é o painel administrativo frontend. Alterações aqui não devem
pressupor mudanças no backend nem adaptar a arquitetura visual ao formato dos
endpoints.

## Antes de implementar

1. Leia `docs/FRONTEND-UI-ARCHITECTURE.md`.
2. Consulte `docs/MILESTONE-2-CHECKLIST.md` e
   `docs/MILESTONE-2-MANUAL-TEST-CHECKLIST.md` quando trabalhar no Marco 2.
3. Procure componentes existentes em `src/components/Entity`,
   `src/components/Form` e `src/components/Card`.
4. Compare o fluxo com Leads e Assessores antes de criar uma nova composição.

## Regras de frontend

- Preserve a identidade visual da plataforma.
- Use edição lateral a partir da listagem para CRUDs administrativos.
- Use `EntityHeader`, `FormSection`, `RowActions`, `EntityTableFooter`,
  `TitleCard` e `LabelForm` quando aplicáveis.
- Não crie cards lado a lado em painéis de edição.
- Não copie stores fake, campos fictícios ou componentes acoplados a outro domínio.
- Se um componente não puder ser reutilizado por causa dos dados, extraia uma
  primitiva visual neutra com props, emits e slots.
- O Swagger define o contrato HTTP, não a experiência do usuário.
- Preserve carregamentos e erros independentes por seção.
- Escritas devem usar os interceptors existentes para autenticação e idempotência.
- Não registre nem mostre dados sensíveis integrais.

## Checklist e bugs

- O checklist manual registra validações de tela e fluxo.
- A tabela de bugs do checklist manual deve conter somente erros do backend.
- Corrija erros de frontend e reexecute o cenário antes de marcar aprovação.
- Uma falha do backend bloqueia somente a homologação integrada do cenário afetado.

## Qualidade

Antes de concluir uma alteração:

1. Execute `npm run lint`.
2. Execute `npm run build`.
3. Execute `git diff --check`.
4. Faça uma revisão visual do fluxo afetado.
5. Preserve alterações não relacionadas já existentes no worktree.
6. Crie commits pequenos e descritivos somente quando solicitado.
