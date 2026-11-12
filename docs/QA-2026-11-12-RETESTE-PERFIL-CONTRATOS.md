# Reteste de perfil e contratos — 12/11/2026

Esta matriz prevalece sobre as pendências históricas de perfil/contratos de outubro e 04/11 nos cenários abaixo. Não homologa todo o Marco 3. Foram usadas as URLs publicadas do Admin e da Área do Cliente, a API de homologação e contas fictícias Éric, Cláudio e Client. Jorge foi consultado somente pelo Admin; sua senha não foi presumida ou alterada.

## Front e validações

- [x] Perfis de Éric, Cláudio e Client carregaram dados reais, com seções independentes e sem exceções de JavaScript. Ausências aparecem como não informadas.
- [x] Renda de Client: editar R$ 3.333,33 para R$ 3.350,58, salvar, recarregar e consultar novamente. Novo valor persistiu. Valor original restaurado pelo mesmo formulário, confirmado após nova recarga. Ambos os PUTs sem effectiveTo; GET atual com effectiveTo=null. A antiga falha de renda não se reproduziu.
- [x] Perfil profissional/financeiro, preferências, declaração de contatos, catálogo e onboarding retornaram 200 para as três contas. Não reabrir como endpoints ausentes.
- [x] Corrigir o cabeçalho de Documentação para usar summary.levelProgress. Antes, a tela inferia nível pelo progresso legado de aprovação e contava arquivos localmente. Agora consome nível/contadores oficiais; a indisponibilidade desse resumo não bloqueia consulta e upload documental.
- [x] Preservar o cabeçalho, três cartões, barra, grupos, campos e ações existentes. Nenhum cartão de nível 0, campo ou ação novo. Referência: Figma portal BaDXlWpxbIoY4azOaQnXgv, nós 1:67249 e 1:67317, com screenshot; perfil resumido 1:68090.
- [x] Listas reais: Éric com dois contratos ativos USD; Cláudio com um contrato encerrado BRL; Client sem contratos. Sem somar moedas ou substituir participação por capital global.
- [x] Consultar lista/detalhe/documentos e carteira no Admin e API. baseAmount existe: Éric US$ 200.000 e US$ 50.000; Cláudio R$ 261.500. O Admin já usa o valor base individual. Não pedir esse campo novamente.
- [x] Corrigir o evento ContractCreated e o rótulo de paginação do histórico do contrato para português, sem modificar a composição.
- [x] Enviar PNG fictício pelo upload IRPF do perfil do Éric (201), retomar o arquivo, vincular no contrato pelo Admin e liberar para o cliente. Fixture sem dados pessoais, identificada pelo nome qa1112-ficticio-sem-dados-pessoais.png.
- [x] Conferir API administrativa e do cliente após o vínculo: ambas retornam o mesmo documentId e visibilidade liberada. As listas vazias anteriores eram ausência de vínculo; não ausência de endpoint.

- [x] Abrir anexo no portal gerou URL temporária e nova aba HTTPS. Ocultar no Admin retirou o arquivo do cliente após recarga; o vínculo fictício foi removido e a lista retornou vazia. O arquivo fica no perfil identificado para reteste, sem vínculo a contrato.
- [x] Cláudio: navegação lista → contrato encerrado, participação R$ 261.500 e posição/resultado indisponíveis coerentes com API. No Admin, clicar em Carteira Strategy exibe valor inicial/base R$ 261.500, atual/bloqueado indisponíveis e participação 100%.
- [x] Estados controlados no localhost:9010: níveis oficiais 0/1/2/3 e falha 503 isolada do resumo. Upload permaneceu disponível; mobile 390 px sem overflow da página. Não são testes positivos de concessão desses níveis pelo servidor.

## Bloqueios reais da API

| Tema | Evidência vigente | O que falta |
| --- | --- | --- |
| Contrato encerrado no investido | Cláudio: CTR-403B56CC / Beta Growth Spec retorna CLOSED/Encerrado e R$ 261.500 de participação. Home contractedCapital e carteira Admin invested continuam em R$ 261.500, contractCount=1. | Corrigir ou definir explicitamente elegibilidade do encerrado no consolidado. O front não subtrai o valor por conta própria. Total atual BRL 286.810 inclui 310 de patrimônio, 25.000 investíveis e 261.500 investidos. |
| Valores do contrato | currentPosition/result/entryValue retornam null com IndexedVariationEngine/NotAvailable; não há valor atual/bloqueado individual por participante no DTO. baseAmount já existe. | Fornecer valores individuais e cálculo disponível quando o motor estiver pronto. Não preencher com allocation/capital global/zero. |
| Versão documental vigente | Cláudio ainda recebe IRPF antigo Rejected e novo Approved em itens separados no overview; o item não informa versão vigente/obsolescência. | Identificar a versão atual e desconsiderar anteriores nas regras/contadores, preservando auditoria. Não confundir com bloqueio de celular ou com falha de upload. |
| Contagem oficial de documentos | Éric tem extrato enviado e recebeu novo IRPF Uploaded em 12/11, mas summary.levelProgress.countedDocuments continua 0. Cláudio tem IRPF Approved e também recebe 0. | Esclarecer quais documentos são elegíveis e alinhar a contagem à regra aprovada de cinco documentos enviados. Não recalcular ou conceder nível no front. O nível 0 dessas contas é coerente com phoneVerified=false. |
| Tipos do Figma | Catálogo consultado não contém holerite, declaração de autônomo, RPA, contrato de serviços/comprovantes ou Decore; estado civil só contém Certidão de Casamento. | Cadastrar os tipos/alternativas aprovados e seus contratos. Upload genérico e seus endpoints já funcionam. |
| Escrita pessoal no Admin | UpdateCustomerRequest permite kind/birthDate; nomes/contatos/endereços têm rotas próprias. Não há escrita administrativa de personalDetails equivalentes ao PATCH do cliente. | Contrato para estado civil, nacionalidades e filiação já desenhados. Não reutilizar endpoint do cliente autenticado para editar terceiros. |
| Metadados de RG no Admin | POST/PUT de provided-documents existem. Registro fictício temporário criado (201); PUT só de issuer/issuerState retornou 400 documents.metadata_required: documentNumber é obrigatório. Registro arquivado em seguida (200). | Permitir preservar o número sensível ao alterar só metadados, ou definir a exigência de redigitação. Não enviar a máscara como número real nem cobrar essas rotas como ausentes. |\n| Patrimônio | Schemas continuam sem suites e sem início do consórcio. Criação mantém campos obrigatórios além dos formulários reduzidos do QA. | Disponibilizar esses campos e alinhar o mínimo obrigatório com produto/QA, sem dados inventados. Moeda automática, upload e vínculos já existem. |
| PEP/observação e segurança | Sem declaração PEP do perfil/onboarding ou observação livre sem alerta; account-security é leitura. Essa leitura agora traz status da senha/2FA, mas não ações administrativas equivalentes. | Definir escritas previstas no desenho; flags existentes não substituem declaração PEP. Não pedir novamente os campos de leitura já entregues. Recuperação pública por e-mail já existe; a pendência é o contrato da ação administrativa prevista, com autorização/auditoria, não recuperação de senha inexistente. |

## Massa de teste e decisões — não são defeitos de API

- Summary, onboarding e cards agora concordam no nível 0. Éric e Cláudio têm e-mail confirmado, celular não confirmado. Não certificar liberação positiva de níveis 1–3 com essa massa nem pedir nova regra unificada como se não existisse.
- Cláudio não tem documento fiscal próprio cadastrado para o fluxo bancário; o 409 holder_identification_missing continua uma pré-condição de teste. Não inventar CPF.
- A/AA/AAA versus classificação documental/risco continua decisão de Éric/produto; preservar o valor recebido. Não converter letras localmente.
- O progresso legado de aprovação documental não é o mesmo conceito do nível da conta. Não usar sua percentagem como permissão de edição.
- Países, gêneros/estado civil, bairro, múltiplas nacionalidades, contato sem parentesco, declaração sem contato, submit/consentimentos, alternativas RG/CNH/passaporte e UUID/moeda patrimonial já têm contratos. Seus relatos antigos de ausência não devem ser reenviados.
- Preferências e países da entrega final continuam no estudo adiado; não foram ativados nesta revisão.

## Publicação e evidências

Evidências reduzidas sem credenciais: [API](evidence/qa-2026-11-12-perfil-contratos/api-results.json), [renda](evidence/qa-2026-11-12-perfil-contratos/income-retest.json), [ciclo de contrato/documento](evidence/qa-2026-11-12-perfil-contratos/profile-contract-continuation.json), [estados controlados](evidence/qa-2026-11-12-perfil-contratos/local-profile-official-level-tests.json).

Não foram repetidos SMS, novo submit, reprovação/aprovação de identidades preexistentes ou operações financeiras. O único documento tipado criado para investigar a escrita parcial foi um RG fictício temporário do Éric, sem arquivo ou aprovação, arquivado na mesma rodada; nenhum documento anterior foi alterado. Bloqueio/desbloqueio após submit mantém o relatório próprio; esta rodada não amplia sua aprovação.

Portal runtime **9f742d8** publicado: [pipeline 43286596882](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43286596882) aprovada, incluindo audit, lint, 345 testes, build, upload e ativação. Lint/build locais aprovados; diff das alterações passou. O diff global ainda identifica whitespace anterior em PRODUCT.md do portal; o Swagger e o estudo de preferências do Admin e as notas anteriores foram preservados fora deste lote.

Revisão visual local em 1440/390 px do cabeçalho e estado de falha. Contrato/documentos retestados nas URLs publicadas. Nova versão conferida na URL publicada: login real de Éric, Cláudio e Client; Documentação com nível 0 e 1/2 confirmações, sem marcar nível 1 atual; navegação lista/detalhe, histórico traduzido, documentos vazios após remoção e mobile sem overflow. Nove verificações principais, sem exceções de JavaScript. No Admin, fichas Jorge/Cláudio/Client consultadas; renda restaurada conferida em Client, contrato individual na Carteira Strategy do Cláudio conferido; sem erros HTTP persistentes ou de JavaScript nas duas últimas fichas.

Complemento de paginação: runtime **3ac29be**, [pipeline 43287624154](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43287624154) aprovada com lint, 345 testes, build, upload e ativação. Contador do histórico traduzido para “1–1 de 1”, mantendo os controles existentes. Lint/build locais do complemento passaram.

Reteste do complemento publicado concluído com Éric e Cláudio: oito verificações de login, nível oficial, navegação de contrato, estado documental vazio e contador “1–1 de 1”, sem erros de JavaScript. [Resultado](evidence/qa-2026-11-12-perfil-contratos/hml-contract-pagination-final.json). O relatório não declara encerradas as lacunas da API acima.

Admin não teve alteração de runtime neste lote; lint/build locais passaram também neste repositório. Apenas documentação e evidências foram atualizadas, preservando as alterações anteriores do worktree.
