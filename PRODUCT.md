# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A equipe administrativa da Strategy Analytics é o público principal. Ela usa o painel para gerenciar clientes, leads, assessores, documentos, compliance e outros fluxos operacionais internos.

## Product Purpose

O painel concentra os fluxos administrativos da Strategy Analytics com segurança, rastreabilidade e separação por workspace. O produto deve permitir que a equipe execute tarefas recorrentes de gestão com clareza, consistência e contexto suficiente para evitar erros operacionais.

## Operating Context

O trabalho acontece em um painel administrativo autenticado, organizado por áreas de gestão de dados e operações. Listagens densas mantêm o contexto dos registros, enquanto inclusões e edições administrativas acontecem preferencialmente em painéis laterais. Carregamentos, erros e escritas podem ser independentes por seção.

## Capabilities and Constraints

- Gerenciar clientes, leads, assessores, bancos, documentos, compliance e verificações.
- Preservar autenticação, idempotência e separação por workspace nas operações de escrita.
- Não adaptar a arquitetura visual ao formato dos endpoints do backend.
- Não inventar campos, dados ou estados sem respaldo nos contratos e fluxos reais.
- Não exibir nem registrar dados sensíveis integrais.

## Brand Commitments

- Preservar integralmente a identidade visual já consolidada no painel.
- Usar os fluxos de Leads e Assessores como referências principais de composição e comportamento.
- Alinhar as telas de Clientes ao mesmo sistema visual, corrigindo divergências de layout, densidade, espaçamento e edição.
- Manter a marca Strategy Analytics e os ativos existentes no repositório.

## Evidence on Hand

- Arquitetura visual documentada em `docs/FRONTEND-UI-ARCHITECTURE.md`.
- Fluxos de referência em `src/layouts/Leads`, `src/components/Table/Leads`, `src/layouts/Advisors` e `src/components/Table/Advisors`.
- Componentes visuais compartilhados em `src/components/Entity`, `src/components/Form` e `src/components/Card`.
- Fluxos de Clientes que precisam de alinhamento em `src/pages/DataManagement`, `src/layouts/Clients`, `src/components/Clients` e `src/components/Table/Clients`.
- Contratos e escopo do Marco 2 documentados em `docs/Api/swagger.json` e nos checklists de `docs/`.
- Não há autorização para fabricar depoimentos, métricas, dados operacionais ou alegações de produto.

## Product Principles

1. Consistência entre domínios administrativos reduz esforço e erro operacional.
2. A listagem permanece como contexto durante inclusões e edições laterais.
3. Dados e operações reais determinam o conteúdo; os endpoints não determinam a experiência visual.
4. Cada seção assíncrona comunica seu próprio carregamento, vazio, erro e recuperação.
5. Segurança e privacidade prevalecem em toda apresentação de dados administrativos.
