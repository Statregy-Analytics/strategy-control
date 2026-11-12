# QA — paginação e retomada da lista de contratos — 12/11/2026

## Escopo

Continuação da revisão de [Contratos e Termos e abas do perfil](QA-2026-11-12-PERFIL-TERMOS-E-ABAS.md). Revisados os estados da listagem existente em Meus contratos, sem acrescentar campos, filtros visíveis, ações de negócio ou estilos. A tabela, suas colunas, os botões e a rolagem interna mobile foram preservados; [comparação do template](evidence/qa-2026-11-12-lista-contratos/contract-list-layout-preserved.json). Esta revisão funcional não representa novo aceite visual independente do designer.

## Correções do frontend

- [x] Unificada a observação de página e parâmetros: reiniciar a paginação após mudança de consulta faz somente uma requisição à página 1.
- [x] Se a quantidade de páginas diminuir durante a consulta, a lista busca a última página válida sem publicar um vazio intermediário. Zero páginas corresponde à consulta da página 1, nunca da página 0.
- [x] Respostas e erros de consultas antigas, de sessão anterior ou de uma tela já desmontada não podem repopular a lista.
- [x] Resultado descartado não aparece como consulta concluída com zero registros.
- [x] Sem metadados de paginação, a quantidade exibida corresponde aos itens recebidos; zero informado explicitamente pela API permanece zero.
- [x] Carregamento, erro, retry e vazio real já eram distintos no componente e foram preservados e retestados. Não são anunciados como novos defeitos corrigidos.

- [x] Corrigido o caminho da fonte Roboto existente: o navegador real revelou 404 no caminho duplicado `fonts/fonts`. O build agora inclui o arquivo local, sem substituir a família tipográfica.

## Testes

Cinco regressões falharam antes da correção. Após o ajuste passaram nove testes específicos com o componente real, Vue e o recurso assíncrono existente. A suíte completa passou com **387 testes**, lint e build; diff das alterações aprovado.

[Onze verificações locais no navegador](evidence/qa-2026-11-12-lista-contratos/local-contract-list-results.json) passaram com respostas controladas: carregamento, 25 contratos em três páginas, página removida, esvaziamento, erro, retry, página 2, saída durante consulta, retorno com uma requisição, mobile 390 px e mudança de sessão. Sem exceções de JavaScript. Essa massa é interceptada no navegador e não cria contratos no backend.

## Publicação e reteste

Paginação publicada em **07a1d5b**, [pipeline 43315336036](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43315336036) aprovada. A rodada integrada revelou 404 da fonte Roboto; o recurso foi corrigido e publicado em **cf84cfc**, [pipeline 43315936573](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43315936573) aprovada com auditoria, lint, 387 testes, build, upload e ativação.

Na versão final em https://hml.strategyanalytics.com.br:

- [x] [Onze verificações controladas](evidence/qa-2026-11-12-lista-contratos/hml-contract-list-results.json) repetidas com sucesso, inclusive sessão, saída durante consulta, falha/retry, redução de páginas e mobile.
- [x] [API real, somente leitura](evidence/qa-2026-11-12-lista-contratos/hml-contract-list-real-results.json): login normal nas três contas. Éric com dois contratos, Cláudio com um e client@example.com sem contratos. Na entrada/retomada houve somente uma consulta da listagem, e não apareceu paginação para uma página ou zero itens.
- [x] Éric e Cláudio: abrir detalhe e voltar pelo navegador recuperou a lista e seus totais corretos. O contrato encerrado do Cláudio foi exibido com os dados da API; nenhuma subtração local foi aplicada ao investido.
- [x] Revisão visual desktop 1440 px e mobile 390 px nas três contas: rolagem horizontal restrita à tabela, sem overflow externo. [Éric desktop](evidence/qa-2026-11-12-lista-contratos/hml-contract-list-real-eric.png), [Cláudio mobile](evidence/qa-2026-11-12-lista-contratos/hml-contract-list-real-claudio-mobile.png), [conta sem contratos](evidence/qa-2026-11-12-lista-contratos/hml-contract-list-real-client.png).
- [x] Roboto carregou efetivamente nas três contas, sem erro HTTP ou exceção JavaScript. Não houve alteração de contratos, saldos, documentos ou preferências durante esta rodada.

As três contas reais têm no máximo uma página: os cenários com múltiplas páginas e falhas foram exercitados por interceptação explicitamente controlada, não por uma massa real de 25 contratos. No Admin este lote altera somente documentação; lint e build também passaram.

## Pendências reais

Nenhum novo endpoint é necessário para este lote. Os bloqueios de valores de contrato, contrato encerrado do Cláudio no saldo investido, versionamento/contagem de documentos e demais limites de contrato HTTP continuam discriminados no [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). Não foram resolvidos nem contornados por cálculos no frontend.

- [ ] Aceite independente do QA/designer.
