# Revisão do item 132 — Auditoria — 12/11/2026

## Conclusão

O texto do QA corresponde ao [Figma 2255:283](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/?node-id=2255-283). A tela e o acesso em Configurações foram implementados no frontend. Consulta, filtros e exportação já existem e respondem em homologação; não devem ser cobrados como endpoints ausentes.

A conferência inicial foi seguida pela implementação e pelos testes abaixo. A publicação é registrada ao final após a validação do deploy.

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
