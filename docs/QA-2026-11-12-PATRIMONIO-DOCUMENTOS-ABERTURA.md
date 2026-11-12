# QA — abertura de documentos do patrimônio — 12/11/2026

## Escopo

Continuação da revisão funcional do perfil/QA 121–130 após a [lista de contratos](QA-2026-11-12-LISTA-CONTRATOS.md). Corrigida a ação Visualizar já existente nos documentos vinculados ao patrimônio da Área do Cliente. Template, estilos, botões e campos permanecem idênticos; [comparação](evidence/qa-2026-11-12-patrimonio-abertura/asset-opening-layout-preserved.json). Não foram criados novos fluxos de negócio nem alterados os formulários aprovados.

## Correções do frontend

- [x] A aba é reservada no clique, antes da consulta da URL temporária. Uma resposta lenta não perde a permissão de abertura do navegador.
- [x] Popup bloqueado mostra orientação no erro existente e não solicita URL inutilmente.
- [x] Falha de API, URL inválida e fechamento manual da reserva deixam a ação disponível para nova tentativa e não abandonam abas vazias.
- [x] Nova tentativa limpa o erro anterior; clique duplicado mantém somente uma consulta e uma reserva.
- [x] Sair do perfil fecha a reserva pendente e impede abertura tardia. Arquivo já aberto permanece com o usuário.
- [x] Resultado/erro de sessão antiga é descartado. Destino abre sem opener e sem Referer.

## Testes locais

Oito testes específicos exercitam o script real do componente, incluindo atraso, bloqueio, falha/retry, saída, sessão, duplicidade, URL inválida e fechamento manual. A suíte completa passou com **395 testes**, lint, build e diff das alterações.

[Oito verificações de navegador](evidence/qa-2026-11-12-patrimonio-abertura/local-asset-opening-results.json) passaram com respostas controladas. A URL atrasada em 6,2 segundos abriu com bloqueador de popups ativo; requisições ao destino sem Referer; opener nulo; erro/retry; URL inválida; reserva fechada ao sair; desktop 1440 px e mobile 390 px sem overflow externo. Essas falhas/atrasos são interceptações do teste, não falhas induzidas no backend.

## Publicação e reteste

**Versão 82faebd publicada**, [pipeline 43319927446](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43319927446) aprovada com auditoria, lint, 395 testes, build, upload e ativação. Na URL publicada em https://hml.strategyanalytics.com.br:

- [x] [Oito verificações controladas](evidence/qa-2026-11-12-patrimonio-abertura/hml-asset-opening-results.json) repetidas com sucesso, incluindo atraso de 6,2 s com bloqueador ativo, popup bloqueado, falha/retry, URL inválida, saída durante consulta e mobile. Nenhuma exceção JavaScript; destinos fictícios sem Referer.
- [x] [Seis verificações integradas com API real](evidence/qa-2026-11-12-patrimonio-abertura/hml-asset-opening-real-results.json): login normal de Cláudio e Éric; arquivo fictício existente no imóvel do Cláudio aberto por URL temporária 200; arquivo permanece ao sair; retorno pelo navegador recarrega documentos sem erro residual; patrimônio do Éric sem anexo mostra vazio após consulta bem-sucedida; desktop/mobile sem overflow externo nas duas contas.
- [x] Revisão visual: [Cláudio desktop](evidence/qa-2026-11-12-patrimonio-abertura/hml-asset-opening-real-claudio.png), [Cláudio mobile](evidence/qa-2026-11-12-patrimonio-abertura/hml-asset-opening-real-claudio-mobile.png) e [Éric mobile](evidence/qa-2026-11-12-patrimonio-abertura/hml-asset-opening-real-eric-mobile.png). As falhas artificiais foram testadas separadamente da API real.
- [x] Sem erros HTTP ou JavaScript na rodada integrada. Somente leitura e abertura do arquivo fictício `qa121-foto-ficticia.png` já vinculado: nenhum upload, vínculo, patrimônio ou saldo criado/alterado/removido. Não foi feito novo teste de CRUD ou envio neste lote.

No Admin, somente documentação/evidências foram alteradas; lint e build também passaram. Diff deste lote aprovado; notas e alterações locais anteriores foram preservadas fora dos commits.

## Pendências reais

Nenhum novo endpoint é necessário para este ajuste. Consulta e URL temporária de documentos de patrimônio já existem e não devem ser reenviadas como ausências ao backend. As lacunas de campos/tipos, documentos vigentes e valores de contratos continuam no [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md), sem novas regras ou campos criados neste lote.

- [ ] Aceite independente do QA/designer.
