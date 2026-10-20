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
| 1 | Redirecionamento corrigido; login com Éric e Cláudio abre a Home. | Criação/código confirmados pelo usuário e sessão na etapa 3 observada em conta nova. Cadastro de sete etapas ainda não concluído por bloqueios documentais/envio; não aprovar ponta a ponta. |
| 2 | Preferências integradas; Cláudio desbloqueado e conta real sem movimentos validada com zeros após concluir preferências. Erro e resposta incompleta não viram zero. | Comparação entre períodos continua sem fonte na API. Evidências atuais no portal: docs/QA-2026-10-19-HOME.md e docs/QA-2026-10-19-PREFERENCIAS.md. |
| 3 | Estado sem depósito e regras de períodos implementados. Datas de execução e série real são preservadas; gráfico indisponível não é tratado como conta vazia. | Motor/série seguem indisponíveis na API; Fazer primeiro depósito reutiliza o aviso existente porque não há iniciação de depósito do cliente confirmada. |
| 4 | Estado sem contratos implementado e validado com conta real vazia. Solicitar contrato abre a página de Contratos existente, conforme orientação do usuário. | Não envia pedido ao backend; nenhum fluxo adicional foi criado. |
| 5 | Resumo demonstrativo de empréstimos removido da Home. | Sem fonte de dívida no contrato atual para homologar presença/ausência de empréstimos. Não simular ausência de dívida após erro. |
| 6 | Estado vazio do Figma aplicado na página e na Home; mocks, filtros e contadores fictícios retirados das listagens. | Integração de publicações depende de contrato HTTP; o Swagger consultado não contém endpoint de conteúdo. |
| 7 | Login e sete telas do Figma implementados. Endpoints existentes de conta/e-mail, perfil, financeiro, contatos e documentos integrados; dados suportados retomados pela API. Falhas parciais na revisão corrigidas e celular conferido. | Parcial: 403 documental de conta nova, catálogos/campos não suportados, contatos sem relationship, aceite e envio final. CEP e retomada da etapa após novo login ainda precisam de trabalho/conferência do front. Ver CHECKLIST-CADASTRO-SETE-ETAPAS.md; não solicitar endpoints existentes como ausentes. |
| 8 | Exemplos retirados do resumo, perfil e ajustes; dados próprios da API, sessões reais e bloqueio por identificação pendente integrados. | Revisão cadastral, campos sem catálogo/escrita, patrimônio próprio, termos e compartilhamento aguardam alinhamento. Cliente com identificação aprovada ainda precisa de reteste integrado. Ver pendências consolidadas e docs/QA-2026-10-19-PERFIL.md no portal. |
| 9 | Três textos corrigidos; avatar usa a URL da API e ícone neutro quando ausente ou com falha, sem imagem quebrada ou foto demonstrativa. | Carregamento de uma foto válida depende de URL/arquivo real disponível para reteste. Não exigir cadastro ou upload de foto fora do Figma. |
| 10 | C27–C28 implementadas e integradas: Aprovar/Reprovar no documento pendente, motivo obrigatório, mensagem, atualização de contadores e download. Testados com arquivos descartáveis. | C25–C26 e desbloqueio cadastral ainda dependem de estado explícito do cadastro e efeito da revisão no servidor. Motivo/mensagem usam notes; falta catálogo de motivos. Ver QA-2026-10-19-APROVACAO-DOCUMENTOS.md. |
| 11 | Campos de identificação preservados durante edição, no mesmo bloco. | Edição de documentos e dados pessoais sem contrato de escrita continua bloqueada; ver QA-2026-10-19-EDICAO-POR-SECAO.md. |
| 12 | Composição profissional/financeira mantida, com cinco campos do Figma C24. | Salvamento integrado e restauração dos dados fictícios conferidos em 8080. |
| 13 | Preferências migradas para edição por seção, sem salvamento isolado. | Preservar país e demais metadados da API sem criar campos adicionais. |
| 14 | Corrigido e retestado em 19/10 no Admin local e publicado: Jane com quatro saldos zero, composição e extrato vazios conforme C29; depósito e saldo do Cláudio conferidos. | Deploy 8c64763 confirmado. Evidências e limites em QA-2026-10-19-CARTEIRA-VAZIA.md. |
| 15 | Edição global substituída por uma seção por vez: rascunho, salvar, descartar, bloqueio e proteção de saída implementados conforme C24. | Limites de escrita de identificação/segurança/compliance documentados; aprovação integral depende desses contratos e reteste do QA. |
| 16 | Menu e seleção A02 implementados; telas integradas acessíveis. Entrada legada /dashboard abre Clientes e /landing-page mostra A02 com exigência de administrador, eliminando as duas entradas vazias. | Parcial: Lógicas, Leads, Assessores e editor de LP ainda são protótipos; Crédito e Comunicados sem integração. Nenhum dashboard novo foi criado. Contratos HTTP dos módulos permanecem em PENDENCIAS-BACKEND-QA.md. |
| 17 | Data sem horário preservada; histórico atual traduzido para português; países dos bancos resolvidos pelo catálogo real, sem UUID na tela. Paginação do catálogo ajustada para exibir a página recebida inteira. | Unicidade de e-mail continua no servidor. Observações e auditoria são preservadas; títulos novos sem tradução mantêm o texto fornecido. |
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
