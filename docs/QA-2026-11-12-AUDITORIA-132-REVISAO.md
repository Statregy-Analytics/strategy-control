# Revisão do item 132 — Auditoria — 12/11/2026

## Conclusão

O texto do QA corresponde ao [Figma 2255:283](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/?node-id=2255-283). A tela e o acesso em Configurações foram implementados no frontend. Consulta, filtros e exportação já existem e respondem em homologação; não devem ser cobrados como endpoints ausentes.

A conferência inicial foi seguida pela implementação, publicação e pelos testes abaixo.

## Conferência visual e responsabilidade do front

- [x] Figma: Configurações › Auditoria, Exportar, busca, Período, Autor, Módulo, Ação e Cliente; tabela Data/Hora, Autor, Módulo, Registro, Cliente, Ação e O que mudou; ação para abrir o registro.
- [x] Figma: Criação verde, Alteração azul, Mudança de status amarela e Exclusão vermelha; campo com antes/depois e motivo quando houver. O desenho também contém Mais Filtros e rodapé de paginação.
- [x] Conferência inicial, antes da implementação: Admin publicado conferido no Chromium: Configurações tem apenas Formulários, Bancos e Configuração documental; nenhum link Auditoria. Código também não contém rota, página ou serviço de auditoria geral.
- [x] Implementar essa tela, entrada de menu, estados de carga/vazio/erro, filtros, busca e exportação usando as rotas existentes.
- [x] Ligar a ação final ao histórico dos registros nas telas de cada módulo. A navegação é responsabilidade do front; a ausência de historyUrl no DTO não prova um bloqueio de API.

## Implementação e reteste do frontend

- [x] Tela no menu Configurações, título, textos, ícones SVG e composição glass do nó 2255:283. Badges de criação/alteração/status/exclusão com as quatro cores do Figma.
- [x] Busca, cinco filtros, período no calendário, paginação e filtros na URL. Mais Filtros reutiliza os mesmos cinco controles, conforme autorização; nenhum novo campo.
- [x] Exportação CSV real com os filtros vigentes e todos os resultados, sem limitar à página. Arquivamento e exclusão são apresentados no grupo Exclusão, também na exportação.
- [x] Antes/depois por campo, motivo quando fornecido, valores ausentes sem zero fictício e defesa adicional de mascaramento na tela/CSV. Autor usa apenas Admin, Cliente ou Sistema.
- [x] Clientes abre a ficha com histórico expandido; Contratos e Transações abrem o editor existente e rolam até Histórico após as seções carregarem. Nos módulos sem tela integrada, o olho abre o histórico do recurso na própria Auditoria, conforme autorização.
- [x] 17 verificações no navegador com API real e respostas controladas para falhas: listagem, duas páginas, busca por campo, CSV, ida/volta do histórico, autor Sistema vazio, Exclusão, módulo, período, painel, histórico de Cliente, responsivo, erro/repetir e falha independente de exportação; sem erro JavaScript não tratado.
- [x] 6 verificações complementares: busca real de Cliente, seleção real de intervalo, navegação de eventos controlados para Contrato/Transação reais (sem alterar os registros), motivo e resposta atrasada sem sobrescrever a busca seguinte.
- [x] Corrigidos no reteste: contexto de sessão durante a hidratação do usuário, fechamento indevido do calendário e rolagem para históricos com seções assíncronas.
- [x] Revisão visual em 1706, 1440 e 390 px. No celular, tabela rola internamente e a página não estoura a largura.
- [x] Detector visual executado: avisos de fonte Inter, cores, raios e tamanhos correspondem ao Figma explícito; não foi substituída a identidade por recomendações genéricas do detector.

Os módulos do filtro são obtidos dos valores reais de todas as páginas da auditoria, sem criar códigos de catálogo. Exclusão combina Archived/Deleted porque a API filtra uma ação por vez. Essas consultas podem demandar mais leituras em bases grandes; não é um endpoint ausente nem foi observado bloqueio na massa atual.

## API de homologação verificada

- [x] GET /api/v1/admin/audit/changes: 200 com registros reais e paginação.
- [x] Filtros por período, Admin/Cliente/Sistema, módulo, ação, cliente e recurso; busca por ID, cliente e campo alterado. Consultas por cliente/ID/campo com resultados conhecidos conferiram; Sistema não tinha registros na amostra.
- [x] GET /api/v1/admin/audit/changes/export: 200 text/csv, com cabeçalhos de data, autor, usuário, módulo, registro, cliente, ação, campo, antes, depois e motivo. Exportação com filtros combinados retornou a mesma quantidade da consulta.
- [x] DTO ChangeLogItemResponse já fornece occurredAtUtc, actorType, actorUserId/Name, actorCustomerId, module, resourceType/Id, customerId/Name, action, field, oldValue, newValue e reason.
- [x] Rascunho fictício de Comunicado criado, Title e Summary alterados: cada campo gerou um registro Updated, com o valor anterior e o novo iguais aos enviados. Rascunho arquivado ao final e nunca publicado.
- [x] Ações observadas: Created, Updated, StatusChanged e Archived. A apresentação deve usar as nomenclaturas do desenho; Archived representa o arquivamento/exclusão lógica, sem apagar o registro.

Não foi encontrada nesta conferência uma ausência de endpoint ou falha de antes/depois a encaminhar ao backend. O teste de edição foi no módulo Comunicados; não certifica todas as operações de todos os módulos, eventos automáticos de Sistema, mascaramento de cada tipo de dado sensível ou captura de motivo em reprovações. Ausência desses exemplos na amostra não foi classificada como bug.

## Limites importantes do anexo do QA

Motivo é exigido onde a tela/regra pede: reprovação documental, correção de depósito e ações de reprovação/pedido de correção/cancelamento de transação. O anexo não autoriza adicionar motivo obrigatório a contrato ou empréstimo.

A matriz de ações do anexo inclui módulos ainda não implementados e identifica Landing Page Admin como Marco 5. Ela deve orientar a cobertura na entrega de cada módulo; não demonstra, sozinha, falhas atuais nem justifica criar novos fluxos no item 132. Esta revisão não é uma validação jurídica da cláusula 20 ou de todo o escopo contratual.

## Evidências

- [Consultas de auditoria](evidence/qa-2026-11-12-auditoria-132/read-results.json).
- [Edição fictícia e registros antes/depois](evidence/qa-2026-11-12-auditoria-132/write-results.json).
- [Menu de Configurações publicado](evidence/qa-2026-11-12-auditoria-132/admin-settings.png).

## Publicação inicial e aceite técnico desta rodada

- [x] Runtime `2364620` publicado no [Admin de homologação](https://admin.strategyanalytics.com.br/settings/audit).
- [x] [Pipeline 43249869086](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43249869086) aprovada: 209 testes versionados, lint, build, upload e ativação. Localmente, 217 testes passaram; os oito testes adicionais pertencem ao estudo futuro já existente no worktree e não foram incluídos nesta entrega.
- [x] `git diff --cached --check` passou para toda a entrega. O `git diff --check` integral ainda aponta CRLF/whitespace do Swagger previamente alterado no worktree, que foi preservado e não incluído no commit.
- [x] Na URL publicada, repetidas as 17 verificações principais e as seis complementares, com sucesso; nenhum erro JavaScript não tratado. Navegação de Contrato/Transação usou eventos de auditoria controlados apontando a registros reais, somente leitura; não foi alegada criação real de auditoria nesses módulos.
- [x] CSV filtrado baixado da API real; período, cliente e histórico de Cliente também consultados de forma integrada. As falhas 503 e a corrida entre buscas foram respostas controladas para testar o front.
- [x] Histórico de módulos sem tela permanece filtrado na própria Auditoria, conforme autorização. Não foi criado editor de Comunicados, Motor ou Empréstimos neste item.

Nenhum novo bloqueio de backend identificado para a tela 132. Esta validação não certifica a geração de eventos de todas as operações da cláusula 20; os limites da amostra continuam descritos acima.

Evidências publicadas:

- [17 verificações principais](evidence/qa-2026-11-12-auditoria-132/hml-ui-results.json) e [seis complementares](evidence/qa-2026-11-12-auditoria-132/hml-extra-results.json).
- [Desktop 1706 px](evidence/qa-2026-11-12-auditoria-132/hml-desktop-1706.png), [desktop 1440 px](evidence/qa-2026-11-12-auditoria-132/hml-desktop-1440.png), [celular 390 px](evidence/qa-2026-11-12-auditoria-132/hml-mobile-390.png) e [painel com os mesmos cinco filtros](evidence/qa-2026-11-12-auditoria-132/hml-filter-panel.png).

## Correção após as imagens do usuário — 12/11

A verificação anterior confirmou a existência de um valor no seletor, mas não conferiu o nome exato retomado por URL. Também aceitou o olho redundante no histórico filtrado. Esses dois estados estavam incorretos no frontend.

- [x] Cabeçalho real de Jorge retorna `primaryName: Jorge Nunes`. O filtro agora lê esse campo; não usa mais o UUID como nome de fallback.
- [x] Cliente selecionado usa o input de busca preenchido, sem repetir o placeholder Cliente em outra linha. Rótulo é preservado ao trocar outros filtros e consultado independentemente da tabela de auditoria.
- [x] A lista geral mantém o olho conforme o Figma. O histórico filtrado, que é a alternativa expressamente aprovada para módulos sem tela integrada, não mostra olho que leva ao próprio histórico. Não foi criado um detalhe fictício de Comunicado.
- [x] Dez verificações locais no Chromium: nome exato pela URL, recarga, painel compacto, troca de cliente com ID na consulta/nome no campo, limpeza, falha independente da tabela, histórico sem olho redundante, Voltar com filtro/olho originais, seletor compartilhado em Nova transação sem enviar e ausência de erro JavaScript não tratado.
- [x] Teste de navegação impede o retorno de destino para o próprio histórico e mantém o destino de Contratos.

Evidências locais: [nome do cliente](evidence/qa-2026-11-12-auditoria-132/audit132-fix-customer.png), [histórico sem olho repetido](evidence/qa-2026-11-12-auditoria-132/audit132-fix-history.png) e [verificações](evidence/qa-2026-11-12-auditoria-132/audit132-fix-results.json). Nenhum endpoint novo solicitado ao backend para essas correções.

### Publicação da correção e reteste

Runtime atual `ece2e5b`, publicado com a [pipeline 43259860185](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43259860185) aprovada: 209 testes, lint, build, upload e ativação. As dez verificações foram repetidas com sucesso na URL de homologação, sem erro JavaScript não tratado; troca/recarga/limpeza do cliente e navegação foram testes reais de leitura, a falha da tabela foi controlada. Nenhuma transação foi enviada.

[Resultado em homologação](evidence/qa-2026-11-12-auditoria-132/hml-fix-results.json), [filtro com o nome retomado](evidence/qa-2026-11-12-auditoria-132/hml-fix-customer.png) e [histórico sem ação redundante](evidence/qa-2026-11-12-auditoria-132/hml-fix-history.png). Checklist corrigido; esses dois defeitos eram do front e não foram registrados como bloqueios do backend.
