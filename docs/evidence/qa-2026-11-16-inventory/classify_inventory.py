"""Regenerate the documented source/evidence audit; does not test browser behavior."""
from pathlib import Path
from collections import Counter
import json
import re

ROOT = Path(__file__).resolve().parents[3]
PORTAL = ROOT.parent / 'Strategy-analytics-v2'
HERE = Path(__file__).resolve().parent
rows = json.loads((HERE / 'original-inventory.json').read_text())
groups = {}
mapping = {}

def group(key, title, front, blockers, reason, sources, evidence, ids='', browser='histórica; não repetida em 16/11'):
    groups[key] = dict(title=title, front=front, blockers=blockers, reason=reason,
                       sources=sources, evidence=evidence, browser=browser)
    for node in ids.split():
        assert node not in mapping, node
        mapping[node] = key

group('A01', 'Login e seleção de sistema', 'done', [],
      'Refresh idempotente e autorização por perfil implementados, com reteste publicado; Cliente não ganha acesso Admin.',
      ['src/services/authService.js', 'src/pages/Authentication/SystemSelectionPage.vue'],
      ['docs/QA-2026-11-12-REVISAO-CONSOLIDADA-FRONT.md'], '1484:66878 1484:66973')
group('A02', 'Seleção de clientes: escala pendente', 'done', ['designer'],
      'Cards/lista implementados e testados; A/AA/AAA versus escalas reais continua decisão de Éric/produto. Não converter letras no front.',
      ['src/pages/DataManagement/ClientsPage.vue', 'src/services/customerPresentation.js'],
      ['docs/QA-2026-10-24-ADMIN-39-55.md', 'docs/QA-2026-10-24-CARDS-SESSOES-CONTA-PRINCIPAL.md'], '1484:67207 1484:67626')
group('A03', 'Filtro de status', 'done', [],
      'Primitiva glass e mapeamento autorizado implementados; abrir/limpar filtro e paginação têm evidência publicada.',
      ['src/pages/DataManagement/ClientsPage.vue', 'src/components/Entity/GlassSelect.vue'],
      ['docs/QA-2026-10-24-ADMIN-39-55.md'], '1484:67993 1484:67997 1484:68005')
group('A04', 'Ficha consolidada e identificação administrativa', 'done', ['backend'],
      'Composição e dados reais presentes; UpdateCustomerRequest ainda só kind/birthDate. Escrita pessoal adicional e PEP/observação não são concluídos pela leitura da ficha.',
      ['src/pages/DataManagement/ClientDetailPage.vue', 'src/services/clientSectionModel.js'],
      ['docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md', 'docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:68035 1994:284')
group('A05', 'Visão consolidada por carteira', 'done', ['backend'],
      'Seleção e composição existentes; métricas atuais/bloqueadas e investido do contrato encerrado permanecem no reteste de 12/11. Falha de valor desse registro não foi reproduzida hoje.',
      ['src/components/Finance/WalletOverview.vue', 'src/components/Finance/CustomerPortfolio.vue'],
      ['docs/QA-2026-10-19-CARTEIRA-VAZIA.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1484:68911 2011:317 2011:546 2072:281')
group('A06', 'Carteira sem seleção e carteira zerada', 'done', [],
      'Estados de ausência/zero reais e seleção desmarcada documentados; indisponibilidade não vira zero.',
      ['src/components/Finance/WalletOverview.vue', 'src/services/portfolioProjection.js'],
      ['docs/QA-2026-10-19-CARTEIRA-VAZIA.md', 'docs/QA-ADMIN-FECHAMENTO-2026-10-23.md'], '1933:300 2072:414')
group('A07', 'Contas bancárias no Admin', 'done', [],
      'Modal, busca, edição preenchida, logos e principal conforme API têm testes/publicação; documento fiscal ausente é pré-condição de massa, não nova ausência de endpoint.',
      ['src/components/Clients/ClientBankAccountsPanel.vue', 'src/services/bankBrand.js'],
      ['docs/QA-2026-10-24-ADMIN-56-60.md', 'docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md'], '1484:69032 1968:310 1995:348 2095:281')
group('A08', 'Preferências e sessões administrativas', 'done', [],
      'Selects e sessões por cliente integrados, com evidências publicadas. Estudo futuro de países/defaults não foi ativado.',
      ['src/components/Clients/ClientPreferencesPanel.vue', 'src/components/Clients/ClientSessionsPanel.vue', 'src/services/customerSessionService.js'],
      ['docs/QA-2026-10-24-ADMIN-56-60.md', 'docs/QA-2026-10-24-CARDS-SESSOES-CONTA-PRINCIPAL.md'], '1484:69073 1484:69087 1484:69103 1484:69117 1484:69131')
group('A09', 'Documentos e estados de cliente novo', 'done', [],
      'Leitura, expansão/recolhimento, vazio e revisão com motivo implementados; este estado visual não certifica a regra de contagem/versões da API.',
      ['src/components/Clients/ClientDocumentsPanel.vue', 'src/pages/DataManagement/ClientDetailPage.vue'],
      ['docs/QA-2026-10-19-APROVACAO-DOCUMENTOS.md', 'docs/QA-2026-11-12-REVISAO-CONSOLIDADA-FRONT.md'], '1484:69170 1484:69175 1484:69180 1484:69233 1932:282 1932:311 1973:281 1932:387 1933:281')
group('A10', 'Profissional/financeiro por seção', 'done', [],
      'Edição, descarte, precisão/zero e renda atual/restauração têm evidências. Bug antigo de renda não é classificado como bloqueio atual.',
      ['src/components/Clients/ClientProfessionalPanel.vue', 'src/services/clientSectionModel.js'],
      ['docs/QA-2026-10-24-ADMIN-56-60.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1930:281')
group('A11', 'Segurança administrativa em edição', 'done', ['backend'],
      'Campos de leitura e composição existem; ações administrativas de status/2FA/redefinição não são equivalentes à recuperação pública. Dependência registrada no reteste de 12/11, sem nova escrita nesta auditoria.',
      ['src/pages/DataManagement/ClientDetailPage.vue', 'src/services/clientSectionModel.js'],
      ['docs/QA-2026-10-24-ADMIN-56-60.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1995:281')
group('A12', 'Imóvel e consórcio: campos além do DTO', 'done', ['backend'],
      'Editor/expansão e anexos implementados. Suítes não existe no DTO fixo; consórcio não traz início/data de contemplação/carta liberada. Características genéricas já existem e NÃO são pendência de endpoint.',
      ['src/components/Clients/ClientAssetRegistry.vue', 'src/services/clientAssetProfile.js', 'src/services/realEstateCharacteristics.js'],
      ['docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md', 'docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:69299 1484:69408 1484:69651 1557:2 1559:297 1560:216 2053:284')
group('A13', 'Veículo/investimento e erros do editor', 'done', [],
      'Fluxos e validações documentados em 56–60/121–130; arquivos e moeda preservados. Estados não cobertos por essa evidência exigem regressão futura, não nova implementação presumida.',
      ['src/components/Clients/ClientAssetRegistry.vue', 'src/components/Clients/AssetDocuments.vue'],
      ['docs/QA-2026-10-24-ADMIN-56-60.md', 'docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md'], '1484:69564 1484:69736 1559:71 1560:383 2077:281')
group('C01', 'Cadastro CT04/CT05: distribuição e importação', 'done', ['designer','backend'],
      'Rascunho/retomada testados. Falta desenho da distribuição após CT05 e modelo de importação. Estratégia/tipos de upload também têm lacunas HTTP; não há aprovação do cadastro integral.',
      ['src/pages/Contracts/ContractsPage.vue'], ['docs/QA-2026-11-13-CONTRATOS-CT04-CT07.md'], '1484:71334 1484:72006')
group('C02', 'Contrato aberto e dados operacionais', 'done', ['backend'],
      'Leitura, histórico e edição dos dados suportados testados; posição/performance/operações e composição estratégica não estão concluídas na API registrada.',
      ['src/components/Finance/ContractSections.vue'], ['docs/QA-2026-11-13-CONTRATOS-CT04-CT07.md', 'docs/CHECKLIST-UNICO-FIGMA-FRONT.md#contratos--contraste-e-estados-expandidos-rodada-atual'], '1484:72188 2149:300 2157:281 2157:348 1484:73154 1484:73364 1484:73521 1484:75082 1484:75314 1484:75524')
group('C03', 'CT12: gatilho e execução', 'validation', ['designer','backend'],
      'Modal desenhado sem gatilho localizado em CT07/CT11; operações intradiárias não têm contrato operacional. Não criar botão. Revisão de composição ainda pendente.',
      ['src/components/Finance/ContractSections.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#contratos--contraste-e-estados-expandidos-rodada-atual'], '1484:73658')
group('C04', 'Ativos e documentos: definições do fluxo', 'done', ['designer','backend'],
      'Ativo bolsa e vínculos documentais testados; cripto/abertura de inclusão precisam da definição registrada. Tipos do contrato, PATCH do vínculo e exportação Excel/PDF continuam separados.',
      ['src/components/Finance/ContractSections.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#contratos--contraste-e-estados-expandidos-rodada-atual'], '1484:72120 1484:74946')
group('C05', 'Ativos vinculados e dívidas', 'done', ['backend'],
      'Composição disponível e testes registrados; exportação/edição de vínculo e campos/remoção de dívida não são cobertos pelo contrato atual documentado. Status de dívida também requer mapeamento de produto.',
      ['src/components/Finance/ContractSections.vue', 'src/services/contractDebtModel.js'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#contratos--contraste-e-estados-expandidos-rodada-atual'], '1484:73745 1484:73893 1484:74090 1484:74204 1484:74335 1484:74524 1484:74680')
group('C06', 'Seleção de contratos e inclusão de participante', 'validation', [],
      'Código e cenários específicos existentes; revisão integral do frame e escrita integrada restante não foram comprovadas. Nenhum defeito adicional nem endpoint ausente foi inferido.',
      ['src/pages/Contracts/ContractsPage.vue'], ['docs/QA-2026-11-13-CONTRATOS-CT04-CT07.md', 'docs/CHECKLIST-UNICO-FIGMA-FRONT.md#ct09--inclusão-de-participante-no-contrato-existente-1511'], '1484:69985 1484:70685 1484:73324', browser='parcial histórica; revisão integral pendente')
group('L01', 'Lógicas: base/configuração ainda a comparar', 'validation', ['backend'],
      'Há composição e testes parciais, mas falta revisão integral dos frames. API continua só catálogo/metadados, sem execução/configuração operacional. Não atribuir toda a conclusão ao backend.',
      ['src/components/Workspaces/LogicWorkspace.vue', 'src/components/Workspaces/LogicPerformance.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#lógicas--estados-de-performance-e-simulação', 'docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:76065 1484:76704 1484:77323 1484:77408 1484:78227 1484:79982 1484:82147', browser='parcial histórica; frame integral pendente')
group('L02', 'Estado ativo com Pausar', 'adjustment', ['backend'],
      'LogicCard oferece Abrir/Editar/Vínculos; o estado Pausar/Editar/Entrar ainda não está composto. Execução de pausa também precisa do contrato operacional, sem simular sucesso.',
      ['src/components/Workspaces/LogicCard.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#dependências-reais-de-api'], '1484:77384', browser='sem validação deste estado')
group('L03', 'Lógicas: estados compostos/testados com API pendente', 'done', ['backend'],
      'Estados específicos têm evidência local/publicada; resultados, filtros operacionais, séries e gravação não são fornecidos pelo catálogo. Teste de estado isolado não aprova a execução real.',
      ['src/components/Workspaces/LogicCard.vue', 'src/components/Workspaces/LogicHistory.vue', 'src/services/adminWorkspaceModel.js'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#lg09--tabela-completa-recuperada-1411-complemento', 'docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:77198 1484:77225 1484:77226 1484:77335 1484:77346 1484:77353 1484:79712 1484:79755 1484:79802 1484:79819 1484:79883 1484:83473 1484:83540 1484:85344')
group('L04', 'Últimos componentes publicados sem navegador', 'validation', ['backend'],
      'EC01/EC02/EC03/EC07 publicados e testados em SSR/HTTP; não houve revisão visual/fluxos no navegador. Configuração operacional continua dependente da API.',
      ['src/components/Workspaces/LogicIdentity.vue', 'src/components/Workspaces/LogicDraftPreview.vue', 'src/components/Workspaces/LogicFrequency.vue', 'src/components/Workspaces/LogicSovereign.vue'], ['docs/evidence/qa-2026-11-16-identity/validation-results.json', 'docs/evidence/qa-2026-11-16-preview/validation-results.json', 'docs/evidence/qa-2026-11-16-frequency/validation-results.json', 'docs/evidence/qa-2026-11-16-sovereign/validation-results.json'], '1484:79229 1484:79361 1484:79457 1484:79553 1484:79652 1484:79941', browser='não executada; somente SSR/HTTP')
group('T01', 'Admin: criação de transação sem envio conectado', 'adjustment', [],
      'TransactionCreate.submitOperation inicia null e TransctionPage não passa a função; Confirmar fica bloqueado. POST depósitos/saques/transferências existe no OpenAPI: integração é do front.',
      ['src/pages/TransctionPage.vue', 'src/components/Finance/TransactionCreate.vue'], ['docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:86271 1484:86319 1484:86383 1484:86476 2027:301', browser='diagnóstico de código; não reproduzido no navegador')
group('T02', 'Admin: senha, transferência entre clientes e correção/edição', 'adjustment', [],
      'Confirmação atual envia action/reason/expectedVersion sem senha; não há destinatário na criação nem telas de correção/edição conectadas. Endpoints e campos correspondentes existem na OpenAPI; não cobrar como ausência de API.',
      ['src/pages/TransctionPage.vue', 'src/components/Finance/TransactionCreate.vue'], ['docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1484:86593 1484:86762 1484:86782 1484:86802 2282:289 2152:329 2153:281 2160:281 2161:281 2179:281 2179:355 2187:404', browser='diagnóstico de código; não executadas operações financeiras')
group('T03', 'Admin: extrato, documentos, observação e carteiras', 'validation', [],
      'Componentes e consultas existem, mas falta comparação integral aos estados listados e regressão integrada. Isto é trabalho de validação do front, sem afirmar novo defeito visual ou ausência de API.',
      ['src/pages/TransctionPage.vue', 'src/components/Finance/WalletDirectory.vue', 'src/components/Finance/WalletOverview.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#ainda-é-trabalho-de-frontend'], '1484:85378 1484:86740 1484:86742 1484:86822 1484:86842 1484:86864 1484:86887 1484:86920 1484:87711 1484:88127 1484:88727 1484:89127 1484:89697 1484:90218 1484:90787 1484:91469', browser='sem aprovação integral por frame')
group('R01', 'CRM de crédito: composição parcial e contratos do funil', 'validation', ['backend'],
      'Há Lista/Cards/Kanban e escolha de tipo/cliente com testes parciais; revisão completa ainda pendente. OpenAPI de loans é informativo e não fornece funil, propostas, parceiros e comissões.',
      ['src/components/Workspaces/CreditWorkspace.vue', 'src/components/Workspaces/CreditOperationDetails.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#cr06-e-lg08--complemento-de-1411', 'docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], browser='parcial/isolada histórica; não integral')
group('R02', 'Parceiro: oferecido versus habilitado', 'validation', ['designer','backend'],
      'CR08/CR09 não definem como distinguir produtos oferecidos/habilitados; precisa decisão do designer/produto e persistência CRM. Composição integral não aprovada.',
      ['src/components/Workspaces/CreditWorkspace.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#definições-do-designer'], '1484:95173 1484:95475')
group('R03', 'Detalhes de operação de crédito', 'done', ['backend'],
      'CR06 composto/testado isoladamente; documentos/histórico informativos existem. Faltam dados e ações de funil/propostas, não a listagem informativa de loans.',
      ['src/components/Workspaces/CreditOperationDetails.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#cr06-e-lg08--complemento-de-1411'], '1484:94059', browser='isolada histórica; sem massa integrada de proposta')
group('M01', 'Comunicação: base e prévia ainda a comparar', 'validation', ['backend'],
      'Consulta e edição textual existentes; faltam revisão integral do frame e metadados/grupos editoriais. Não converter categorias HTTP nos grupos do desenho por aproximação.',
      ['src/components/Workspaces/PublicationWorkspace.vue', 'src/components/Workspaces/PublicationPreview.vue'], ['docs/QA-2026-11-12-COMUNICADOS-TRANSFERENCIAS.md'], '1484:96067 1484:96838', browser='parcial histórica; frame integral pendente')
group('M02', 'Redatores e seleção de grupo editorial', 'done', ['backend'],
      'Cards/modal de redator e seletor compostos/testados; falta API de redatores/perfis/foto e correspondência dos grupos editoriais para persistência. Não simular sucesso.',
      ['src/components/Workspaces/AuthorCard.vue', 'src/components/Workspaces/AuthorDialog.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#co02--cards-de-redatores-referência-recuperada-1411'], '1484:96418 1484:96692 1484:96758')
group('M03', 'Editor de mídia e agendamento', 'validation', ['designer','backend'],
      'Estado aberto de mídia/H2/H3 e escolha de data de Programar não estão definidos nos contextos recuperados; editor completo não concluído. Metadados/anexos também exigem contrato.',
      ['src/components/Workspaces/PublicationWorkspace.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#definições-do-designer'], '1484:96882 1484:97193 1484:97530 1484:97906')
group('M04', 'Abas/status da Comunicação e Auditoria', 'done', [],
      'Estados específicos de abas/status e consulta geral de Auditoria têm testes/publicação, incluindo filtros, exportação e navegação. Não certifica geração de todos os eventos em todos os módulos.',
      ['src/pages/Settings/AuditPage.vue', 'src/components/Workspaces/PublicationStatus.vue'], ['docs/QA-2026-11-12-AUDITORIA-132-REVISAO-COMPLETA.md', 'docs/CHECKLIST-UNICO-FIGMA-FRONT.md#comunicação-co07--ec01--ec02--complemento-de-1411'], '1484:96662 2255:283')

group('P01', 'Portal: saque sem envio conectado', 'adjustment', [],
      'WalletOperation exige submitOperation; CashWalletPage e WalletTotal não o fornecem. POST /client/transactions/withdrawals existe. Integrar envio/retorno e testar sucesso real; não cobrar endpoint ausente nem afirmar sucesso atual.',
      ['portal:src/system/pages/Wallet/CashWalletPage.vue', 'portal:src/system/components/wallet/WalletTotal.vue', 'portal:src/system/components/wallet/WalletOperation.vue'], ['docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], '1:28279 251:28194 1:28349 1:28421 1:28491', browser='diagnóstico de código; envio não exercitado')
group('P02', 'Portal: Home com métricas do motor', 'done', ['backend'],
      'Dados reais e tratamento de indisponibilidade implementados; gráfico/comparação/resultados dependem de projeção operacional. Não copiar curva de exemplo.',
      ['portal:src/system/pages/DashboardPage.vue', 'portal:src/system/components/wallet/WalletTotal.vue'], ['portal:docs/QA-2026-10-19-HOME.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1:29678')
group('P03', 'Portal: Home nova sem depósito', 'done', [],
      'Zero confirmado por consultas independentes, boas-vindas, períodos e navegação para Contratos têm evidências reais. Primeiro depósito não tem sucesso simulado.',
      ['portal:src/system/components/wallet/HomeEmptyState.vue'], ['portal:docs/QA-2026-10-19-HOME.md'], '1:31985 1:32335')
group('P04', 'Portal: contratos e variações completas', 'validation', ['backend'],
      'Lista/detalhe genéricos integrados e testados funcionalmente; não comprovam a composição integral dos frames e temas. Métricas individuais/performance ainda têm lacunas registradas. Não marcar todos os desenhos como concluídos pela aprovação de navegação.',
      ['portal:src/system/pages/contract/ContractsPage.vue', 'portal:src/system/pages/contract/ContractPage.vue'], ['docs/QA-2026-11-12-LISTA-CONTRATOS.md', 'docs/QA-2026-11-12-CONTRATOS-NAVEGACAO.md'], '1:32479 1:45691 1:46764 1:48631 1:50141 211:28821 1:69127 1:70897', browser='navegação/dados testados; composição integral pendente')
group('P05', 'Portal: oferta de contrato', 'adjustment', [],
      'As páginas roteadas oferecem tabela e detalhe resumido, sem composição/ação de oferta dos seis estados. Recuperar a referência completa e conectar os estados aprovados; isto não comprova ausência de API nem falta de desenho.',
      ['portal:src/router/routes.js', 'portal:src/system/pages/contract/ContractsPage.vue'], ['docs/CHECKLIST-UNICO-FIGMA-FRONT.md#ainda-é-trabalho-de-frontend'], '1:34294 1:36148 1:37994 1:39818 1:41796 1:43678', browser='fluxo não integrado')
group('P06', 'Portal: empréstimos/alavancagem legados', 'adjustment', ['backend'],
      'Páginas roteadas usam JSON fake; uploads simulam com setTimeout; bloqueio de nível compara só ==1, não regra oficial de nível 3. Remover simulação e integrar leituras GET /client/loans existentes. Solicitações/ofertas/funil não têm contrato completo; não pedir nova API para a listagem já disponível.',
      ['portal:src/system/pages/loan/LoanPage.vue', 'portal:src/system/pages/leverage/LeveragePage.vue', 'portal:src/system/layouts/leverage/yourLeverages/ActiveYourLeverages.vue', 'portal:src/system/layouts/loans/steps/DocUploadLoanLayout.vue'], ['docs/evidence/qa-2026-11-16-inventory/api-contract-review.json'], browser='código confirmado; fluxos legados não homologados')
group('P07', 'Portal: Comunicação e metadados', 'done', ['backend','massa'],
      'Lista/card/detalhe têm testes reais de bloqueio e controlados de sucesso. Falta massa nível 2 para sucesso real; autor/capa/grupos/anexos/PDF continuam sem contrato completo registrado. Massa não é bug da API.',
      ['portal:src/system/layouts/communication/CommunicationLayout.vue'], ['docs/QA-2026-11-12-COMUNICADOS-TRANSFERENCIAS.md'], '1:64153 1:64344 1:64591 1:64751 1:65313 1:65403 1:65504', browser='bloqueio real e sucesso controlado; sucesso integrado pendente')
group('P08', 'Portal: Comunicação vazia e bloqueada', 'done', [],
      'Vazio/erro/bloqueio e retry têm testes controlados e bloqueio real de nível. Não pressupõe sucesso de publicação/recibo com nível 2.',
      ['portal:src/system/layouts/communication/CommunicationLayout.vue'], ['docs/QA-2026-11-12-COMUNICADOS-TRANSFERENCIAS.md'], '10:26031 208:27698')
group('P09', 'Portal: perfil e documentação com lacunas cadastrais', 'done', ['backend'],
      'Dados reais/edição/retomada testados; tipos documentais elegíveis e identificação de versão vigente continuam no reteste de 12/11. Renda atual, moedas e upload genérico já existem e não são cobrados de novo.',
      ['portal:src/composables/system/useClientProfile.js'], ['docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1:65981 1:66213 1:67249')
group('P10', 'Portal: bancos, termos e resumo do perfil', 'done', [],
      'Fluxos suportados retestados em homologação; titular derivado, termos/abas e resumo preservam dados reais. Éric fornece cenário bancário positivo; ausência fiscal de Cláudio é massa.',
      ['portal:src/composables/system/useClientProfile.js'], ['docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md', 'docs/QA-2026-11-12-PERFIL-TERMOS-E-ABAS.md'], '1:66443 1:67143 1:67951 1:68090 163:27273')
group('P11', 'Portal: patrimônio e dados além do DTO', 'done', ['backend'],
      'CRUD/documentos/fotos suportados testados; suítes e início do consórcio continuam sem campo específico. Características genéricas e moeda patrimonial automática já existem.',
      ['portal:src/system/layouts/config/RegisterAssetsLayout.vue'], ['docs/QA-2026-11-12-PATRIMONIO-DOCUMENTOS-ABERTURA.md', 'docs/QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md'], '1:66549 1:66813')
group('P12', 'Portal: temas/variações ainda sem comparação integral', 'validation', [],
      'Teste de tema no perfil não aprova automaticamente os clones de Home/Comunicação/resumo; manter regressão específica por frame, sem afirmar defeito visual novo.',
      ['portal:src/system/pages/DashboardPage.vue', 'portal:src/system/pages/CommunicationPage.vue'], ['docs/QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md'], '1:68461 1:68794 1:72906 1:73097 1:73288 1:73602', browser='comparação específica pendente')
group('P13', 'Portal: cadastro vigente e login', 'done', [],
      'Matriz consolidada de 12/11 substitui as notas iniciais de prévia: cadastro/código, profissional antes de documentos, consentimentos, submit, retomada e bloqueio/análise têm evidências. Etapa 2 aprovada confirma e-mail; o título legado não autoriza inventar SMS.',
      ['portal:src/system/pages/registration/RegistrationReviewPage.vue', 'portal:src/system/components/registration/RegistrationEmailStep.vue', 'portal:src/services/registrationIntegration.js'], ['docs/CHECKLIST-CADASTRO-SETE-ETAPAS.md', 'docs/QA-2026-10-22-ENVIO-CONSENTIMENTOS.md', 'docs/QA-2026-10-23-REENVIO-PERFIL.md'], '4:25438 4:25513 4:25620 6:25562 9:25789 9:25883 9:25964 9:26067 9:26096 6:25690 121:27090')
group('P14', 'Portal: variantes internacionais de documentos', 'validation', [],
      'Existem definições/validações por variante; teste integrado BR não aprova os outros sete países/regiões. Executar massa e catálogo por país antes de atribuir falha ao backend.',
      ['portal:src/services/registrationDocuments.js', 'portal:src/system/pages/registration/RegistrationDocumentPage.vue'], ['docs/CHECKLIST-CADASTRO-SETE-ETAPAS.md'], '37:27142 37:27262 37:27382 37:27502 37:27622 37:27742 37:27862', browser='validações locais por variante; upload/retomada integrados pendentes')

for r in rows:
    excluded = bool(re.match(r'^F\d+\s*[·.]', r['name']) or 'CONEXÃO' in r['name'] or
                    re.match(r'^A\d+\s*·', r['name']) and 'Login' not in r['name'] and 'Seleção de Sistema' not in r['name'])
    r['counted'] = not excluded
    key = mapping.get(r['id'])
    if not key and r['area'] == 'Área do Cliente' and any(t in r['name'] for t in ['ALAVANCAGEM','EMPRÉSTIMO','OFERTAS','CONSÓRCIO']): key = 'P06'
    if not key and r['area'] == 'Admin' and any(t in r['name'] for t in ['CR0','CR10','EC02.S','EC03.S','Nova operação','Visualização Lista / Cards / Kanban','Lista selecionada','Cards selecionado','Kanban selecionado','Painel de estados do componente · Parceiros']): key = 'R01'
    if excluded:
        r.update(group=None, category='Agregador/conexão', front='excluded', blockers=[], reason='Agrupamento ou ligação do Figma; avaliar os estados filhos, sem contar como entrega independente.', sources=[], evidence=[], browser='não aprova estados filhos')
    else:
        assert key, 'UNCLASSIFIED: '+r['id']+' '+r['name']
        g=groups[key]
        category = 'Ajuste de front' if g['front'] != 'done' else ('Bloqueio designer/produto' if 'designer' in g['blockers'] else 'Bloqueio backend' if 'backend' in g['blockers'] else 'Já correto')
        r.update(group=key, category=category, **{k:g[k] for k in ['front','blockers','reason','sources','evidence','browser']})

for g in groups.values():
    for ref in g['sources']+g['evidence']:
        base=PORTAL if ref.startswith('portal:') else ROOT
        path=ref.removeprefix('portal:').split('#')[0]
        assert (base/path).exists(), str(base/path)

leaf=[r for r in rows if r['counted']]
metrics={'inventoryEntries':len(rows),'reviewedRevalidar':sum(r['oldStatus']=='Revalidar' for r in rows),
         'excludedGroupsAndConnections':len(rows)-len(leaf),'deliverableFrames':len(leaf),
         'categories':dict(Counter(r['category'] for r in leaf)), 'frontState':dict(Counter(r['front'] for r in leaf)),
         'dependencies':{key:sum(key in r['blockers'] for r in leaf) for key in ['backend','designer','massa']}}
audit={'date':'2026-11-16','method':'Source and existing evidence audit plus fresh read-only OpenAPI inspection. No browser/visual retest. Equal weight per deliverable frame, not hours. Historical evidence is not a new integrated test.', 'metrics':metrics,'groups':groups,'items':rows}
(HERE/'classification.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')

p=ROOT/'docs/CHECKLIST-UNICO-FIGMA-FRONT.md'
s=p.read_text()
labels={'done':'implementação conferida','adjustment':'implementação pendente confirmada','validation':'validação/comparação pendente; sem defeito adicional presumido'}
byid={r['id']:r for r in rows}
out=[]
for line in s.splitlines():
    if line.startswith('| ['):
        cells=line.split('|'); node=cells[1].split(']')[0][2:]; r=byid[node]
        status='Agregador/conexão — fora do percentual; ver estados filhos' if not r['counted'] else f"{r['category']} · {r['group']} · {labels[r['front']]}"
        cells[3]=' '+status+' ';line='|'.join(cells)
    out.append(line)
s='\n'.join(out)+'\n'
old='Legenda: **Preparado / revisão pendente** = há código novo, mas a validação completa do frame não terminou. **Revalidar** = consultar a implementação e evidências anteriores antes de marcar pronto. O inventário não atribui ao backend telas ainda não implementadas.'
s=s.replace(old,'Legenda vigente: classificação de 16/11 por código e evidências, detalhada em **Auditoria do inventário** acima. Já correto usa evidência histórica; não significa novo reteste. Ajuste de front separa implementação confirmada de validação pendente. Dependências secundárias constam na matriz de grupos e no JSON. Agrupadores/conexões não entram no denominador.')
total=len(leaf)
summary='''## Auditoria do inventário — classificação de 16/11

Revisados os **222 itens antes marcados Revalidar**, além da normalização dos demais estados para usar o mesmo critério. Foram cruzados código roteado dos dois projetos, relatórios/evidências de outubro–novembro e OpenAPI atual. **Nenhuma tela foi revalidada no navegador nesta auditoria.** Nenhuma escrita de negócio foi executada.

### Percentual por frame entregável

O inventário tem **309 entradas**; **30 são agrupamentos/conexões**, sem entrega independente. O denominador é **279 frames/estados**, igualmente ponderados. Este é percentual de itens, não de horas ou complexidade; diferenças de 0,1 ponto nas somas podem ocorrer por arredondamento. Painéis/temas específicos continuam separados quando são estados explícitos do inventário. A classificação não transforma um módulo legado inteiro em um único item.

| Situação principal | Itens | Percentual |
| --- | ---: | ---: |
'''
for category in ['Já correto','Ajuste de front','Bloqueio backend','Bloqueio designer/produto']:
    count=metrics['categories'].get(category,0);summary+=f'| {category} | {count} | {100*count/total:.1f}% |\n'
summary+='\n### O que ainda falta no front\n\n| Trabalho | Itens | Percentual do inventário entregável |\n| --- | ---: | ---: |\n'
for state,label in [('adjustment','Implementação/integração pendente confirmada'),('validation','Validação/comparação ainda pendente'),('done','Implementação conferida, com ou sem dependência externa')]:
    count=metrics['frontState'].get(state,0);summary+=f'| {label} | {count} | {100*count/total:.1f}% |\n'
summary+='''
**Não confundir validação pendente com bug confirmado.** Nos itens dessa fila há código, mas falta comprovar o frame completo. Eles não foram classificados como já corretos, nem como defeitos visuais inventados. O percentual de implementação ainda pode aumentar após essa comparação; não há base para um número único de horas restantes.

Bloqueios secundários podem coexistir com trabalho de front; por isso a contagem de dependências não deve ser somada à tabela principal. “Bloqueio backend” não significa que o front inteiro do módulo esteja sem trabalho: usar a coluna de estado de implementação e o motivo de cada grupo.

### Pendências confirmadas que são do front

- **T01:** nova transação no Admin sem submitOperation conectado; há POST de depósitos, saques e transferências na API.
- **T02:** confirmação sem senha administrativa; transferência para outro cliente, correção de depósito e edição pendente não conectadas, apesar de contratos HTTP existentes.
- **P01:** saque do portal também depende de submitOperation não fornecido pelos pais; POST de saque existe.
- **P05:** oferta de contrato não tem fluxo de etapas conectado no router. Recuperar a referência completa e conectar os estados; não foi presumido novo bloqueio de backend/designer.
- **P06:** rotas de empréstimo/ofertas e Minhas Alavancagens usam JSON fictício e upload com temporizador; bloqueio inicial de alavancagem compara somente nível 1. Leituras informativas já possuem API; solicitações/ofertas de CRM não devem ser simuladas.
- **L02:** estado ativo Pausar/Editar/Entrar ainda não está composto no LogicCard; executar Pausar também precisa do contrato operacional.

### Evidências e limites da classificação

- **Já correto:** código e teste/publicação históricos localizados para o comportamento descrito; não é novo aceite do QA ou garantia de todos os temas/massas.
- **Bloqueio backend:** lacuna estrutural confirmada na OpenAPI ou falha integrada datada nos relatórios. A última falha de dado de 12/11 não foi repetida hoje; isso está explícito no grupo. Catálogo/endpoint existente não é cobrado de novo.
- **Designer/produto:** inclui distribuição CT05, importação, gatilho CT12, grupos/estado aberto de editor e escala de classificação. Dependência não autoriza inventar controles.
- **Massa:** nível 2 de Comunicação e documento fiscal de Cláudio são condições de teste. Não são novos bugs de API; os testes controlados não são declarados sucesso integrado.
- **Superado:** características genéricas de imóvel já existem e estão integradas. Renda, sessões por cliente, principal de conta única, documento mascarado, submit/consentimentos e alternativas de identificação não foram reabertos como endpoints ausentes.
- **Não contar como entrega:** cabeçalhos F01/F02/F03/F04, conexões e setas Axx de protótipo. Seus estados filhos permanecem classificados.

Esta auditoria altera somente documentação/evidências. Os relatórios históricos abaixo preservam seus resultados e limites; o resumo antigo “86% a revisar” foi substituído por esta base contável. Fonte completa por item, status anterior, motivo, arquivos e dependências: [classification.json](evidence/qa-2026-11-16-inventory/classification.json). Contratos conferidos: [api-contract-review.json](evidence/qa-2026-11-16-inventory/api-contract-review.json). O gerador classify_inventory.py valida cobertura, referências e totais; ele não testa UI.

### Matriz de motivos por grupo

| Grupo | Superfície / evidência | Estado de front | Dependência | Motivo e código consultado |
| --- | --- | --- | --- | --- |
'''
for key,g in groups.items():
    used=sum(r.get('group')==key for r in leaf)
    if not used: continue
    ev=g['evidence'][0]
    href=('../../Strategy-analytics-v2/'+ev[7:]) if ev.startswith('portal:') else ev.removeprefix('docs/')
    code=', '.join(g['sources'])
    summary+=f"| {key} | {g['title']} ({used}) · [evidência]({href}) | {labels[g['front']]} | {', '.join(g['blockers']) or '—'} | {g['reason']} Código: {code}. Navegador: {g['browser']}. |\n"
summary+='\n'
if '## Auditoria do inventário — classificação de 16/11' in s:
    a=s.index('## Auditoria do inventário — classificação de 16/11');b=s.index('## EC01 — Identidade',a);s=s[:a]+summary+s[b:]
else:s=s.replace('## EC01 — Identidade',summary+'## EC01 — Identidade',1)
p.write_text(s)
print(json.dumps(metrics,ensure_ascii=False,indent=2))
