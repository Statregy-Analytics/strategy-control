# QA — moeda do patrimônio no Admin · 23/10/2026

Correção do front relacionada ao item 24: os valores no Registro de patrimônio dependiam da lista de moedas emitida pela carteira. O patrimônio já informa currencyCode; um carregamento lento/falho da carteira ou uma lista sem essa moeda não deve apagar a moeda do bem.

- [x] Valor declarado e restante para quitação usam currencyCode persistido no bem, sem conversão e sem depender da preferência atual ou de uma carteira correspondente.
- [x] Compatibilidade para resposta antiga sem código: resolver pelo currencyId correspondente; nunca assumir BRL ou usar moeda de outro ID. Dado ausente/inválido continua indisponível.
- [x] Mesmos cards e campos existentes do Figma C10 (1484:69299); nenhuma mudança de layout, campo ou ação.
- [x] 126 testes, lint, build e diff do lote aprovados. Testes cobrem carteira vazia, moeda ausente da carteira, preferência/lista conflitante e dado sem moeda válida.
- [x] Local 8080 com dados reais de homologação do Jorge: bens em BRL, EUR e USD preservaram símbolos/valores; consórcios mantiveram saldo devedor na própria moeda. Editor EUR mostrou 325000.75 e foi descartado sem salvar.
- [x] Revisão visual identificou nomes espremidos no celular apesar de não haver overflow do grupo. Distribuição corrigida no card: identificação ocupa a primeira linha e valores/status/ações quebram abaixo, mantendo os mesmos controles.
- [x] Moeda publicada em **9909326**, [pipeline 39968080972](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39968080972) aprovada. Complemento responsivo **3dbdb4c**, [pipeline 39968642647](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39968642647) aprovada com auditoria, 126 testes, lint/build, upload e ativação.
- [x] Admin publicado recarregado: 12 bens do Jorge com valores corretos nas três moedas, incluindo restante para quitação em BRL/EUR/USD. Nenhum valor alterado nem moeda convertida.
- [x] Mobile publicado em 390px: identificações com largura/scrollWidth de 211px; grupos de 309px sem overflow. Nomes em linhas legíveis, valores e ações acessíveis. Viewport restaurado.
- [x] Evidências locais: admin-moedas-patrimonio-hml-23-10.png e admin-moedas-patrimonio-mobile-hml-23-10.png.

Sem gravações cadastrais/financeiras nesta rodada. Falha/ausência da carteira é cenário controlado nos testes; não foi provocada indisponibilidade na API publicada. Esta correção não homologa criação administrativa com moeda diferente nem alterações de preferências. Pendências reais de API dos outros módulos seguem no documento consolidado.
