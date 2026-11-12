# QA — Documentação e prévias nos editores de patrimônio — 12/11/2026

## Escopo

Revisão dos pontos restantes de abertura de arquivos do perfil, após a [abertura na listagem de patrimônio](QA-2026-11-12-PATRIMONIO-DOCUMENTOS-ABERTURA.md). Inclui a ação Abrir de Documentação, Visualizar da galeria de anexos e Visualizar durante a edição de imóvel. Os três templates e estilos permanecem idênticos à versão anterior; [comparação](evidence/qa-2026-11-12-perfil-previas/profile-files-layout-preserved.json). Não foram acrescentados campos, botões, fluxos ou regras de negócio.

## Correções do frontend

- [x] Os três pontos reutilizam a reserva da aba no clique, antes da consulta assíncrona, para não perder a permissão do navegador.
- [x] Popup bloqueado orienta pelo feedback existente e não consulta URL inutilmente. Sucesso só é informado quando a abertura acontece.
- [x] Falha e URL inválida fecham a reserva e permitem nova tentativa. Cliques duplicados não abrem abas adicionais.
- [x] Sair da seção fecha somente a aba ainda pendente; arquivo já aberto permanece com o usuário. Respostas de outra sessão não navegam nem publicam erro antigo.
- [x] Destinos abrem sem opener e sem Referer. URL Blob é aceita somente na prévia local de arquivo escolhido no editor, com liberação da URL após uso; não há upload nessa prévia.
- [x] Rascunhos, uploads, substituições e gravação dos bens mantidos. As correções são da abertura de arquivos, sem alteração dos contratos HTTP.

## Testes locais

A abertura síncrona falhou nas três versões anteriores dos componentes. Após o ajuste passaram 25 novos testes com scripts reais e o utilitário compartilhado, além da suíte completa de **420 testes**, lint, build e diff das alterações.

[18 verificações no navegador local](evidence/qa-2026-11-12-perfil-previas/local-profile-files-results.json): seis por componente, com URL atrasada em 6,2 s e bloqueador de popups ativo, desktop 1440 px/mobile 390 px, arquivo preservado ao sair, falha/retry, popup bloqueado e saída durante consulta. Sem exceções JavaScript; destinos de teste sem Referer. As falhas e atrasos são controlados no navegador, não provocados na API.

## Publicação e reteste

**Versão 118fd8b publicada**, [pipeline 43322387194](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43322387194) aprovada com auditoria, lint, 420 testes, build, upload e ativação. Na URL publicada https://hml.strategyanalytics.com.br:

- [x] [18 verificações controladas](evidence/qa-2026-11-12-perfil-previas/hml-profile-files-results.json) repetidas com sucesso nos três pontos. Atrasos, erros e popup bloqueado são simulações declaradas; nenhuma exceção JavaScript. Destinos fictícios sem Referer.
- [x] [Oito verificações integradas](evidence/qa-2026-11-12-perfil-previas/hml-profile-files-real-results.json), incluindo login e preparação do vínculo: conta do Cláudio, ação Abrir de Documentação, Visualizar no imóvel e Visualizar na galeria de veículo. As três consultas temporárias e os destinos dos arquivos responderam 200; arquivos abriram sem opener. Arquivo de Documentação permaneceu aberto após sair.
- [x] Revisão visual: [Documentação](evidence/qa-2026-11-12-perfil-previas/hml-profile-files-real-documentation.png), [edição de imóvel mobile](evidence/qa-2026-11-12-perfil-previas/hml-profile-files-real-editor-mobile.png) e [galeria mobile](evidence/qa-2026-11-12-perfil-previas/hml-profile-files-real-gallery-mobile.png). Sem overflow externo. Nos testes controlados também houve capturas desktop/mobile dos três pontos.
- [x] Utilizado o arquivo fictício existente `qa121-foto-ficticia.png`. O vínculo temporário criado no veículo foi removido com DELETE 204 e ausência confirmada por GET; vínculo original ao imóvel e arquivo preservados. Não houve upload de novo arquivo, salvamento de formulário, mudança de patrimônio ou saldo.
- [x] Sem exceções JavaScript ou erros nas rotas exercitadas. Os dois 403 da consulta de Comunicados durante o login foram registrados separadamente: restrição de nível da conta já conhecida, fora deste teste. Não são novos bloqueios da abertura dos documentos.

No Admin este lote altera somente documentação/evidências; lint e build também passaram. Alterações locais anteriores foram preservadas fora dos commits.

## Pendências reais

Nenhum novo endpoint é necessário. Não reenviar consultas/URLs de documentos ou anexos de patrimônio como ausências do backend. As lacunas de versão/contagem documental, campos/tipos e valores de contratos permanecem no [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). Este lote não homologa novamente o envio ou a aprovação dos documentos.

- [ ] Aceite independente do QA/designer.
