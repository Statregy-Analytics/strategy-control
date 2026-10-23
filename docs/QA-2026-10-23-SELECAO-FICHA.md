# QA — seleção e ficha do cliente, 23/10

Referências: devolutiva de 22/10 (itens 27–38), [C01](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1484-67207), [C03](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1484-67626), [C02](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1484-68035), [C19](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1484-69131), [C31](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1973-281).

## Checklist do front

- [x] Cards: tipo e status, documento mascarado abaixo do nome, assessor/último acesso em superfícies glass, classificação, compliance com ícone, nível com três barras e data de cadastro.
- [x] Busca unificada com o texto aprovado, filtros visíveis de Status/Classificação/Compliance/Nível Doc., alternância lista/grade, ordenação A-Z/Z-A e botão de cadastro glass branco. O painel lateral existente de cadastro foi mantido.
- [x] Lista: avatar/nome/ID, classificação, assessor, status/compliance, nível e datas; espaçamento das linhas e seta para ficha. Nenhuma nova ação em lote foi acrescentada.
- [x] Paginação: Página X de Y como texto à esquerda, Anterior/números/Próximo à direita. Variante isolada do EntityTableFooter, sem modificar outros módulos.
- [x] Filtros sem suporte HTTP aplicados sobre todas as páginas da busca, com paginação do resultado filtrado; nunca somente sobre a página visível. Respostas antigas não sobrescrevem consultas novas e falha de página intermediária não publica resultado parcial.
- [x] Menu sem overflow horizontal; ícone/texto azuis na seleção de Clientes.
- [x] Documentação: superfície glass, ícones em quadrados arredondados, cores dos estados, preservando visualizar/baixar/aprovar/reprovar existentes.
- [x] Compliance: borda amarela, PEP relacionado em amarelo quando retornado pela API, histórico com pontos/linha e botão glass.
- [x] Profissional/financeiro: duas informações na primeira linha alinhadas à grade de três colunas da renda/patrimônio abaixo.
- [x] Gerenciamento de login: ícone do Figma, sem borda e estrutura de tabela C19 com estado indisponível real. Sessões e encerramento aguardam API específica do cliente.
- [x] Temas: três prévias com os fundos do desenho, borda azul da seleção e nomes acessíveis preservados. Valores Light/Dark/System da API mantidos.
- [x] Bancos: iniciais no quadrado, nome limitado, PIX retornado pela API com quebra completa, sem Titularidade na tabela, check somente para isPrimary verdadeiro, troca de principal somente quando há mais de uma conta. Botão Adicionar conta branco/glass.
- [x] Patrimônio: botões brancos/glass e vazios por categoria conforme C31, mantendo os formulários existentes.

## Bind de status autorizado pelo usuário

A apresentação usa Active → Ativo; Suspended → Bloqueado; Archived e Prospect → Inativo. Os registros continuam com os valores originais da API. O filtro Inativo reúne Prospect/Archived sem enviar um enum Inactive inexistente ao backend. Essa apresentação não altera o fluxo de análise cadastral nem ativa/desativa clientes.

## Dependências reais do backend

1. **CPF/CNPJ dos cards:** maskedDocument veio vazio na consulta, inclusive para Jorge, que possui CPF mascarado na identificação. Preencher a projeção dos cards com o documento fiscal mascarado. O front nunca tenta reconstruir dígitos já ocultados e também oculta os três primeiros e três últimos na apresentação.
2. **Sessões:** Swagger só expõe users/me/sessions; precisamos de leitura/encerramento por cliente no Admin. Não usar as sessões do administrador como se fossem as do cliente.
3. **PEP:** ainda não há contrato de declaração no perfil/onboarding. A pergunta nova do item 29 depende da escrita/leitura da declaração e de sua projeção para os alertas; não foi criado campo sem persistência.
4. **Conta única principal:** respeitar isPrimary da API e normalizar a conta única no servidor, conforme item 28. Não marcar visualmente uma conta como principal se o servidor informa false.
5. **Classificação:** os cards retornaram G/I; o desenho exemplifica A/AA/AAA. A UI exibe a classificação real com o badge previsto. Confirmar catálogo/regra antes de qualquer conversão semântica.
6. Filtros de classificação/compliance/nível não constam dos parâmetros HTTP atuais. O front funciona consultando o resultado completo; filtros server-side permanecem melhoria de escala, sem bloquear este cenário.

## Validação

112 testes automatizados aprovados, lint e build aprovados durante implementação. Revisão local na porta 8080 com API de homologação: grade/lista, filtro Inativo (6 resultados), paginação de 13 clientes (10 + 3), busca por Cláudio e ficha de Jorge/Cláudio; conta principal do Cláudio com check verde e vazios das quatro categorias de patrimônio conferidos; largura móvel de 390px sem overflow da página ou do menu. Não houve gravação de dados de clientes nesta rodada; formulário bancário aberto/fechado sem salvar. Console sem erros de execução. O diff desta alteração passa sem whitespace; o snapshot Swagger preexistente foi preservado fora do commit, incluindo seu aviso de whitespace.

Publicação e reteste em homologação: em andamento.
