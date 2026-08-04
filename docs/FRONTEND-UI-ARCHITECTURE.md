# Arquitetura visual do frontend

## Decisão

O `strategy-control` possui uma identidade visual própria. O contrato da API
define dados e operações, mas não define navegação, composição de tela ou
hierarquia visual.

Novos fluxos administrativos devem seguir os padrões de Leads, Assessores e
Clientes: listagem densa, edição em painel lateral, header de entidade, seções
verticais e campos com rótulos externos.

## Componentes compartilhados

Os componentes neutros ficam em `src/components/Entity`:

- `EntityHeader.vue`: avatar, ID, nome, troca de registro, status e ações via slots.
- `FormSection.vue`: título, descrição, espaçamento e conteúdo vertical.
- `RowActions.vue`: menu de ações contextual de uma linha.
- `EntityTableFooter.vue`: itens por página, intervalo, total e paginação.

Também são parte do sistema visual:

- `src/components/Card/TitleCard.vue`: título e fechamento de painel lateral.
- `src/components/Form/LabelForm.vue`: rótulo externo e conteúdo do campo.
- `.control-width`, `.border-pattern` e `.text-muted`: classes globais existentes.

## Padrão de listagem

1. Usar `q-table` com `flat`, `dense` e `hide-pagination`.
2. A primeira coluna deve oferecer seleção quando houver ações em lote.
3. A entidade deve aparecer com avatar, nome e informação secundária.
4. A busca fica no topo, com `outlined`, `dense`, ícone e debounce.
5. Ações da linha usam `RowActions`.
6. Paginação server-side usa `EntityTableFooter`.
7. Não adicionar colunas sem dados reais da API.

## Padrão de edição

1. Manter a listagem como contexto e abrir um `q-dialog` lateral com
   `.control-width`.
2. Usar `TitleCard` no topo e `EntityHeader` logo abaixo.
3. Status simples pode ser alterado no header.
4. Organizar formulários verticalmente com `FormSection`.
5. Usar `LabelForm` com `q-input`/`q-select` `outlined dense`.
6. Preferir grades de três colunas em desktop e uma coluna em telas pequenas.
7. Não colocar cards funcionais lado a lado dentro do painel.
8. Cada bloco pode carregar e falhar independentemente, sem esconder os demais.

## Escritas e ações

Endpoints separados podem exigir salvamentos separados. Nesses casos:

- usar ação `flat`, `dense`, `size="sm"`, com ícone e texto curto;
- posicionar a ação no fim da seção;
- não usar vários botões sólidos concorrendo visualmente;
- recarregar somente projeções afetadas;
- manter mensagens de sucesso e erro específicas.

## Reutilização

Reutilizar componentes neutros. Não importar um formulário de outro domínio se
ele depender de store, payload ou campos específicos daquele domínio.

Quando a aparência deve ser igual, extrair ou usar um componente visual neutro
e fornecer dados por props/slots. Não copiar stores fake nem inventar campos para
preencher um layout.

## Responsividade e acessibilidade

- Toda ação somente com ícone precisa de `aria-label`.
- Diálogos devem fechar pelo botão do header e pela interação padrão, salvo fluxo crítico.
- Formulários devem cair para uma coluna em telas pequenas.
- Loading, vazio, erro e retry são obrigatórios por bloco assíncrono.
- Nunca exibir tokens, senhas, códigos ou dados bancários integrais.

## Critérios antes do commit

- Comparar visualmente com Leads ou Assessores.
- Executar `npm run lint`.
- Executar `npm run build`.
- Executar `git diff --check`.
- Atualizar o checklist manual quando o fluxo de homologação mudar.
- Confirmar que não foram introduzidos dados fictícios.
