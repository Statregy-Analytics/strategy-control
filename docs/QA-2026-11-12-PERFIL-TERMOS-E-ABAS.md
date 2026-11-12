# QA — perfil, Contratos e Termos e retomada de abas — 12/11/2026

## Escopo da revisão

Continuação do checklist de perfil/documentação e da [regressão dos contratos](QA-2026-11-12-CONTRATOS-NAVEGACAO.md). As marcas atuais de API, massa e aceite independente foram separadas dos defeitos de programação. A aba Contratos e Termos permanece somente leitura/download, conforme o item 126 e a revisão de [QA 121–130](QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md).

Não foram acrescentados campos, botões, cards, ações de negócio ou assets. Template e estilos das duas telas permanecem idênticos à versão anterior; [conferência](evidence/qa-2026-11-12-perfil-termos-abas/layout-preservado.json). O aviso existente de popup bloqueado é reaproveitado. Nenhuma tela de módulo novo foi criada.

## Defeitos de frontend corrigidos

- [x] O download de anexo de contrato reservava a aba somente depois da consulta HTTP; um navegador com bloqueador ativo podia deixar o clique sem efeito. A reserva agora ocorre no clique e recebe somente a URL validada.
- [x] Popup bloqueado informa a recuperação pelo toast existente e não solicita a URL inutilmente.
- [x] Sair da aba fecha a reserva ainda pendente e impede abertura/erro tardios. Arquivo já aberto permanece com o usuário.
- [x] Falha da API, URL inválida ou fechamento manual da reserva libera uma nova tentativa, sem aba vazia abandonada.
- [x] Proteção de sessão, opener nulo e ausência de Referer preservados. Termos em texto e arquivos da plataforma seguem os downloads por Blob, com liberação da URL local.
- [x] O teste real detectou que voltar rapidamente para a aba cuja URL ainda estava ativa podia ser desfeito pela navegação anterior. O clique mais recente agora cancela a intenção pendente, mesmo retornando à URL atual.
- [x] Voltar/Avançar, aba padrão para query ausente/inválida, ação bancária e demais parâmetros de query preservados. Sair do perfil não modifica a query de outra rota. Navegação abortada/rejeitada restaura a aba efetivamente confirmada.

## Validação

Seis novos cenários de download e quatro de rota falharam antes dos respectivos ajustes. Depois: 19 testes específicos de consultas/downloads e oito testes de abas com o roteador real passaram. Suíte completa: **378 testes**, lint e build locais aprovados. Os testes antigos de consulta/erro parcial continuam passando.

[Conferência local no navegador](evidence/qa-2026-11-12-perfil-termos-abas/local-terms-downloads-results.json): 14 verificações com respostas controladas. Inclui autenticação atrasada na mudança rápida de abas, URL atrasada em 6,2 segundos com bloqueador de popups ativo, arquivos em texto/Blob, falha, retry, vazio, desktop 1440 px e mobile 390 px com nome extenso. Sem exceções de JavaScript; Referer ausente nos destinos de teste. Esses atrasos/falhas são controlados no teste, não provocados na API.

## Publicação e reteste integrado

Download publicado inicialmente em **201acf7**, [pipeline 43304099462](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43304099462) aprovada. O complemento de abas foi implementado após o teste real detectar a falha de retomada.

**Versão final 9a9c258**, [pipeline 43310963529](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43310963529) aprovada com auditoria, lint, **378 testes**, build, upload e ativação. Na URL publicada passaram:

- [x] [14 verificações controladas](evidence/qa-2026-11-12-perfil-termos-abas/hml-terms-downloads-results.json), incluindo troca rápida com autenticação atrasada, URL em 6,2 s, bloqueador ativo, falhas/retry, downloads de texto/Blob e mobile. Zero exceções de JavaScript; destinos de teste sem Referer.
- [x] [Nove verificações integradas](evidence/qa-2026-11-12-perfil-termos-abas/hml-terms-downloads-real-results.json), contando a preparação do vínculo: login de Éric e Cláudio, requisitos de termos via API 200 e download de termo real com conteúdo não vazio nas duas contas; anexo fictício do Éric por URL temporária 200; troca de aba preservando o arquivo aberto e reentrada com consulta/ação disponíveis; Cláudio com contratos sem anexos, termos independentes e mobile sem overflow. Nenhuma exceção de JavaScript.
- [x] O vínculo temporário do arquivo fictício de teste foi removido (204). Documento original, contratos e saldos preservados. Somente leitura/download de termos, sem registro de novo aceite.

Os Blob de arquivo da plataforma, atrasos e falhas foram exercitados com respostas controladas; não são apresentados como novos arquivos reais ou falhas induzidas no backend.

## Pendências que permanecem separadas

- Nenhum novo endpoint é necessário para essas correções.
- As lacunas de valores de contrato, contrato encerrado no investido, versão/contagem documental, tipos/campos e escritas com limites continuam no [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md); não foram homologadas integralmente por este lote.
- Nível insuficiente de Comunicados, celular não confirmado e documento fiscal ausente são pré-condições de massa, não concessões locais do front.
- Este teste cobre leitura/download, sem registro de aceite de termos ou envio de cadastro. Não reabre as rotas de consulta já entregues como ausentes.
- [ ] Aceite independente do QA/designer permanece aberto e não equivale a implementação pendente.

No Admin, este lote altera somente documentação/evidências; lint e build também passaram. Diff das alterações aprovado. Whitespace anterior no Swagger do Admin e em PRODUCT.md do portal e as notas/estudo locais preexistentes foram preservados fora dos commits.
