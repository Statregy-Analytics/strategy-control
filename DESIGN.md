---
name: Strategy Administração
description: Sistema visual operacional, preciso e consistente para o painel administrativo da Strategy Analytics.
colors:
  strategy-blue: "#00a3ff"
  black: "#000000"
  ink: "#333333"
  muted: "#6a6a6a"
  quiet: "#999999"
  border: "#e0e0e0"
  surface-soft: "#fafafa"
  white: "#ffffff"
  positive: "#52c41a"
  negative: "#c10015"
  info: "#31ccec"
  warning: "#f2c037"
typography:
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  tag: "2px"
  field: "6px"
  standard: "8px"
  menu: "12px"
spacing:
  label-gap: "4px"
  compact: "8px"
  section-inline: "20px"
  section-block: "28px"
components:
  button-primary:
    backgroundColor: "{colors.strategy-blue}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.standard}"
    padding: "8px"
  button-flat:
    backgroundColor: "transparent"
    textColor: "{colors.strategy-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.standard}"
    padding: "4px 8px"
  input-outlined:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "40px"
  entity-panel:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.standard}"
    padding: "16px"
---

# Design System: Strategy Administração

## Overview

**Creative North Star: "Precisão Operacional"**

O sistema visual funciona como uma estação de trabalho financeira: direto, sóbrio e eficiente. A interface privilegia leitura rápida, comparação entre registros e continuidade da tarefa. A marca aparece por meio do Azul Strategy, da tipografia Inter e de detalhes consistentes, sem competir com os dados.

A referência normativa é a implementação consolidada até o commit `eeb8df4`, de 04/08/2026, especialmente os fluxos de Leads e Assessores e as primitivas compartilhadas extraídas nesse período. Clientes deve usar a mesma composição, densidade, alinhamento e comportamento, ainda que seus dados e endpoints sejam diferentes.

**Key Characteristics:**

- Densidade administrativa com hierarquia clara.
- Superfícies predominantemente planas e claras.
- Azul usado para ação, foco, seleção e estado ativo.
- Listagem preservada como contexto durante edição lateral.
- Seções verticais e independentes dentro dos editores.

## Colors

A paleta é neutra e funcional; o Azul Strategy é a única voz cromática de marca e deve permanecer raro o bastante para sinalizar prioridade.

### Primary

- **Azul Strategy:** ações principais, foco, paginação, seleção e navegação ativa.

### Neutral

- **Preto Estrutural:** cabeçalho global e contraste máximo.
- **Tinta Operacional:** títulos e conteúdo de maior ênfase.
- **Cinza de Apoio:** informações secundárias, ícones discretos e estados inativos.
- **Cinza Silencioso:** metadados e conteúdo de baixa prioridade.
- **Borda Neutra:** separadores, contornos e limites de controles.
- **Superfície Suave:** headers de entidade, blocos auxiliares e fundos de baixa ênfase.
- **Branco de Trabalho:** superfície principal de tabelas, formulários e painéis.

### Named Rules

**The One Accent Rule.** O Azul Strategy identifica ação ou estado; não deve virar decoração ou preencher grandes áreas de conteúdo.

**The Semantic Color Rule.** Verde, vermelho, ciano e amarelo são reservados a sucesso, erro, informação e atenção; nunca substituem a cor de marca.

## Typography

**Display Font:** Inter (com fallback sans-serif)
**Body Font:** Inter (com fallback sans-serif)

**Character:** Uma única família tipográfica sustenta a sensação de precisão. Peso e tamanho criam hierarquia sem trocar de voz ou introduzir ornamentação.

### Hierarchy

- **Title:** peso forte para títulos de página, painel e seção.
- **Body:** peso regular para conteúdo, valores e controles.
- **Label:** peso médio para rótulos externos e ações.
- **Caption:** peso regular para IDs, contatos, contagens e informações secundárias.

### Named Rules

**The External Label Rule.** Campos administrativos usam rótulos externos claros; placeholder não substitui label.

**The Compact Hierarchy Rule.** A hierarquia vem de peso, espaçamento e contraste, não de títulos excessivamente grandes.

## Layout

Listagens usam tabelas planas e densas, busca no topo e paginação fora da tabela. A entidade principal combina avatar de 32px, nome e informação secundária. A busca ocupa uma fração controlada da largura em desktop e expande em telas menores.

Criação e edição abrem à direita em diálogo de altura integral, preservando a listagem ao fundo. O painel usa `TitleCard`, `EntityHeader` e uma sequência vertical de `FormSection`. Formulários preferem grades de até três colunas em desktop e uma coluna em telas pequenas. Blocos funcionais não devem formar dashboards paralelos dentro do editor.

O ritmo parte de incrementos compactos, com 4px entre label e campo, 8px em controles e ações, 14–16px entre elementos relacionados, 20px nas laterais de editores e 28px entre seções. Os valores exatos devem ser aplicados pelas classes e componentes existentes antes da criação de novas regras.

**The Listing Context Rule.** CRUD administrativo mantém a listagem visível e edita em painel lateral.

**The Vertical Editor Rule.** Seções de um mesmo registro fluem de cima para baixo; não criar cards funcionais lado a lado.

**The Independent Section Rule.** Loading, vazio, erro e retry pertencem à seção afetada e não escondem as demais.

## Elevation & Depth

O sistema é plano por padrão. Bordas, separadores e superfícies tonais definem a hierarquia. Sombras ficam restritas ao comportamento nativo de menus, diálogos e notificações, onde comunicam sobreposição real.

### Named Rules

**The Flat-by-Default Rule.** Não adicionar sombra a tabelas, seções ou cards em repouso; elevação só representa uma camada temporariamente acima da interface.

## Shapes

Campos usam cantos suavemente curvos; painéis, botões principais e superfícies recorrentes usam raio padrão de 8px. Tags compactas podem usar 2px, enquanto menus contextuais podem chegar a 12px. Bordas são finas e discretas, nunca ornamentais.

**The Quiet Geometry Rule.** Arredondamento organiza e suaviza controles, mas não transforma cada conteúdo em cápsula ou card destacado.

## Components

### Buttons

- **Shape:** retângulo compacto com cantos de 8px; ações apenas com ícone podem ser redondas.
- **Primary:** Azul Strategy, texto branco, `dense`, `no-caps` e ícone quando melhora o reconhecimento.
- **Secondary / Flat:** fundo transparente e cor contextual; é o padrão para ações de seção e utilitárias.
- **Hover / Focus:** tratamento nativo consistente do Quasar, com foco visível e sem animação decorativa.
- **Competition:** apenas uma ação sólida deve dominar cada região visual.

### Chips and Status

- **Style:** badges ou tags pequenas, com texto curto e cor semântica.
- **State:** status simples pode viver no `EntityHeader`; estados críticos nunca dependem apenas de cor.

### Cards and Containers

- **Corner Style:** raio padrão de 8px.
- **Background:** branco para trabalho e superfície suave para agrupamento secundário.
- **Shadow Strategy:** plana em repouso.
- **Border:** contorno neutro ou separador entre seções.
- **Internal Padding:** compacto, escalando apenas quando a hierarquia exigir.

### Inputs and Fields

- **Style:** `outlined dense`, fundo branco, raio de 6px e label externo por `LabelForm`.
- **Search:** ícone à esquerda, debounce e opção de limpar.
- **Select:** `outlined dense`, com opções densas quando aplicável.
- **Error / Disabled:** estados nativos e mensagens específicas; não remover o contexto dos demais campos.

### Tables

- **Style:** `flat`, `dense`, `hide-pagination` e cabeçalho funcional.
- **Entity Cell:** avatar, nome e informação secundária alinhados à esquerda.
- **Actions:** `RowActions` no fim da linha.
- **Footer:** `EntityTableFooter` com itens por página, intervalo, total e paginação.
- **Data:** somente colunas sustentadas por dados reais da API.

### Entity Editor

- **Header:** `TitleCard` seguido por `EntityHeader`, com identidade, troca de registro, status e ações contextuais.
- **Sections:** `FormSection` em fluxo vertical, separadas visualmente e carregadas de forma independente.
- **Width:** classe global `.control-width`, respeitando os limites já definidos no projeto.

### Navigation

- **Style:** barra global preta, texto branco e Azul Strategy no item ativo.
- **Behavior:** ícone e texto curto; menus agrupam rotas do mesmo domínio sem criar navegação paralela na página.

## Do's and Don'ts

### Do:

- **Do** comparar qualquer novo CRUD com Leads e Assessores antes de compor a tela.
- **Do** reutilizar `EntityHeader`, `FormSection`, `RowActions`, `EntityTableFooter`, `TitleCard` e `LabelForm` quando aplicáveis.
- **Do** manter busca, tabela e paginação alinhadas ao mesmo eixo e densidade.
- **Do** preservar carregamentos, erros e retries independentes por seção.
- **Do** fazer as telas de Clientes convergirem para o padrão consolidado até 04/08/2026.

### Don't:

- **Don't** organizar a edição do cliente como dashboard de cards lado a lado.
- **Don't** copiar stores fake, campos fictícios ou componentes acoplados a outro domínio.
- **Don't** transformar endpoints em cards ou abas sem justificativa de tarefa do usuário.
- **Don't** criar uma nova paleta, tipografia ou linguagem de elevação para Clientes.
- **Don't** exibir dados sensíveis integrais ou depender apenas de cor para comunicar estado.
