# QA de 17/10 — triagem e primeiro lote de correções

Atualizado em 20/10/2026. Referência: feedback de homologação enviado pelo usuário, com 19 itens. Este registro não aprova integralmente o Marco 3 nem substitui o checklist de homologação integrada.

## Primeira rodada — registro histórico

- Portal: `/system/` redireciona para a Home; login confirmado entra diretamente na Home.
- Portal: nova tentativa de login limpa o estado anterior; antes de entrar, compara o e-mail digitado e o usuário do login com `/auth/me`, e valida `/client/auth/ping`.
- Portal: respostas e renovações de token de uma sessão anterior são rejeitadas. Uma renovação antiga não pode sobrescrever cookies de outro login nem encerrar a nova sessão. Requisições simultâneas compartilham uma renovação.
- Portal: logout e falha de validação limpam o estado do usuário; foi removido o log bruto do erro de logout.
- Portal: textos do campo de senha, link de cadastro e banner corrigidos conforme o QA.
- Admin: `/landing-page` e `/edit-lp` exigem sessão e papel `Admin`, consultado em `/auth/me`. Isso protege a navegação; a autorização dos endpoints continua obrigatória no servidor.
- Admin: removidos logs de query da autenticação; menu inclui Transações e Contratos existentes.
- Admin: datas sem horário preservam o dia informado pela API na listagem de clientes. Datas com horário continuam respeitando o fuso local.

## Situação por item — leitura atual; histórico das rodadas abaixo

| QA | Situação atualizada em 20/10 | Próximo passo |
| --- | --- | --- |
| 1 | Redirecionamento/login corrigidos; criação e recebimento do código confirmados pelo usuário, sessão da conta nova validada. | Cadastro completo ainda parcial por aceite/versionamento, contatos e envio final; upload/revisão documental já retestados. |
| 2 | Preferências integradas; Cláudio desbloqueado e conta real sem movimentos validada com zeros após concluir preferências. Erro e resposta incompleta não viram zero. | Comparação entre períodos continua sem fonte na API. Evidências atuais no portal: docs/QA-2026-10-19-HOME.md e docs/QA-2026-10-19-PREFERENCIAS.md. |
| 3 | Estado sem depósito e regras de períodos implementados. Datas de execução e série real são preservadas; gráfico indisponível não é tratado como conta vazia. | Motor/série seguem indisponíveis na API; Fazer primeiro depósito reutiliza o aviso existente porque não há iniciação de depósito do cliente confirmada. |
| 4 | Estado sem contratos implementado e validado com conta real vazia. Solicitar contrato abre a página de Contratos existente, conforme orientação do usuário. | Não envia pedido ao backend; nenhum fluxo adicional foi criado. |
| 5 | Resumo demonstrativo de empréstimos removido da Home. | Sem fonte de dívida no contrato atual para homologar presença/ausência de empréstimos. Não simular ausência de dívida após erro. |
| 6 | Estado vazio do Figma aplicado na página e na Home; mocks, filtros e contadores fictícios retirados das listagens. | Integração de publicações depende de contrato HTTP; o Swagger consultado não contém endpoint de conteúdo. |
| 7 | Sete etapas integradas nos endpoints existentes. Ordem autorizada: profissional/moedas 4, documentos/endereço 5. CEP, retomada local, upload, aprovação, reprovação/motivo e reenvio retestados com arquivos fictícios. | Permanecem catálogos/campos, relationship/ausência de contatos, aceite, progresso entre dispositivos e envio final. Regra CNH e vínculo/metadados do replace dependem do backend. Ver CHECKLIST-CADASTRO-SETE-ETAPAS.md. |
| 8 | Dados reais no resumo/perfil/ajustes; edição por aprovação, contatos, valores opcionais/decimais, datas, descarte, erros/retry e sessões corrigidos. Catálogo bancário completo e formulário mobile corrigidos (97f5e72/027257b), sem novos campos ou ações. Detalhes e retestes nas rodadas abaixo. | Conferência independente preservou integralmente os contatos. Reteste financeiro posterior reabre a homologação integrada: histórico recebe a escrita, mas GET atual retorna registro anterior; ver pendência consolidada. Revisão/envio cadastral final, campos/catálogos, patrimônio próprio, termos e compartilhamento continuam dependentes de contrato. |
| 9 | Três textos corrigidos; avatar usa a URL da API e ícone neutro quando ausente ou com falha, sem imagem quebrada ou foto demonstrativa. | Carregamento de uma foto válida depende de URL/arquivo real disponível para reteste. Não exigir cadastro ou upload de foto fora do Figma. |
| 10 | Aprovar/Reprovar e reenvio testados no Admin/portal. Motivo/mensagem exibidos após correção do front; contadores atualizados. CNH aprovada pelo usuário levou a 100%/LEVEL_1; edição retestada com escrita e recarga. | Alinhar CNH obrigatória ao Figma; replace mantém antigo rejeitado e retorna metadados vazios no novo. Estado oficial de envio/revisão cadastral C25–C26 e catálogo adicional de motivos seguem não homologados. |
| 11 | Campos de identificação preservados durante edição, no mesmo bloco; nascimento impossível/futuro bloqueado em 60423d3. | Edição de documentos e dados pessoais sem contrato de escrita continua bloqueada; ver QA-2026-10-19-EDICAO-POR-SECAO.md. |
| 12 | Composição profissional/financeira mantida com cinco campos do Figma C24. Precisão decimal preservada desde o input até o payload; formatação equivalente não habilita gravação (0fe6f92/96ebd34). | 96ebd34 publicado; formatação, validação, destaque e descarte retestados em homologação, sem novos registros. Consulta financeira vigente continua pendência do backend. |
| 13 | Preferências migradas para edição por seção, sem salvamento isolado. | Preservar país e demais metadados da API sem criar campos adicionais. |
| 14 | Corrigido e retestado em 19/10 no Admin local e publicado: Jane com quatro saldos zero, composição e extrato vazios conforme C29; depósito e saldo do Cláudio conferidos. | Deploy 8c64763 confirmado. Evidências e limites em QA-2026-10-19-CARTEIRA-VAZIA.md. |
| 15 | Edição global substituída por uma seção por vez: rascunho, salvar, descartar, bloqueio e proteção de saída implementados conforme C24. | Limites de escrita de identificação/segurança/compliance documentados; aprovação integral depende desses contratos e reteste do QA. |
| 16 | Menu e seleção A02 implementados; telas integradas acessíveis. Configuração documental corrigida para mostrar todos os tipos recebidos, em vez de cinco sem navegação. Entrada legada /dashboard abre Clientes e /landing-page mostra A02 com exigência de administrador, eliminando as duas entradas vazias. | Parcial: Lógicas, Leads, Assessores e editor de LP ainda são protótipos; Crédito e Comunicados sem integração. Nenhum dashboard novo foi criado. Contratos HTTP dos módulos permanecem em PENDENCIAS-BACKEND-QA.md. |
| 17 | Data sem horário preservada; histórico atual traduzido para português; países dos bancos resolvidos pelo catálogo real, sem UUID na tela. Busca bancária corrigida para considerar o catálogo completo antes da paginação, com contadores filtrados. Paginação da gestão de bancos ajustada para exibir a página recebida inteira; no perfil, leitura das três páginas do catálogo de 513 bancos corrigida, com falha/retry e nomes posteriores à primeira página cobertos por testes. Listagem de clientes passa a respeitar a última consulta entre busca/filtros/cartões/tabela, com erro/retentativa padrão (00d601f). | Unicidade de e-mail continua no servidor. Observações e auditoria são preservadas; títulos novos sem tradução mantêm o texto fornecido. |
| 18 | Proteções de identidade e concorrência implementadas e testadas. Incidente original não reproduzido. | Correlacionar logs de autenticação e acesso do QA em 17/10 às 18:16 e retestar no deploy corrigido. Não solicitar senha pessoal do QA. |
| 19 | Rotas de LP protegidas no front por sessão e papel. Tokens ainda usam o transporte atual. | Validar autorização da API e implementar sessão com cookies HttpOnly no servidor/BFF, seguida da adaptação dos dois fronts. |

## Validações da primeira rodada — registro histórico

- Admin na porta 8080; portal na porta 9010.
- Portal: login do Éric abriu a Home e exibiu investimento em USD 250.000,00 e saldo investível BRL 47.500,00. Resumo do perfil identificou Éric.
- Portal: após sair, login do Cláudio abriu a Home e exibiu Banking BRL 25.000,00. Carteira consolidada e contratos ficaram bloqueados por `PreferencesRequired`; não foram considerados aprovados.
- Admin: acesso sem sessão à LP redirecionou para autenticação; sessão administrativa e atalhos conferidos no navegador.
- Testes automatizados: 5 cenários no Admin (acesso administrativo e data no fuso de São Paulo); 13 cenários/testes no portal, incluindo os existentes e 7 novos de isolamento de sessão. Todos passaram.
- `npm run build`: aprovado nos dois projetos, com avisos preexistentes de dependências/chunks/fontes.
- `npm run lint`: aprovado no Admin. No portal, a configuração legada é incompatível com ESLint 9 e eslint-plugin-vue 10 instalados. A avaliação temporária com configuração compatível também revelou 18 erros preexistentes em outros componentes. A configuração e esses componentes não foram alterados neste lote; o lint global do portal permanece pendente.
- Os arquivos alterados do portal foram avaliados com as regras essenciais compatíveis do plugin Vue: nenhum erro. `git diff --check` passou nos arquivos deste lote. O comando global ainda aponta finais de linha em três arquivos que já estavam modificados antes deste trabalho e foram preservados.

## Encaminhamento ao backend

### Ambientes do QA e conferência do deploy em 19/10

O usuário confirmou os endereços: portal `https://hml.strategyanalytics.com.br/` e Admin `https://admin.strategyanalytics.com.br/`.

- Sem sessão, `/landing-page` no Admin redirecionou para `/auth`. Com a conta administrativa, `/edit-lp` abriu o editor. A listagem de Transações foi acessada pelo novo menu.
- Éric entrou diretamente na Home; investimento USD 250.000,00, saldo investível BRL 47.500,00 e os dois contratos foram exibidos. O resumo identificou Éric, mas preserva os dados demonstrativos já apontados no item 8.
- Após logout do Éric, Cláudio entrou diretamente na Home e seu nome foi confirmado no resumo. Banking exibiu BRL 25.000,00; carteira consolidada e contratos exibiram o bloqueio de preferências. Não houve troca indevida de identidade nesse cenário; isso não reproduz nem encerra a investigação do incidente original.
- Os assets públicos consultados contêm os marcadores das proteções: `ERR_SESSION_CHANGED` e validação de identidade no portal; `requiresAdmin` e negativa de acesso administrativo no Admin. Isso confirma a presença dessas proteções no deploy consultado, sem atestar que os 19 itens estejam resolvidos.
- Não foram realizadas operações financeiras, alterações cadastrais ou aprovações documentais nesta conferência.

### Pendências do servidor

1. Investigar o incidente de identidade de 17/10 às 18:16, correlacionando login, refresh, usuário autenticado e último acesso. O endurecimento do front não prova a causa do incidente.
2. Definir o contrato de sessão HttpOnly para Admin e portal: criação e remoção por `Set-Cookie`, refresh/logout, `/auth/me`, credenciais CORS para 8080/9010 e proteção CSRF adequada à implantação. O front não consegue criar cookies HttpOnly.
3. Confirmar autorização administrativa nos endpoints de LP, com negativa para visitante e cliente comum. Fechar a rota não substitui isso.
4. Confirmar como resolver `PreferencesRequired` e como consultar contas novas com saldos efetivamente zero, sem ocultar saldos existentes.
5. Garantir unicidade de e-mail no servidor e revisar dados duplicados existentes.
6. Confirmar contratos HTTP dos fluxos novos: cadastro por etapas, retomada, aceite, revisão de documentos, defaults de risco/compliance/preferências e permissões de edição após aprovação.

O Figma é a referência da interface; disponibilidade de endpoints adicionais não autoriza criar campos ou ações fora do desenho.

## Complemento técnico de 20/10 — validação do portal desbloqueada

O bloqueio de lint global registrado nas rodadas anteriores foi resolvido no portal: configuração migrada para ESLint 9 sem atualizar dependências ou desativar regras essenciais. Corrigidos os 17 erros encontrados e referências ausentes em dois gráficos legados. Lint, 52 testes e build aprovados; o deploy passa a executar lint/testes antes de publicar.

Os três novos testes verificam inicialização/reatividade dos gráficos e isolamento dos defaults por instância. Login/Home/perfil do Cláudio retestados localmente com os dados e bloqueios reais preservados. Detalhes em Strategy-analytics-v2/docs/QA-2026-10-20-VALIDACAO-FRONT.md.

Este complemento não altera o status funcional dos itens dependentes de contrato HTTP. Não homologa os protótipos de crédito/distribuição nem o cadastro de sete etapas.

## Complemento funcional de 20/10 — login do Figma

Tela 4:25438 implementada reutilizando autenticação/inputs existentes. Card, campos e ações seguem o desenho; recuperação, cadastro e confirmação abrem seus fluxos existentes. Campos vazios e senha inválida conferidos; entrada pelo teclado com Cláudio abriu a Home real e logout retornou ao login. Desktop/celular sem transbordamento e assets locais nas dimensões originais. Não foi enviada recuperação nem alterada senha.

Cadastro de sete etapas, retomada, aceite e revisão continuam pendentes; este lote não os homologa. Nenhum endpoint novo foi presumido. Detalhes no portal: docs/QA-2026-10-20-LOGIN.md.

## Cadastro incremental de sete etapas — 20/10

Criado [checklist por etapa](CHECKLIST-CADASTRO-SETE-ETAPAS.md). Etapa 1 (4:25513): componentes, campos e validações locais implementados; prévia identificada, sem chamada HTTP, criação de conta ou aceite transmitido, somente em desenvolvimento. Etapas 2–7 seguem abertas. O cadastro atual em produção permanece integrado e não foi substituído por uma simulação.

## Cadastro incremental — etapa 2, 20/10

Etapa 2 (4:25620) com campo de código, e-mail mascarado e ações do Figma. Serviços/lógica de confirmação e reenvio reutilizados da confirmação pública, que permanece disponível. Conferidos obrigatórios, celular/desktop e Voltar; 70 testes, lint e build aprovados. Corrigido no reteste um erro de temporizador que interrompia a desmontagem/navegação.

A prévia de desenvolvimento bloqueia chamadas HTTP e não simula sucesso. O item de cadastro segue parcial: telas/validações locais das etapas 1–2 prontas, etapas 3–7 abertas; criação, aceite, sessão após confirmação e retomada integrada pendentes. Nenhuma mensagem real foi enviada. Ver [checklist](CHECKLIST-CADASTRO-SETE-ETAPAS.md) e [pendências](PENDENCIAS-BACKEND-QA.md).
## Cadastro incremental — etapa 3, 20/10

Tela Dados pessoais (6:25562) implementada para homologação, reutilizando estrutura, LabelField, inputWhite e assets do cadastro. Campos/ações limitados ao Figma. Validados calendário, bissextos, data futura, escolhas contra catálogo, nacionalidades repetidas e preservação do rascunho em memória ao navegar. 77 testes, lint e build aprovados; desktop/celular sem overflow.

O QA do cadastro continua parcial: faltam catálogos/obrigatórios do onboarding, país de nascimento, múltiplas nacionalidades e contrato de persistência/progresso. Nenhuma lista fictícia ou gravação presumida foi colocada no fluxo; a prévia não avança sem opções reais. Etapas 4–7 ainda aguardam implementação. Ver checklist e documento consolidado de pendências.

Publicação das telas do cadastro: o usuário pediu disponibilidade no ambiente de homologação. As etapas 1–3 estão no build em /cadastro/etapa-1, /cadastro/etapa-2 e /cadastro/etapa-3; /dev/cadastro/etapa-* permanece como alias. As telas podem ser conferidas pelo QA no ambiente publicado, mantendo os avisos de operações ainda não integradas. Isso não altera a situação dos contratos HTTP pendentes nem substitui /register.

## Cadastro incremental — etapa 4, 20/10

Documento e endereço com oito frames do Figma, publicados por rotas /cadastro/etapa-4 e /cadastro/etapa-4/:variant. Mantidos somente campos/ações desenhados; sem seletor extra, comprovante adicional, remoção de arquivos ou upload simulado. Brasil inclui filiação com ausência; passaporte troca campos específicos e usa um único arquivo.

85 testes, lint e build aprovados. Oito variações conferidas no desktop, Brasil/Japão no celular sem overflow; seleção local, arquivo vazio, troca de tipo, calendário, foco e retorno com memória conferidos. A situação integrada continua parcial pelos mapeamentos de país/tipo/metadados, catálogos, endereço/consulta postal, frente/verso, filiação e progresso. Próxima tela incremental: etapa 5. Ver checklist e pendências consolidadas.

## Cadastro incremental — etapa 5, 20/10

Atividade trabalhista (9:25789) em /cadastro/etapa-5: somente os quatro campos, orientação da renda familiar e Voltar/Continuar. Reutilizados shell, primitiva de campo e assets. Entrada monetária valida agrupamento e centavos sem Number/float, distingue vazio/zero e mantém rascunho em memória.

91 testes, lint e build aprovados. Desktop/celular sem overflow; erros independentes e foco, zero, catálogo ausente e retorno à etapa 4 conferidos. A homologação integrada segue pendente: catálogo, obrigatórios, vigências/moeda dos serviços existentes, falha parcial e progresso. Nenhum perfil real foi alterado. Etapas 6–7 ainda aguardam implementação; ver checklist e pendências consolidadas.

## Cadastro incremental — etapa 6, 20/10

Contatos de confiança (9:25883) em /cadastro/etapa-6, com somente nome/telefone repetidos, adição, ausência e Voltar/Continuar. Campos existentes e assets reutilizados; nenhum parentesco/e-mail/remoção acrescentado. Rascunhos e ausência reversível ficam somente em memória.

98 testes, lint e build aprovados. Conferidos vazio/incompleto, segundo contato, bloqueio de linhas vazias repetidas, ausência, foco, retorno à etapa 5 e celular sem overflow. Integração pendente: relationship obrigatório, declaração de ausência, telefone por país, múltiplas escritas/retomada e progresso. Nenhum contato real alterado. Próxima tela incremental: revisão/envio da etapa 7; ver checklist e pendências consolidadas.

## Cadastro incremental — etapa 7, 20/10

Revisão e envio (9:25964): cinco grupos do desenho alimentados pelos rascunhos em memória, documentos/telefones mascarados e Editar com retorno à revisão. Confirmação explícita, foco/erro e indicação de grupos pendentes; nenhuma senha, código ou arquivo integral no resumo. Estado enviado (9:26067) é referência visual identificada em /cadastro/enviado; o botão de envio não apresenta sucesso sem servidor.

106 testes, lint e build aprovados. Cinco caminhos de edição, preservação local, confirmação desmarcada após editar, zero/ausência e desktop conferidos. Conferência móvel ainda aberta: override de 390 px manteve viewport de 1280 px. Todas as sete telas estão implementadas; QA do cadastro segue parcial por integração/retomada, envio/recibo, revisão/reprovação e bloqueio de edição. Não equivale à homologação completa do Marco 3. Ver checklist e pendências consolidadas.

## Cadastro — integração dos endpoints existentes, 20/10

As etapas deixaram de ser apenas prévias: registro/confirmar e-mail, sessão com retorno à etapa, GET/PATCH de perfil, preferências para país único disponível, perfil profissional/financeiro, contatos existentes e operações documentais usam clientApi. Revisão carrega os dados suportados da API. Retirado o bloqueio geral por falta de catálogo; lacunas de campos/opções são tratadas separadamente. Inclusão de contatos e envio final permanecem limitados pelos contratos descritos no documento consolidado. O item 7 continua parcial até os retestes e resolução dessas incompatibilidades, sem atribuir trabalho de integração do front ao backend.

## Consolidação do cadastro — falhas parciais, 20/10

As seções incrementais acima registram a situação na data de cada implementação; não devem ser lidas como ausência atual de integração. O checklist do cadastro reúne os resultados posteriores, incluindo a conta nova e o 403 documental real. Corrigida no front a perda de rascunhos em falhas de leitura; revisão mantém os cinco grupos e ações do Figma e distingue indisponibilidade de ausência. 126 testes/lint/build aprovados; desktop e celular de 390 px conferidos localmente, sem gravação. CEP e retomada da etapa após novo login permanecem como trabalho/conferência do front, separados das pendências reais do backend.

Portal 8784ab8 publicado com sucesso (pipeline 39452089997). Revisão conferida em homologação na sessão da conta nova, somente leitura, com os dados suportados retomados. Os demais bloqueios continuam abertos no checklist.

## Cadastro — CEP Brasil, 20/10

Preenchimento automático da etapa 4 implementado reutilizando validator-cep do legado, com consulta ao sair do campo e sem ações adicionais. Número/Complemento preservados, erros mantêm edição manual, respostas atrasadas descartadas. 135 testes e lint/build aprovados; desktop/celular e CEP válido/inexistente/retry conferidos em 9010. Persistência de bairro, UF documental, 403 e envio final continuam separados no documento do backend; conferir publicação no checklist.

CEP publicado e conferido em homologação no portal aae0e31 (pipeline 39453639953 aprovada), com consulta real do CEP público e sem gravar endereço/documentos da conta.

## Cadastro — retomada após novo login, 20/10

Login passa a respeitar a última etapa no mesmo navegador/origem, por usuário autenticado, com somente rota em storage e dados suportados recarregados da API. Corrigida retenção indevida de rascunhos da sessão anterior no mesmo cliente. 145 testes, lint/build aprovados. Em 9010, saída e novo login de Cláudio retomaram etapa 5; Éric abriu Home sem herdar marcador. Sem novos campos/ações/estados de envio no Figma. Retomada entre dispositivos e autosave completo ainda exigem progresso/rascunho e envio explícitos no backend, separados no documento consolidado.

Retomada publicada no portal 4a4076b, pipeline 39455314973 aprovada. Cláudio retornou à etapa 4/br em homologação após logout e login comum, sem next; dados suportados recarregados. Reabrir /login autenticado também retomou a etapa. Sessão original do usuário preservada em outro navegador. Retomada entre dispositivos e rascunho não gravado continuam parciais.

## Mudança autorizada de ordem e campos — 20/10

Designer/QA e usuário autorizaram profissional/financeiro/moedas na etapa 4 e documentos/endereço na etapa 5. Campos confirmados pelo usuário: Ocupação, Empregador opcional e duas moedas, preservando rendas/bens e padrão visual. Escritas nos três serviços existentes antes dos documentos; links/revisão/retomada migrados. ProfileIncomplete anterior decorreu da falta do profissional, conforme diagnóstico do backend; catálogo de ocupações deixa de ser bloqueio por uso de occupation string. 152 testes, lint/build aprovados; evidência e reteste publicado no checklist principal.

### Nova ordem publicada e bloqueios retestados

46d5bc5/pipeline 39468374725 tentativa 2 aprovada. Na conta nova, wizard criou profissional e salvou moedas, avançou para documentos na etapa 5; consulta de tipos chegou à orientação de selecionar arquivos, sem repetir ProfileIncomplete. Home zerada carregou sem PreferencesRequired. Recarga confirmou os sete campos da etapa 4 pela API. Nenhum arquivo/CPF enviado, transação financeira ou aprovação realizada; upload e envio final continuam sem homologação. Os bloqueios anteriores de profissional/moedas nesta conta estão superados, sem alterar a regra do backend.


### Etapa 5 — upload fictício aprovado em homologação, 20/10

Portal 46d5bc5, conta nova do usuário: dois PNGs claramente fictícios selecionados no formulário e enviados; avanço real à etapa 6. Leitura administrativa confirmou dois RG/BR Uploaded, arquivos Private/Available e um ProvidedDocument/Active com duas evidências Uploaded. Não houve 403 nem aprovação documental. UF sem catálogo não bloqueou este RG; issuerState null aceito pela definição. Sem alteração de layout/código, contato, aceite ou envio final.

Recarga manteve endereço/número/complemento/filiação, mas não repôs campos do RG. Antes da recarga, Voltar preservou arquivos em memória com texto incorreto ainda não enviado. Retomada e apresentação ficam abertas no checklist principal; não adicionadas como bugs do backend sem atribuição confirmada. Cadastro completo e aprovação seguem parciais. Evidência: cadastro-etapa-5-envio-concluido.png.


### Retomada documental corrigida e publicada — 20/10

beb01b2, pipeline 39471786647 aprovada; 158 testes/lint/build. Perfil do usuário em homologação repôs número mascarado/emissor/expedição e indicação de evidências nos campos/slots existentes, inclusive em nova aba sem arquivos locais. Continuar avançou à etapa 6; conferência administrativa manteve dois anexos com os mesmos IDs e um RG com duas evidências. Máscara não é enviada como número real; sem alterações usa o registro confirmado, sem novo upload. Texto ainda não enviado corrigido. Ocorrências de frontend encerradas, sem novo bug da API; UF/catálogos, bairro, contatos e envio final permanecem nos respectivos limites. Evidência: cadastro-documentos-retomada-hml.png.


## Admin — documentos do cadastro visíveis para revisão, 20/10

Corrigido o mapeamento de categoria no frontend: GET /admin/customers/{id}/documents/overview retornava summary.pending = 2 e dois itens Pending/Review em PERSONAL_DOCUMENTS. A projeção só reconhecia PERSONAL e escondia as linhas, embora o contador estivesse correto. PERSONAL_DOCUMENTS agora usa a primeira seção já existente do Figma; alias antigo e demais seções preservados. Nenhum campo, ação, layout ou permissão novos.

- [x] Regressão cobre dois arquivos do mesmo tipo RG, sem requirementId, com IDs distintos e ações Review/Download retornadas pela API. Doze testes de projeção/revisão aprovados; lint, build e diff do lote aprovados.
- [x] Admin 4fd3faf publicado, pipeline 39474455430 aprovada em lint/build/upload/ativação. Local 8080 e perfil do usuário em admin.strategyanalytics.com.br conferidos.
- [x] Após recarga, aparecem dois RGs na seção Documentação pessoal; contador 2 Aguardando coerente; ambos com Visualizar, Baixar, Aprovar e Reprovar. Evidência: admin-documentos-jorge-aprovacao.png.
- [ ] Aprovação/reprovação efetiva e reflexos no portal/edição do perfil não executados nesta rodada. Os arquivos fictícios permanecem Pending para revisão do usuário; esta correção não comprova liberação cadastral posterior.

A ausência das linhas era defeito do frontend, encerrado após o reteste publicado. Nenhum novo bloqueio/bug de backend foi aberto por esse cenário.


## Aprovação integrada dos arquivos fictícios e edição do cliente — 20/10

Teste autorizado pelo usuário nas versões já publicadas: Admin 4fd3faf (correção documental) e portal beb01b2. Nenhuma alteração de layout, campo ou ação foi necessária nesta rodada.

- [x] No Admin, Aprovar foi acionado separadamente nos dois arquivos fictícios RG. Primeiro resultado: 1 Aprovado / 1 Aguardando; segundo: 2 Aprovados / 0 Aguardando / 0 Rejeitados. Ações de decisão deixaram de aparecer nos arquivos concluídos; nenhuma revisão duplicada.
- [x] Consulta administrativa independente confirmou summary.total = 2, approved = 2, pending = 0, rejected = 0. Progresso identifica RG Approved, progressState Complete e countsAsComplete true.
- [x] Área do Cliente, mesma conta: Dados Básicos, Localização e Atividade Trabalhista com Editar habilitado. Aviso de análise documental e badges Pendente removidos conforme as leituras atuais.
- [x] Edição integrada comprovada em Localização: complemento fictício alterado para Unidade de teste QA aprovação, salvo e confirmado após recarga completa. Em seguida, restaurado para Unidade de teste pelo mesmo formulário e confirmado em tela. Nenhum dado pessoal real ou valor financeiro alterado.
- [x] Aba Documentação mostra os dois nomes de arquivos fictícios com Aprovado, mantendo os controles existentes. A mudança do Admin foi recebida pela API do portal, sem alteração manual de nível, guard ou permissão.
- [!] Progresso ainda 0%: a API devolve currentLevel null, nextLevel LEVEL_1, approvedRequirements 0, requiredRequirements 1 e documentComplianceStatus Pending. A configuração traz RG isRequired false e CNH isRequired true, pendente/sem arquivo. Portanto os arquivos RG estão aprovados, mas não completam o requisito atualmente configurado. Alinhar regra/configuração de nível às alternativas do fluxo aprovado do Figma; não criar campo CNH obrigatório nem simular 100% no front.
- [ ] Edição de documentos na seção Dados Pessoais continua direcionada à aba Documentação, conforme implementação existente. Contatos sem vínculo/cadastro continuam bloqueados pela pendência já conhecida. Este teste não homologa reenvio/reprovação, contatos, envio cadastral final ou progressão de nível.

**Resultado:** aprovação dos dois arquivos, atualização visual do portal e gravação de edição de localização aprovadas. Nenhum defeito novo do frontend reproduzido; sem mudança de runtime ou deploy novo. Permanece alinhamento da configuração documental no backend. Evidências: admin-dois-documentos-aprovados.png e cliente-documentos-aprovados.png; sem e-mail, token ou identificador pessoal integral neste registro.


## Reprovação e reenvio de arquivo fictício — 20/10

Teste integrado autorizado na mesma conta. Os dois arquivos já aprovados foram preservados; um PNG claramente fictício adicional foi criado pelo endpoint administrativo de upload apenas para preparar o cenário. Reprovação e substituição foram feitas pelas telas existentes.

- [x] No Admin, reprovar o único arquivo novo Pending com Foto ilegível e mensagem Teste de homologação: reenvie somente o arquivo fictício, com o texto legível. Resultado: 2 Aprovados / 0 Aguardando / 1 Rejeitado; motivo e orientação visíveis no Admin.
- [x] Defeito do frontend reproduzido: portal mostrava Rejeitado/Substituir, mas não mostrava o motivo porque lia apenas rejectionReason da lista; a revisão retornada no overview contém latestReview.notes.
- [x] Correção portal bbbebd8 publicada; pipeline 39476133451 aprovada em lint, 162 testes, build, upload e ativação. Motivo associado pelo ID do arquivo e pelo ID/status da revisão, nunca somente por tipo RG; não aparece em outro arquivo aprovado ou reenviado. Datas originais preenchidas nos campos existentes ao abrir Substituir. Uploaded passa a exibir Enviado. Nenhum campo, ação ou composição novos.
- [x] Na versão publicada, a Área do Cliente exibiu Foto ilegível e a orientação no arquivo correto. Formulário de substituição manteve emissão 01/01/2025 e validade vazia, sem inventar datas.
- [x] Reenvio real pelo seletor/Enviar da Área do Cliente: documento-ficticio-qa-reenvio.png, também fictício. A tela fechou o formulário e mostrou o arquivo novo como Enviado, sem aplicar nele o motivo antigo.
- [x] Admin atualizado mostrou 2 Aprovados / 1 Aguardando / 1 Rejeitado, com uma nova ação Aprovar/Reprovar. Consulta administrativa independente confirmou o novo documento Uploaded/Pending, arquivo diferente, mesmo tipo RG e emissão preservada. Os dois registros aprovados anteriores não foram alterados.
- [!] Semântica do replace a alinhar com backend: POST /client/profile/documents/{id}/replace criou outro documentId e manteve o original Rejected, não arquivado e presente no overview/lista. Assim total passou de 3 para 4; o motivo permanece no registro antigo. A resposta não expõe vínculo de substituição. Não ocultar registros por tipo ou fingir que a pendência antiga foi encerrada.
- [!] Metadados: original tinha issuer/documentNumber fictícios; novo registro veio com metadata = {}. O contrato multipart do replace aceita arquivo/datas, sem campo de metadata. Confirmar preservação dos metadados e vínculo/versionamento no servidor; não enviar campos extras não documentados pelo front.

**Resultado:** reprovação, motivo no cliente e reenvio para nova revisão aprovados nos limites observados. Fica parcial o encerramento/substituição lógica do registro rejeitado e a preservação de metadados; esses pontos estão no documento do backend. O novo arquivo foi deixado Pending para revisão; não foi aprovado automaticamente. CNH obrigatória/progresso 0% e envio cadastral final seguem separados. Evidências: cliente-motivo-reprovacao.png e cliente-reprovacao-e-reenvio-detalhe.png.


### Reprovação — conferência final responsiva e publicação

fb15804 complementa bbbebd8: na conferência a 390 px, motivo longo sobrepunha as ações existentes. Em telas pequenas, as mesmas ações passam abaixo do texto; sem novos controles e sem mudar o desktop. Reteste real publicado confirmou motivo/orientação legíveis e sem sobreposição; documentElement.scrollWidth 378 para viewport 390. Override removido ao terminar. Evidência: cliente-reprovacao-mobile.png.

Pipeline 39476881643 tentativa 2 concluída com lint, 162 testes, build, upload e ativação aprovados. A tentativa 1 passou nos checks, mas falhou no upload por timeout SSH/exit 255; repetição publicou sem alterar a aplicação. As duas ocorrências corrigidas do frontend estão encerradas (motivo ausente e sobreposição mobile). Os pontos de vínculo/versionamento e metadata do replace permanecem no documento do backend. Nenhuma nova aprovação do arquivo reenviado foi realizada.


## CNH aprovada pelo usuário — progresso e edição retestados, 20/10

O usuário realizou a aprovação no Admin. Reteste na mesma conta e nas versões já publicadas, sem alterar o Figma, campos, ações, guards ou permissões.

- [x] GET administrativo de progresso confirmou progressPercentage 100, approvedRequirements 1, requiredRequirements 1, currentLevel LEVEL_1, nextLevel null, documentClassification A e documentComplianceStatus OK.
- [x] Requisito CNH: Approved, Complete, countsAsComplete true e isRequired true. O RG mais recente continua Uploaded/Pending/opcional. Overview tem 5 registros: 3 aprovados, 1 pendente e 1 rejeitado. Assim 100% é conclusão dos requisitos configurados, não aprovação de todos os arquivos nem envio final do cadastro.
- [x] Área do Cliente mostrou 100% concluído e CNH aprovada após recarga/abertura de Documentação; leitura visual e resposta do servidor coerentes.
- [x] Dados Básicos, Localização e Atividade Trabalhista com Editar habilitado. Teste de escrita em Localização: complemento fictício Unidade de teste → Unidade de teste QA CNH; Salvar, recarga completa e persistência confirmada. Valor original Unidade de teste restaurado pelo formulário e confirmado após nova recarga; edição permaneceu habilitada.
- [x] Nenhuma falha nova do front reproduzida; nenhuma alteração de runtime, layout ou publicação nova necessária. Somente documentação atualizada. Evidência: cliente-cnh-aprovada-progresso-100.png.

**Encerrado:** reteste da porcentagem após aprovação da CNH e gravação/persistência da edição de Localização. **Backend ainda aberto:** alinhar CNH obrigatória às alternativas do Figma (não exigir documento adicional ao RG/passaporte previsto), vínculo/metadados no replace e as demais lacunas já registradas. Não cobrar 0% como falha atual desta conta nem confundir nível documental completo com todas as sete etapas concluídas.


## Revisão atual do checklist e contatos do perfil — 20/10

Atualizada a tabela principal com as validações já realizadas; registros históricos não são novas pendências. Selecionada e corrigida uma falha independente do backend no item 8: primaryEmail/mobilePhone são objetos no contrato do resumo, mas o front os tratava como strings. O e-mail existente aparecia Não informado; a edição básica carregava objeto em vez de valor, podendo gerar null na adaptação da escrita.

Portal 639bd6f publicado; pipeline 39480681134 aprovada (lint, 165 testes, build, upload e ativação). Exibição usa valueMasked; edição carrega os contatos principais do perfil completo. Objeto inválido/contato principal ambíguo bloqueia gravação, sem limpar dados. Campos, botões, composição e CSS preservados.

Reteste na conta do usuário: e-mail mascarado apareceu; Editar preencheu o contato real sem máscara/objeto. Naturalidade fictícia Cidade Teste QA alterada para Cidade Teste QA Contatos, salva e confirmada após recarga; restaurada ao original e confirmada após nova recarga. Comparação independente na API, por hash de IDs/tipos/valores/indicadores dos contatos, confirmou todos preservados; nenhum valor de contato integral foi registrado. Desktop/celular 390 px conferidos, sem overflow horizontal; viewport restaurado. Evidência: cliente-perfil-contatos-api-corrigidos.png.

Próximos itens ainda abertos dependem dos contratos/configuração descritos em PENDENCIAS-BACKEND-QA.md: catálogos/UF/bairro/país de nascimento, contatos sem vínculo/ausência, aceite e envio final, substituição documental, alternativas CNH/RG, módulos ainda sem API, autorização/sessão HttpOnly e investigação do incidente original. Não criar campos/ações para contornar essas lacunas. Reteste de avatar válido depende de URL real disponível; não adicionar upload fora do Figma. Aprovação final do QA permanece aberta.


## QA do perfil — valores financeiros opcionais e gravação por seção, 20/10

Próximo ajuste independente do backend no QA 8: a edição de Atividade Trabalhista exigia preencher todos os valores financeiros, embora o contrato aceite null, e regravava o profissional mesmo quando só uma renda era alterada. O perfil agora aceita ausência explícita sem transformá-la em zero, mantém zero e decimais e envia apenas o perfil que efetivamente mudou. Valores inválidos/negativos são validados antes de iniciar as escritas. Comparação decimal não converte strings para float no payload; moeda/vigências e metadados profissionais são preservados.

- [x] Portal b42b66d publicado; pipeline 39481860662 aprovada em lint, 170 testes, build, upload e ativação. Testes incluem null/zero/decimais, formatação equivalente sem escrita, limpeza intencional, alteração profissional isolada e validação antes da gravação.
- [x] Na conta do usuário em homologação, valor negativo rejeitado com erro na seção e rascunho preservado. Corrigido para valor fictício válido, renda familiar apagada e bens zero mantidos; salvamento concluiu e recarga confirmou decimal, ausência e zero distintos.
- [x] Consulta administrativa independente confirmou householdMonthlyIncome null, declaredNetWorth 0 e valor decimal salvo; moeda/vigências preservadas e perfil profissional integralmente idêntico à leitura anterior.
- [x] Valores fictícios originais restaurados pela mesma edição e recarregados. Nova leitura administrativa confirmou rendas/bens/moeda/vigências iguais ao início e profissional intacto. Nenhuma transação financeira, contrato, documento ou permissão foi alterado.
- [x] Desktop e edição a 390 px conferidos; conteúdo 378 px para viewport 390, sem overflow. Descartar fechou a edição sem nova gravação; viewport restaurado. Campos, botões, seletor e composição existentes do Figma preservados; não foi criado campo técnico ou ação adicional.

Defeito do frontend encerrado, sem novo endpoint ou ajuste do servidor. Ausência real de dado continua Não informado; este teste não libera catálogos, escrita de contatos sem vínculo, termos/envio final nem o replace documental. Evidência: cliente-perfil-financeiro-validado.png (valores já restaurados).


## Perfil — retomada após falha e conferência da gravação, 20/10

O frontend agora mantém uma base independente dos dados confirmados durante a edição trabalhista. A consulta intermediária foi retirada: uma falha de leitura não apaga a base de uma nova tentativa. Se uma das duas escritas já foi confirmada, a tentativa seguinte envia somente o que falta. Troca de sessão interrompe a sequência. Rascunho e controles existentes preservados, sem novos campos ou ações.

Reteste integrado encontrou uma pendência distinta do servidor: novas rendas fictícias aparecem no histórico financeiro, enquanto GET financeiro atual continua retornando registro anterior. A interface passou a avisar quando os valores consultados após salvar diferem do rascunho enviado, utilizando a área de erro existente. Não substituir a resposta real por valor otimista nem afirmar persistência confirmada apenas pelo sucesso do PUT.

A rodada anterior de valores opcionais permanece como evidência de escrita aceita e histórico; o reteste atual prevalece sobre a conclusão anterior de leitura atual/persistência integral. Não considerar QA 8 financeiro encerrado até corrigir/explicar a seleção do registro vigente no backend. Contatos, aprovação documental e demais verificações independentes continuam válidos.

Publicação final a41ae98 confirmada na pipeline 39483544799 (173 testes, lint, build e deploy aprovados). Aviso retestado com escrita real e consulta divergente; revisão em 390 px sem overflow. Valores originais restaurados pelo endpoint administrativo existente, conferindo histórico mais recente e consulta atual; profissional preservado integralmente. Evidência visual cliente-perfil-aviso-consulta.png. A falha parcial em si foi exercitada em testes automatizados, não provocada em homologação.


## Perfil — data de nascimento, erro no resumo e descarte, 20/10

Correções adicionais do QA 8 independentes do backend:
- Dados Básicos reutiliza validBirthDate do cadastro antes de gerar o PATCH. Recusa data futura/inexistente, preservando rascunho e demais dados. Não inventa idade mínima nem nova obrigatoriedade para campo nullable.
- Atividade Trabalhista no resumo de Ajustes não apresenta Não informado ou valor zero enquanto a consulta profissional/financeira está com erro. Mantém erro e Tentar novamente existentes; dados pessoais/localização continuam independentes. Ausência legítima e zero voltam a ser apresentados após consulta bem-sucedida.
- Descartar encerra a edição e limpa a mensagem de validação anterior, sem gravar os dados do rascunho. Mesmos botões, rótulos e disposição; sem novos campos/ações.

Testes exercitam a geração real do payload e os templates Vue do resumo e do estado de recurso: data futura/inexistente, ano bissexto, dia local atual, campo vazio nullable, erros em cada consulta, loading, presença do controle de retry e apresentação normal. Falhas de consulta foram simuladas apenas nos testes automatizados; não houve indução de erro no backend de homologação. A divergência financeira vigente continua aberta no documento do backend.


Publicação final 916fc56 / pipeline 39486635711 aprovada (lint, 177 testes, build e deploy). Na conta do usuário, data futura recusada com os demais campos preservados; descarte limpou a mensagem e reabertura retomou dados originais sem alteração cadastral. Conferência a 390 px sem overflow e resumo de Ajustes com dados reais concluídos. Evidências cliente-perfil-validacao-nascimento.png e cliente-resumo-perfil-api-validado.png. O cenário de falha de consulta foi validado automaticamente com os templates reais, sem alterar ou derrubar o servidor.


## QA 8 — consulta de sessões do perfil, 20/10

Gerenciamento de Status de Login em Ajustes agora mostra Nenhuma sessão disponível somente após consulta bem-sucedida e vazia. Loading não afirma ausência; falha mantém mensagem e Tentar novamente existentes. Corrigida também a concorrência: erro de uma requisição anterior não sobrescreve o resultado de uma consulta mais recente. Nenhuma coluna, campo ou ação foi acrescentada.

Testes executam o script real de LoginSetting com respostas controladas e renderizam o template Vue: sucesso recente/erro antigo, erro recente/sucesso antigo, erro após troca de conta/desmontagem, recuperação por retry e preservação da máscara de IP. A tabela continua usando sessões reais da API; nenhum dispositivo/data de exemplo foi inserido no aplicativo. Cenários de falha/concorrência foram exercitados automaticamente, sem induzir falhas do backend ou revogar sessões da conta de homologação.


Versão final 587e4ba / pipeline 39487751656 publicada com lint, 183 testes, build e deploy aprovados. Reteste na conta do usuário mostrou duas sessões reais, IPs mascarados e ausência de erro/vazio falso. Contagem/paginação normal preservada após sucesso; durante erro/loading não indica zero. Mobile 390 px com documento 378 px e rolagem interna da tabela, sem ampliar a página. Sem logout, revogação ou escrita de perfil/preferências. Evidência cliente-perfil-sessoes-validadas.png. Ajustes deixado aberto e viewport restaurado.


## QA 8 — catálogo bancário completo no perfil, 20/10

Reteste HTTP confirmou 513 bancos em 3 páginas de 200/200/113. O frontend buscava somente a primeira página e descartava a paginação ao extrair data, restringindo o seletor e a identificação dos bancos no resumo. Corrigido em 97f5e72: resumo e Perfil Completo carregam todas as páginas pelo endpoint existente antes de publicar a lista. Layout, campos, ações e filtros existentes preservados.

Carregamento valida consistência das páginas, quantidade de itens e IDs repetidos; falha intermediária não publica catálogo parcial. Sessão é conferida antes e após cada leitura para impedir continuação do lote após troca de conta. Testes incluem as 513 entradas, resultado vazio legítimo, erro na segunda página, resposta incompleta/inconsistente e troca de sessão. Nenhum cadastro de banco ou conta foi criado para contornar a falha.

Revisão visual do catálogo revelou um segundo defeito de frontend: no celular, o grid interno do LabelForm mantinha a largura mínima do nome longo do banco e alargava o formulário. 027257b limita a coluna ao espaço disponível, reutilizando as reticências existentes do QSelect. Nome completo permanece na lista, com os mesmos campos e ações; sem esconder o formulário inteiro por overflow.


Publicação final 027257b / pipeline 39489262330 aprovada (lint, 189 testes, build e deploy). Banco da terceira página confirmado no seletor real; formulário cancelado e resumo bancário vazio da conta conferido, sem gravação. Mobile: card com clientWidth/scrollWidth 317/317 px; campo respeita a largura, com reticências existentes. DocumentWidth 378 px para viewport 390 px. Evidência cliente-perfil-banco-mobile-sem-overflow.png. Pendências anteriores do backend permanecem abertas, sem novo contrato solicitado.


## Consolidação do perfil — leitura atual, 20/10

Revisão do QA 8/9 não identificou outra pendência de implementação do perfil independente das dependências já documentadas. Checklist manual agora abre com o estado consolidado, separando funcionalidades retestadas, bloqueios de contrato/configuração, foto válida para reteste e revalidação independente pelo QA. Marcas históricas de upload/aprovação/reprovação/liberação não devem ser tratadas como pendências atuais.

Versão publicada 027257b e pipeline 39489262330 novamente conferidas; nenhuma mudança de runtime e nenhum novo deploy nesta rodada. Navegação real da conta do usuário confirmou dados próprios, duas sessões reais, 100% documental e Editar habilitado após carregar, sem escrita. O Swagger atual não resolve as lacunas de context dos termos, projeção pública completa ou patrimônio próprio. A divergência financeira fica aberta até resposta/correção e reteste do backend; não foi repetida escrita de renda nesta revisão.

Próximo passo do perfil é a revalidação pelo QA dos cenários liberados e o retorno do backend para os cenários bloqueados, preservando o Figma. Não representa aprovação integral do cadastro, segurança ou Marco 3.


## Admin — QA 12 e 15: precisão e alteração efetiva do financeiro, 20/10

Revisão encontrou conversão para Number no input de ProfileFields e no plano da seção profissional/financeira. Valores decimais fornecidos como string podiam perder precisão; comparação por tipo/formatação também podia tratar valores equivalentes como alteração. Corrigido em 0fe6f92/96ebd34: texto decimal preservado, payload financeiro em string decimal admitida pelo contrato, normalização apenas para comparar e enviar, null e zero distintos. Mudança só de formatação não destaca alteração nem habilita Salvar.

Mantidos os cinco campos do C24, ações Salvar/Descartar, edição de uma seção por vez, mensagens e metadados de moeda/vigência. Regra existente de renda familiar versus individual preservada e comparada sem float. Validação de inválidos/negativos ocorre antes da escrita. Nenhum valor grande foi enviado ao ambiente para testar precisão: teste automatizado usa o template Vue real e o controlador/plano reais com escrita simulada.

Suite completa: 78 testes com node --experimental-vm-modules --test tests/*.test.mjs. A execução inicial sem a flag exigida pelos testes de rota falhou em vm.SyntheticModule; repetição com a configuração correta passou integralmente. A pipeline administrativa atual valida lint e build; os 78 testes foram executados localmente, sem confundir npm test legado com a suíte.


Publicação final 96ebd34 / pipeline 39497171684 confirmada em lint, build, upload e ativação; 78 testes completos aprovados localmente. Na ficha real de homologação, formatação equivalente manteve Salvar desabilitado; mudança de valor habilitou e destacou o campo; negativo bloqueado e descarte pelo diálogo existente. Cinco campos mantidos, mobile 390 px sem overflow. Ficha encerrada sem rascunhos e recarregada.

Comparação independente por hash confirmou profissional e histórico financeiro idênticos ao início: nenhuma nova escrita de registro ou movimentação para este teste. A aprovação é da correção do front e do fluxo de validação/descarte; não encerra a consulta financeira vigente nem os bloqueios dos demais itens do Admin. Checklist manual recebeu estado atual do Admin separado do histórico. Evidência admin-financeiro-formatacao-sem-gravacao.png.


## Admin — QA 17: concorrência e erro na listagem de clientes, 20/10

Consulta antiga de cartões podia sobrescrever busca/filtro ou visualização em tabela mais recente; erro de consulta deixava os dados anteriores sob a nova busca. Corrigido em 00d601f, reutilizando useFinanceResource/ResourceState existentes. Somente a última consulta publica registros e paginação; início de nova leitura limpa linhas antigas, saída da tela invalida respostas e callbacks pendentes. Durante indisponibilidade, Exportar/Comparar existentes ficam bloqueados, sem exportar resultado antigo. Falha mostra o erro/retentativa padrão da plataforma, não Nenhum cliente encontrado.

Filtros, ordenação, seleção, cartões/tabela, edição lateral e footer existentes preservados; nenhum campo, filtro ou operação de negócio acrescentado. Resultado vazio bem-sucedido continua distinto de erro. Testes executam o script real do componente com requisições controladas: pesquisas concorrentes, troca de visualização, falha antiga, erro/retry, saída da página, vazio legítimo e consulta iniciada entre resolução/publicação. Total local 85 testes aprovados com experimental-vm-modules. Isso não encerra unicidade de e-mail no servidor nem o incidente de identidade de login do QA 18.


Publicação 00d601f confirmada na pipeline 39498456402 (lint/build/upload/ativação). Reteste real: busca Jorge + status Prospect, mesma ficha em cartões e tabela; busca sem resultados mostrou vazio/0 confirmado; limpar retornou 12 registros e página 2 mostrou os dois restantes. Mobile 390 px com documento 375 px, sem overflow da página. Exportação não acionada, nenhum cadastro alterado; lista e viewport restaurados. Evidência admin-lista-clientes-vazia-validada.png. Erros/retentativa/concorrência validados automaticamente com a suíte de 85 testes, sem induzir falhas na API.

### Rodada 20/10 — catálogo bancário do Admin

Correção do front, sem campos/ações adicionais: seletor e nomes da seção bancária usam todas as páginas do catálogo existente, em vez de apenas 200 registros. Banco Órama encontrado por busca sem acento em 8080. Falhas intermediárias e recuperação testadas; suíte completa com 91 cenários aprovada, lint/build aprovados. Deploy ddfb04d/pipeline 39499746938 concluído; busca e seleção do banco Órama retestadas em homologação, formulário cancelado sem gravação e mobile 390 px sem overflow. Evidência no checklist manual. Nenhuma conta criada.

### Rodada 20/10 — validação do patrimônio no Admin

Na revisão funcional dos controles existentes do perfil, corrigida a aceitação de frações em anos, contagens e prazo. O contrato HTTP já define esses campos como int32: não exige alteração do backend nem novos controles. Validação no input e antes do envio; campos monetários/áreas seguem decimais. 93 testes locais aprovados; rejeição e correção do ano retestadas em 8080, sem criar patrimônio. Deploy 9d10d93/pipeline 39500642230 concluído: rejeição dos dois anos fracionados, correção, opcional vazio, valor decimal e mobile 390 px retestados em homologação. Formulário descartado sem gravação; evidência no checklist manual. Os bloqueios contratuais da edição por seção permanecem abertos.

### Rodada 20/10 — validação do nascimento no Admin

Revisão de QA 11/15: corrigida a validação de nascimento impossível ou futuro na edição por seção. Usa os erros já existentes e mantém a composição C24. 95 testes locais, lint e build aprovados; data futura rejeitada em 8080, com descarte/reabertura preservando o dado original. Sem escrita de dados nem campos/ações adicionais. Publicação 60423d3/pipeline 39501477543 aprovada; bloqueio, descarte, reabertura e mobile 390 px retestados em homologação. Conteúdo cadastral permaneceu integralmente igual por hash antes/depois; evidência no checklist manual.

### Rodada 20/10 — QA 16, listagem documental

Conferência pelos acessos existentes revelou truncamento local de 30 tipos para cinco na Configuração documental. Ajustadas as duas tabelas com paginação oculta para exibir a página recebida inteira, sem novos controles. Em 8080, pesquisa, vazio, limpeza e editor do último tipo validados sem escrita. 95 testes existentes, lint e build aprovados. Publicação 2eea460/pipeline 39502645633 concluída: 30 tipos gerais, sete pessoais, busca, vazio, limpeza dos filtros, editor do último tipo e mobile 390 px retestados em homologação, sem gravação. Evidências no checklist manual. Reprovação sem motivo também bloqueada em homologação, sem enviar revisão. As dependências dos módulos sem API continuam abertas.

### Rodada 20/10 — busca no catálogo bancário

QA 16/17: reproduzido falso vazio ao procurar banco de outra página (325/Órama). Busca agora reutiliza a leitura completa da API e pagina os resultados filtrados, sem controles adicionais. País e estado de erro/retentativa preservados; 99 testes, lint/build e cenários locais aprovados. Deploy funcional 3ea3c43 e contraste 62babcf confirmados (pipelines 39503676010/39503972684). Busca/código/nome sem acento, vazio, limpar, paginação, ativos e mobile 390 px retestados em homologação. Evidências no checklist manual. Nenhum banco criado.

### Revisão de encerramento das correções independentes — Admin

Revisados os itens originais 10–19 e o Swagger atual, sem novas rotas nem mudança de UpdateCustomerRequest (kind/birthDate). Não foi identificado outro item original com implementação independente do backend nesta rodada. O checklist manual contém a matriz por item com o front já disponível e os bloqueios reais. Isso não considera concluídos os módulos ainda sem API: sua integração no front continua futura e depende do contrato. Segurança/identidade permanecem abertas até evidência do servidor e reteste do QA.

Perfil em homologação conferido sem gravação: seções carregadas, Salvar desabilitado sem mudanças, exclusividade da edição, campos sem escrita somente leitura e compliance sem alerta bloqueado. 99 testes, lint e build aprovados; runtime publicado confirmado. Rodada somente documental, sem alteração visual, campos ou ações adicionais.
