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

1. **CPF/CNPJ dos cards:** maskedDocument veio vazio nos 13 cards consultados, inclusive para Jorge, que possui CPF mascarado na identificação. Preencher a projeção dos cards com o documento fiscal mascarado. O front nunca tenta reconstruir dígitos já ocultados e também oculta os três primeiros e três últimos na apresentação.
2. **Sessões:** Swagger só expõe users/me/sessions; precisamos de leitura/encerramento por cliente no Admin. Não usar as sessões do administrador como se fossem as do cliente.
3. **PEP:** ainda não há contrato de declaração no perfil/onboarding. A pergunta nova do item 29 depende da escrita/leitura da declaração e de sua projeção para os alertas; não foi criado campo sem persistência.
4. **Conta única principal:** respeitar isPrimary da API e normalizar a conta única no servidor, conforme item 28. Não marcar visualmente uma conta como principal se o servidor informa false. Conferidos cinco clientes com conta única: Cláudio tem check válido; três ainda retornaram isPrimary=false.
5. **Classificação:** os cards retornaram G/I; o desenho exemplifica A/AA/AAA. A UI exibe a classificação real com o badge previsto. Confirmar catálogo/regra antes de qualquer conversão semântica.
6. Filtros de classificação/compliance/nível não constam dos parâmetros HTTP atuais. O front funciona consultando o resultado completo; filtros server-side permanecem melhoria de escala, sem bloquear este cenário.

## Validação

112 testes automatizados aprovados, lint e build aprovados durante implementação. Revisão local na porta 8080 com API de homologação: grade/lista, filtro Inativo (6 resultados), paginação de 13 clientes (10 + 3), busca por Cláudio e ficha de Jorge/Cláudio; conta principal do Cláudio com check verde e vazios das quatro categorias de patrimônio conferidos; largura móvel de 390px sem overflow da página ou do menu. Não houve gravação de dados de clientes nesta rodada; formulário bancário aberto/fechado sem salvar. Console sem erros de execução. O diff desta alteração passa sem whitespace; o snapshot Swagger preexistente foi preservado fora do commit, incluindo seu aviso de whitespace.

## Publicação e reteste em homologação

- Runtime publicado: **7c4b5fa** (implementação principal b1e6ebf e ajuste das dimensões dos ícones). [Pipeline final 39950966237](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39950966237) concluída com sucesso, incluindo auditoria, 112 testes, lint, build, upload e ativação.
- Em https://admin.strategyanalytics.com.br/dataManagement, grade com 13 resultados e lista com 10 linhas na primeira página; colunas, badges e navegação à ficha de Cláudio conferidas. Cinco ícones de dropdown renderizados em 16×16; nenhum ícone quebrado e menu sem overflow horizontal.
- Ficha publicada do Cláudio: tabela bancária apenas com Banco/Agência-conta/Tipo/Chave Pix/Principal/ações existentes, check verde real, PIX quebrando sem corte, botão glass; quatro estados vazios patrimoniais e fundos/seleção do tema conferidos. Abrir/fechar cadastro bancário sem salvar preservou os dados.
- Gerenciamento de login mostra os cabeçalhos C19 e o estado indisponível real. Sem sessões fictícias ou ações de encerramento sem contrato.
- Seleção em viewport de 390px sem overflow da página ou dos cards; viewport restaurado ao tamanho normal. Console sem erros de execução.
- Evidências visuais salvas localmente: admin-selecao-clientes-hml-23-10.png e admin-banco-patrimonio-hml-23-10.png. Nenhuma escrita de dados de cliente nesta rodada.

A validação visual/funcional do front não encerra os bloqueios de API e dados listados acima nem as demais pendências históricas do QA.


## Complemento — filtros C04 e indicadores de compliance

Revisão dos itens 30–32/34: a primeira publicação não contemplava Todos no menu de status, Alerta no filtro/badge e o prefixo Compliance na lista. Esses pontos são correções do front, não pendências de API.

- [x] Menu Status com Todos, Ativo, Bloqueado e Inativo, na ordem C04; opção selecionada com check, curvas e superfície do desenho. Ícones 16×16 e curvas 120×7, sem dependência dos URLs temporários do Figma.
- [x] Todos remove só o filtro de status, preserva busca/classificação/compliance e retoma a página 1. Não envia Todos, null ou Inactive como enum HTTP.
- [x] Alerta separado de Pendente na apresentação e no filtro, com o ícone e fundo alaranjado do C01. Compatibilidade de leitura para Alert/Warning/Attention; valores da API preservados. Clear/Approved continuam apresentados como OK.
- [x] Lista identifica Compliance OK/Pendente/Alerta/Bloqueado; cards mantêm os rótulos originais do desenho.
- [x] Cabeçalho da ficha reutiliza os mesmos badges para compliance/status. CSS dos rótulos não sobrescreve as cores dos badges.
- [x] 115 testes, lint, build e diff dos arquivos alterados aprovados. Cobertura inclui filtro Alerta em várias páginas e retorno para Todos preservando os demais filtros.
- [x] Local 8080: Bloqueado retornou Carlos, Todos restaurou os 13 clientes e Alerta mostrou vazio legítimo, sem erro. Lista mostrou Compliance Pendente/OK; ficha de Carlos exibiu Pendente amarelo e Bloqueado vermelho. Menu e ficha em 390px sem overflow, com os quatro itens acessíveis e seleção correta; viewport restaurado. Nenhum alerta cadastral foi criado para produzir massa de teste.
- [ ] Confirmar publicação e reteste em homologação.

Limite: não havia cliente com compliance Alerta na massa consultada; suas variantes e paginação foram exercitadas com respostas controladas nos testes. Não apresentar esse caso como revisão integrada de um alerta real. A integração/homologação de imagens do patrimônio do item 23 permanece uma próxima frente do front; os endpoints já existem.
