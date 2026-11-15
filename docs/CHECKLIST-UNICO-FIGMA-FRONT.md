# Checklist único — telas do Figma e integração

Atualização: 15/11/2026. Este é o índice desta revisão ampla. Evidências anteriores continuam nos documentos vinculados; uma tela existente não é automaticamente considerada revalidada nesta rodada.

## Critério de conclusão

- [ ] Todos os frames/estados abaixo comparados visualmente, inclusive erro, vazio e retorno.
- [ ] Fluxos de escrita e leitura integrados testados com dados fictícios.
- [x] Admin: lint e build aprovados; 303 testes locais passaram (incluem 8 testes de estudo já existentes no worktree; 295 versionados neste complemento).
- [ ] Reexecutar os checks após concluir as demais telas; Área do Cliente ainda não alterada nesta rodada.
- [ ] Deploy confirmado e testes repetidos nas URLs publicadas.
- [x] Pendências de frontend separadas das pendências reais da API, do designer e da limitação de consulta ao Figma.

## LG03 — resumo executivo temporário do motor (15/11)

- [x] Referência completa recuperada e arquivada (1484:77198), com screenshot em [evidence/qa-2026-11-15-lg03](evidence/qa-2026-11-15-lg03). O card em hover 1484:77226 também foi consultado; esta entrega não aprova sua reformulação completa.
- [x] Resumo ligado ao título do card, sem novo campo ou botão visual. Abre por ponteiro/clique, foco, Enter e Espaço; Escape, saída de foco/ponteiro e troca de contexto fecham o painel.
- [x] Composição do LG03: título, descrição real do catálogo, performance, área do gráfico, Papéis / Contratos, ciclo, próxima atualização e fechamento. Sem dados operacionais: valores indisponíveis, sem curva ilustrativa, contratos de exemplo, contagem zero ou fechamento aplicado inventados.
- [x] Painel de 430 × 560 px no desktop; posição adaptada e rolagem interna na tela pequena. Base escura do glass preserva leitura sobre os dados da tela; título, bordas, espaçamentos e blocos seguem a referência.
- [x] Local integrado: Quant Core, abertura por Enter/Espaço/clique, Escape, Tab, Cards/Lista, busca sem resultado, abrir o motor e voltar. Nenhuma gravação na API.
- [x] Isolado: descrição ausente e descrição fictícia de 672 caracteres. Quebra de texto e rolagem interna sem excesso horizontal em 1280/390 px; arquivos temporários removidos. Capturas isoladas não representam dados retornados pelo backend.
- [ ] Publicação e reteste na URL de homologação.

**API:** OpenAPI reconsultada em 15/11: somente catálogo de motores e vínculos de contrato, sem resumo operacional, performance/série, ciclo, próxima atualização ou fechamento. EngineResponse fornece descrição, mas não os demais campos do LG03. api-review.json preserva paths e schemas publicados. O estado integrado disponível foi testado; o resumo operacional completo continua bloqueado pela API.

**Designer:** nenhum novo bloqueio para o painel isolado LG03. A revisão completa do card e de suas ações continua separada no inventário.

## LG11 — configuração do motor minimizada (15/11)

- [x] Reconfirmado e arquivado o contexto completo do LG11 (`1484:85344`), com screenshot e quatro SVGs originais em [evidence/qa-2026-11-15-lg11](evidence/qa-2026-11-15-lg11).
- [x] Configuração do Motor tem o controle do desenho para recolher/reabrir os campos existentes. `aria-expanded`/`aria-controls`, Enter e Espaço operam o mesmo botão, sem acrescentar campos ou ações.
- [x] Recolhimento preserva os campos montados e os valores locais. Navegar ao LG09 e voltar mantém a configuração recolhida; Cancelar descarta os valores de edição. Novo Motor mantém seu fluxo e não recebe esse controle.
- [x] Aviso de intensidade usa as duas regras diárias já existentes, somente com intensidade/teto/piso numéricos e sinais válidos. Parâmetro ausente/malformado não se transforma em zero nem em violação. Informação geral sobre intensidade alta não presume risco medido nem cria um limiar de negócio.
- [x] Testes locais, sem gravação: Quant Core com parâmetros ausentes não exibe alerta; edição temporária com intensidade 1/teto 0,8/piso −0,8 exibe o aviso; recolher/reabrir preserva valores; 0,1 remove o aviso e campo vazio também; Cancelar restaura leitura sem alerta. Novo Motor com nome fictício foi cancelado, sem criar motor.
- [x] Revisão em 1280/390 px sem excesso horizontal; título 16 px, engrenagem 20 px, seta/alerta/informação 16 px. Os dois avisos do frame foram conferidos com valores locais temporários, não com parâmetros retornados pela API. Capturas `local-invalid-desktop.jpg`/`local-invalid-mobile.jpg` identificam esse cenário.
- [x] Lint/build/diff e 303 testes locais aprovados (295 versionados; oito do estudo preexistente fora da entrega). Detector do componente: zero antipadrões; tipografia e raio explícitos do Figma preservados.
- [x] Publicado em `04b7b54`; [deploy 43730693255 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43730693255). Homologação: leitura com parâmetros ausentes sem alerta falso, recolher/reabrir, retorno do LG09 recolhido, edição temporária inválida/válida/ausente, tecla Espaço preservando 1/0,8/−0,8 e Cancelar restaurando valores vazios/desabilitados passaram.
- [x] Revisão publicada em 1280/390 px sem excesso horizontal; título 16 px e quatro SVGs nas dimensões originais confirmados. Console sem erros/avisos e zero gravações na API. Evidências: `published-invalid-desktop.jpg`, `published-invalid-mobile.jpg`, `published-readonly.jpg` e `validation-results.json`.

**API:** OpenAPI publicada reconsultada em 15/11 continua oferecendo somente catálogo/vínculo de motores. `EngineResponse` não contém intensidade nem limites; não há configuração operacional para consultar/salvar. LG11 foi implementado como estado de frontend, sem simular gravação ou erro de parâmetros ausentes. Evidência: `api-review.json`.

**Designer:** nenhum novo bloqueio do LG11. Os destinos abertos de gráfico/detalhes do LG09 e as demais dependências anteriores continuam separados; esta entrega não os aprova.

## CT09 — inclusão de participante no contrato existente (15/11)

- [x] Reconfirmado o contexto completo do CT09 (`1484:73324`) e preservado em [evidence/qa-2026-11-15-ct09](evidence/qa-2026-11-15-ct09), com screenshot e SVGs originais. CT05 também arquivado para preservar a distinção entre os dois fluxos; sua etapa posterior de distribuição não foi inventada.
- [x] Modal genérico substituído pelo CT09: título Adicionar Participante ao Contrato, fechamento, seção 1. Participante, único campo Cliente, Cancelar e Confirmar inclusão. Medido em 512 × 266 px no desktop, com corpo de 143 px, como na referência.
- [x] Reutilizado `CustomerSelect` e a busca autenticada existente; opções adicionais são configuráveis sem alterar o padrão dos demais consumidores. Corrigida orientação que permanecia junto do nome selecionado; preenchimento e pesquisa usam o mesmo campo, inclusive com nome longo.
- [x] Seis SVGs originais carregados nos slots: quatro em 16 × 16 px e os dois traços do fechamento em 9,33 × 9,33 px. Revisão em 1280 e 390 px, sem excesso horizontal; nome longo e cursor dentro do campo de 36 px.
- [x] Testes isolados sem API: confirmação somente com seleção, sucesso fecha com ID correto, falha mostra erro e preserva seleção, nova tentativa habilitada, busca vazia, falha da busca e bloqueio de campo/fechamento/cancelamento durante salvamento pendente. Arquivos temporários do teste removidos.
- [x] Local integrado: Legacy Prime, busca real, seleção de Éric já vinculado barrada antes de gravação, cancelamento e reabertura sem seleção/erro antigos. Reteste do seletor final confirmou preenchimento sem orientação duplicada e bloqueio da duplicidade.
- [x] Lint, build, diff da entrega e 300 testes locais aprovados (292 versionados; oito do estudo preexistente preservados fora da entrega). Detector do novo componente: zero antipadrões; definições de cores/tamanhos do Figma prevalecem sobre os avisos do DESIGN.md antigo.
- [x] Publicado em `f7b9f57`; [deploy 43728980534 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43728980534). Homologação: busca sem resultado mantém confirmação desabilitada; busca Éric resolve a conta real; duplicidade bloqueada; Cancelar/Fechar e reabertura sem seleção/erro antigos passaram.
- [x] Homologação em 1280/390 px: modal desktop 512 × 266 px, único campo Cliente, seis assets carregados nas dimensões originais, sem excesso horizontal e console sem erros/avisos. Após fechar, Cards e Lista preservam Homologação Pessoa Física e Éric, duas linhas/dois cards. Evidências: `published-desktop.jpg`, `published-mobile.jpg`, `validation-results.json`.

**API:** especificação publicada consultada em 15/11 aceita `allocatedAmount: null` em `POST /admin/contracts/{contractId}/participants`; preservado esse payload existente, sem acrescentar valor ou distribuição ao CT09. Não identificado novo bloqueio de API neste cenário. A nova gravação com sucesso/falha foi exercitada com callback isolado, não com alteração de vínculos dos contratos compartilhados; não declarar escrita integrada aprovada nem classificar teste não executado como bug do backend.

**Designer:** distribuição após CT05 continua sendo a dependência já registrada. Este ajuste se aplica somente ao CT09 do contrato existente; não aprova nem substitui a seleção/distribuição da criação.

## LG09 — tabela completa recuperada (14/11, complemento)

- [x] Nova tentativa liberada: recuperados os 19 contextos restantes, todos completos. Os 69 blocos consultados estão preservados em `figma-recovered-context.json`, sem respostas de erro pendentes. A limitação de acesso da primeira rodada foi superada.
- [x] Tabela completa do estado desenhado: oito grupos e 58 indicadores na ordem do LG09; indicadores com rótulos repetidos têm identidades distintas. Cabeçalho por período, ação de detalhamento, bordas, glass, cores, badges e ênfases conforme os contextos recuperados.
- [x] Extraída a primitiva `GroupedTemporalTable`; recebe células de apresentação, sem pressupor um contrato HTTP inexistente, fazer cálculos financeiros ou inferir resultados pela cor.
- [x] Teste isolado com os 12 períodos exemplificados no Figma: 13 colunas, oito grupos, 58 indicadores, zero preservado, badges e valores positivos/negativos. A ação de detalhe emitiu o identificador correto do período. **Este teste valida a emissão do evento, não uma consulta integrada de detalhes.**
- [x] Sem períodos: uma coluna sem data inventada e 58 valores indisponíveis. Texto fictício de 515 caracteres quebrou dentro da célula de 160 px; rolagem horizontal por teclado manteve a primeira coluna visível. Revisões em 2304/1280 px e 390 px sem excesso horizontal da página. Capturas isoladas identificadas em `table-isolated-desktop.png` e `table-isolated-mobile.png`.
- [x] Fluxo local real: Quant Core → histórico com os oito grupos/58 valores indisponíveis → Gráfico sem série → retorno à lógica com foco restaurado. Nenhum dado dos exemplos foi incorporado à aplicação nem gravado na API; arquivos temporários do teste removidos.
- [x] Lint, build, 300 testes locais (292 versionados, oito de estudo preexistentes não incluídos) e revisão de diff aprovados.
- [x] Complemento publicado em `bdd76b1`; [deploy 43608770289 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43608770289). Quant Core → LG09: oito grupos, 58 indicadores indisponíveis, nenhuma data de exemplo. Tabela/Gráfico, retorno com foco restaurado e opções Tabela/7D preservadas passaram novamente em homologação.
- [x] Revisão publicada em 1280 px e 390 px, sem excesso horizontal da página; no celular, conteúdo da tabela de 360 px rolável dentro de 342 px. Os quatro SVGs continuam em 16 × 16 px e o console não registrou erros/avisos. Evidências: `table-published-desktop.png`, `table-published-mobile.png`, `table-validation-results.json`.

**API:** continuam faltando histórico operacional/agregações, dados por atualização e exportações. Os controles correspondentes permanecem desabilitados; auditoria CRUD não substitui a série do motor. A especificação revisada está em `api-review.json`.

**Desenho:** o frame LG09 recuperado apresenta a tabela e os botões Gráfico/Ver atualizações detalhadas, sem desenhar os respectivos estados abertos. A consulta somente leitura confirmou `reactions: []` nesses dois botões e no frame (`prototype-links.json`), sem destino vinculado para recuperar automaticamente. A tabela foi concluída; gráfico com dados e composição aberta dos detalhes não são declarados visualmente homologados por este teste. Não foram criadas telas adicionais para esses destinos.

## LG09 — primeira publicação, antes da recuperação integral (14/11)

- [x] Recuperados o screenshot integral do frame `1484:83540`, o contexto completo do cabeçalho e 49 outros blocos da tabela. Referência durável em [evidence/qa-2026-11-14-lg09](evidence/qa-2026-11-14-lg09).
- [x] Histórico abre como subpágina, substituindo a ficha visível, com título, legenda, retorno, períodos, granularidades, visualizações e exportações do cabeçalho obtido. Nenhum campo ou ação adicional.
- [x] Retorno preserva o motor, o modo de edição e o componente de performance montado. Teste local alterando para Tabela/7D, abrindo o histórico e voltando preservou ambas as opções; foco retorna ao botão que abriu o histórico.
- [x] Estados reais sem fonte operacional: Tabela e Gráfico mostram indisponibilidade; períodos, granularidades e CSV/PDF ficam desabilitados. Não foi considerado histórico vazio confirmado, nem foram geradas séries de exemplo ou usados eventos de auditoria CRUD como atualizações do índice.
- [x] Revisão visual local em 1280 px e 390 px, sem excesso horizontal; quatro SVGs do cabeçalho carregados em seus slots, todos em 16 × 16 px. Corrigida a herança global que alterava a fonte do título; conferir também na publicação.
- [x] Publicado em `40fb41d`; [deploy 43606382875 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43606382875). Quant Core abriu pela listagem real; Tabela/Gráfico, retorno com Tabela/7D preservados, foco no botão de origem e retorno ao modo Editar passaram no Admin publicado. Nenhuma alteração de motor foi gravada.
- [x] Revisão publicada em 1280 px e 390 px, sem excesso horizontal. Título branco em 18 px; quatro SVGs carregados em 16 × 16 px; 13 controles dependentes de dados desabilitados; console sem erros/avisos no reteste. Evidências: `published-desktop.png`, `published-mobile.png` e `validation-results.json` na pasta desta rodada.
- [ ] Concluir tabela completa, detalhes por atualização e validação com série real. **LG09 não está entregue integralmente.**

**API — bloqueio confirmado na especificação publicada em 14/11:** existem apenas `/admin/contracts/catalog/engines`, `/admin/contracts/catalog/engines/{engineId}` e `/admin/contracts/{contractId}/engines`. `EngineResponse` traz identificação/descrição/selecionabilidade; não fornece histórico operacional, agregação por período/granularidade, parâmetros/travas/impacto por atualização ou exportações CSV/PDF. Evidência: [api-review.json](evidence/qa-2026-11-14-lg09/api-review.json). Não foi inventado endpoint para testar 404.

**Referência — bloqueio de consulta, separado da API/designer:** o Figma retornou o frame completo como metadados esparsos. A leitura dos filhos recuperou 50 contextos completos, mas 19 consultas foram recusadas pelo limite do plano, incluindo o cabeçalho das datas e blocos finais. A tabela populada não foi implementada a partir dos metadados incompletos. IDs e respostas preservados em `figma-recovered-context.json`; não é falta de desenho do designer. O gráfico populado e os detalhes também precisam de referência suficiente antes de implementação.

## Verificado localmente nesta rodada

- [x] Navegador reconectado a localhost:8080; sessão administrativa existente preservada.
- [x] Lógicas: catálogo real, abertura da criação, opções reais de moeda, validação de nome, cálculo local de índice final (100 + 5% = 105), cancelar sem criar registro.
- [x] Crédito: consulta vazia real, seleção do tipo, consulta real de clientes, seleção de Éric, retorno para tipo e bloqueio de criação sem simular operação aceita.
- [x] Parceiros: campos obrigatórios, seleção de produto, avanço para regras e fechamento sem gravar.
- [x] Comunicados: filtro Arquivado, abertura do registro e proteção contra edição de arquivado (readonly/Salvar desabilitado).
- [x] Comunicados: consulta real de publicados/arquivados; seletor de tipos; editor de Comunicado Oficial e prévia local com texto fictício, sem publicação ou notificações.
- [x] CT01/CT02: cards horizontais, busca Legacy, troca para lista, abertura do contrato e volta preservando a busca.
- [x] Vigência: Cancelar descarta o período escolhido.
- [x] Modelos: paginação completa, falha parcial, resposta obsoleta, busca com acentos, datas localizadas, preservação de audiência/categoria e validações numéricas/data.

## CT08 e CT10 — revisão adicional

- [x] CT08: Lista agora é tabela com as dez colunas do desenho; Cards mantém a composição existente.
- [x] Legacy Prime: Éric aparece como PF e participação 40%, Homologação Pessoa Física como PF e 60%, sem alterar vínculos.
- [x] Detalhes de Éric abrem o CT10; nome/data/participação/aportes vêm do contrato e e-mail mascarado vem da consulta cadastral real.
- [x] Fechar o modal mantém a lista; voltar para Cards mantém ambos os participantes.
- [x] CT08/CT10 publicados em `b6c7b84`; [deploy 43450966788 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43450966788). Lista de Éric, abertura do CT10, e-mail mascarado e fechamento mantendo a lista retestados no Admin publicado.
- [x] Lint, build e 274 testes locais passaram novamente após CT08/CT10.
- [x] Crédito publicado carrega a consulta vazia real; Lógicas publicado carrega Quant Core, abre Novo Motor e retorna pelo Cancelar.
- Lacunas do DTO de participante: status do vínculo, índice na entrada, participação inicial, posição, total retirado e últimos movimentos não são retornados. Não converter o status do cliente em status do vínculo.
- Históricos por vínculo e destino dos dividendos no CT10 permanecem sem integração. A revisão dos endpoints de movimentos/distribuições continua sendo tarefa do front antes de atribuir essa lacuna ao backend.

## Contratos — contraste e estados expandidos (rodada atual)

- [x] Contraste: tabelas de aportes e alterações agora usam tema escuro; cabeçalhos e células medidos no navegador com `rgb(255, 255, 255)`. Textos longos do histórico quebram linha.
- [x] Campos dos novos modais: corrigida a herança que deixava os valores azuis; leitura branca confirmada no formulário de dívida.
- [x] CT06: formulário do Figma com tipo, bolsa, nome, ticker e moeda. B3 preenche BRL automaticamente; moeda inexistente é barrada localmente.
- [x] CT06: reutilização de PETR4 sem duplicar catálogo e criação real do ativo fictício QACT3, sem finalizar contrato.
- [x] CT13/CT14: tabela no lugar da lista textual; edição de contrato existente permite adicionar/remover vínculo de ativo. PETR4 foi adicionado e removido pela interface; universo restaurado a zero.
- [x] CT15/CT16/CT17/CT18/CT19: tabela e formulários conforme os campos desenhados; dados disponíveis preenchidos pela API. Criação visual, campos obrigatórios, abertura de detalhes, histórico real, edição preenchida e descarte passaram.
- [x] CT19: Salvar desabilitado sem mudança; alteração local do credor habilita; fechar/reabrir restaura o credor do servidor.
- [x] CT20: tabela com nome, tipo real, envio, formato e ações do desenho. Vínculo, download de PNG fictício (68 bytes), visualização em nova aba e remoção do vínculo passaram. Arquivo original preservado.
- [x] CT11: motor principal real Quant Core, conexão pendente e índices indisponíveis preservados; Ver motor completo abre Lógicas e Voltar retorna ao contrato.
- [x] CT21/CT22/CT23: troca tabela/gráfico, períodos, histórico expandido, intervalo 01–13/11, troca para 90 dias e fechamento testados localmente. Intervalo personalizado e período predefinido se desmarcam mutuamente. Sem série temporal real, indicadores não recebem valores de exemplo e exportação permanece desabilitada.
- [x] Leitura de movimentos por vínculo testada no CT10 do Éric, com retorno vazio real e total retirado zero confirmado, usando os filtros reais cliente/contrato; aportes não incluem resgates. Somatórios recusam mistura de moedas e preservam zero confirmado.
- [x] Paginação: leituras completas interrompem ao sair/trocar de registro e rejeitam envelopes de erro/paginação inválida.
- [x] Rotas legadas de lógica e dividendos direcionam a Lógicas; não abrem as telas antigas com dados fictícios.
- [x] Revisão local desktop e 390 px: tabelas contidas com rolagem própria, modal completo sem excesso horizontal, cabeçalhos/células e intervalo de datas legíveis.
- [x] Contratos publicados em c32f5a5; deploy 43470716702 aprovado. Consulta de Legacy Prime, texto branco nas tabelas, troca para gráfico, ativos/documentos vazios, abertura e cancelamento de Adicionar Documento e CT06 no modo Editar retestados no Admin publicado, sem gravar alterações.
- Evidência: captura admin-contratos-contraste-publicado.jpg na pasta de visualizações desta rodada.

### API — lacunas verificadas nesta rodada

- Exportação de ativos: `format=xlsx` e `format=pdf` retornaram HTTP 400, `contract_asset.export_format_invalid`, informando suporte apenas a CSV. Figma pede Excel e PDF.
- Alterar os dados de um vínculo de ativo: não há PATCH do vínculo; PATCH do catálogo é global e não será usado como substituto. Inclusão e remoção do vínculo já funcionam.
- Composição estratégica Intradiário/Núcleo/Tática: não há campos/rotas para persistir os três percentuais. Não preencher com exemplos nem descartar valores silenciosamente no salvamento.
- Dívida: faltam alteração do cliente responsável, início das parcelas, parcela atual/total, valor da parcela, dia fixo, periodicidade, amortização, índice de correção, taxas mensal/anual distintas, modo automático/manual e dados estruturados do boleto. A edição completa do desenho não pode ser salva com o DTO atual.
- `interestRatePercent` não informa a periodicidade no Swagger. Não foi apresentado como taxa mensal por suposição.
- Remoção de dívida: não há DELETE/desvinculação; não usar mudança para Canceled como substituto da remoção do desenho.
- Documento do contrato: tipos específicos do desenho ainda precisam constar no catálogo. A consulta atual retornou 31 tipos e, entre contratos, apenas CONTRATO_ADESAO_CONSORCIO. O teste mostrou o tipo real Declaração IRPF; não foi renomeado para Contrato digitalizado.
- CT10: consulta real de transações existe e foi integrada ao histórico de aportes. Ainda falta identificar distribuições/dividendos e seus destinos; o resgate não será apresentado como dividendo.
- Performance e operações intradiárias: Swagger atualizado consultado; não há consulta da série temporal/OHLC nem operações operacionais/distribuições dos motores.

### Designer / definição de negócio

- CT06: o frame fornecido mostra Ativo de bolsa. Falta o estado de Criptoativo e a definição de como os dados de rede/token entram nos campos existentes; não foi acrescentado campo Rede por conta própria.
- CT12: o modal está desenhado, mas não foi localizado o gatilho de abertura no CT07/CT11. Definir onde a ação aparece, sem inventar botão.
- CT20: confirmar o modal de inclusão; o desenho enviado contém a tabela e Adicionar Documento. O fluxo legado de vincular documento do cliente foi reutilizado, sem acrescentar campos novos.
- Dívidas: o servidor usa Active/Overdue/Renegotiated/Settled/Canceled; definir a correspondência com Em dia e o modo automático do desenho. Não converter status por aproximação.

### Dados de teste desta rodada (não são bloqueios da API)

- Dívida `DBT-26F371A5`, ID `382914ef-79ef-44ff-b2d9-dcc3b6ee3b70`: registro explicitamente fictício, saldo zero, encerrado com status Canceled após os testes. Não houve operação de carteira.
- Ativo `QACT3`, ID `7e901686-a9d5-4910-bc08-b0bae4b2d293`: nome QA CT06 FICTÍCIO — não negociar. Permanece como dado de teste no catálogo; nenhum vínculo ficou no rascunho.
- Legacy Prime e rascunho QA CT04/CT07: confirmados pela API com zero ativos e zero documentos após a restauração dos testes.
- Arquivo `qa1112-ficticio-sem-dados-pessoais.png`: original Available preservado; somente o vínculo temporário foi removido.

## Lógicas — estados de performance e simulação

- [x] Composição do LG05 com oito indicadores, visualizações Gráfico/Tabela, períodos, granularidade e abas Motor/Papéis Vinculados/Comparar, usando o contexto completo do Figma obtido nesta rodada.
- [x] Composição da simulação de edição com Tabela Atual e Tabela Simulada e os 22 indicadores do desenho; alternância Abaixo/Ao Lado reutiliza a mesma tabela neutra.
- [x] Índices, probabilidades, séries e resultados não recebidos continuam indisponíveis; a tela não produz uma simulação fictícia nem apresenta o motor como ativo pelo isSelectable.
- [x] Testados localmente: abrir Quant Core, Área, Comparar, Tabela, iniciar edição e alternar para Ao Lado. Ambas as tabelas mantêm os mesmos 22 indicadores.
- [x] Responsividade local confirmada em 390 px: ambas as tabelas com 22 indicadores, empilhadas sem excesso horizontal; ícones medidos nas dimensões nativas (16 px e 16,7 px).
- [x] Lógicas publicadas em 1b3ccf6; deploy 43473340021 aprovado. Tabela de 22 indicadores, início da edição, Ao Lado (empilhado em 390 px) e Cancelar retestados no Admin publicado.
- [x] Comparar em modo Tabela mantém estado indisponível próprio; não reaproveita indevidamente os indicadores do motor. Verificado localmente e no Admin publicado após o deploy complementar 5f47719 (execução 43474098962, concluída com sucesso).
- LG09 ainda não está concluído; a composição completa do histórico e sua revisão não foram marcadas como entregues.

## Impedimento da revisão visual restante

- O conector do Figma retornou limite de chamadas da conta/plano durante a obtenção dos estados restantes. Contextos completos já obtidos foram aproveitados; respostas esparsas não foram usadas como especificação de implementação.
- Esse limite não é pendência do backend e não significa aprovação das telas que continuam listadas como trabalho de frontend.
- Continuam necessários os contextos completos dos estados restantes de Lógicas, Crédito/Comunicados e Área do Cliente para concluir a comparação visual de todo o inventário.

## Contextos já obtidos — complemento de 13/11

- [x] CR10: detalhes de parceiro no modal do desenho, dados/contatos, produtos e comissão real (inclusive zero), oito abas, Fechar/Editar e retorno à primeira aba ao reabrir. Teste isolado com props fictícias, desktop e 390 px; não há parceiros fictícios na aplicação publicada.
- [x] CO06: áreas de PDF, áudio e anexos com ícones originais, nomes reais dos arquivos, limites desenhados (50/100 MB), seleção múltipla de anexos e erros independentes. PDF inválido não apaga a seleção válida anterior.
- [x] Prévia de PDF renderizada no próprio front: o visualizador nativo ficava vazio no IAB e no Edge. PDF.js local, worker/fontes/CMaps/WASM servidos pelo projeto, sem CDN; três páginas com orientação mista e troca de arquivo testadas. Sem novos botões/campos.
- [x] CO08: prévia formal com autor, versão/código, data real e fechamento do desenho. Sem autor/data publicados, informa ausência; conteúdo HTML digitado permanece texto escapado.
- [x] Arquivado, carregamento, falha e troca de registro: edição bloqueada até carregar o registro correto; arquivado permanece somente leitura. Troca entre editores não reaproveita dados do registro anterior.
- [x] LG06: Editar no menu da linha agora abre edição; Cancelar descarta índice local e volta ao registro real somente leitura.
- [x] CT11.1–CT11.3: modos combinado/principal e aleatório/fixo preparados como apresentação e testados isoladamente. API sem configuração não seleciona um modo por suposição. Não foi criado campo de percentual que não aparece no desenho.
- [x] Testes locais de arquivo inválido/válido, áudio WAV, anexos múltiplos, prévia/fechamento, validação obrigatória e proteção de arquivado. Nenhum comunicado publicado nem notificação enviada.
- [x] Complemento publicado em 1c5cb04 e correção de MIME do worker em 4002e2a; [deploy final aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43491875929).
- [x] Homologação: prévia CO08, arquivado readonly, edição pelo menu LG06 e Cancelar; PDF real de uma/três páginas, arquivo inválido preservando anterior, nova seleção, WAV (0,5 s / readyState 4), anexos múltiplos, fechar/reabrir prévia, 390 px sem overflow e validação de título.
- [x] Homologação: tentativa de Salvar relatório com dados preenchidos informa serviço indisponível, sem sucesso fictício. Descartar retorna aos mesmos dois registros. Não houve publicação nem notificação.
- [x] Publicação detectou worker .mjs servido como application/octet-stream; corrigido para .js versionado, confirmado application/javascript e PDF renderizado no IAB publicado.
- [x] Checks finais: lint, build, diff dos arquivos da entrega e 290 testes locais aprovados; CI testa somente os 282 versionados, pois os 8 do estudo futuro foram preservados fora da entrega.
- Evidências publicadas: admin-co08-publicado.jpg, admin-pdf-publicado.jpg e admin-pdf-mobile-publicado.jpg em C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/.
- CR10/CT11 configurado: testes de apresentação isolados. Sem DTOs operacionais, não foram considerados homologação integrada.

**Backend:** persistência de parceiros e seus detalhes; grupos editoriais, redatores, PDF/áudio/anexos/versão e metadados; configuração operacional dos motores. Uploads/prévias são locais e não simulam persistência.
**Designer/contexto:** mídia/H2/H3 abertos, LG09 completo, distribuição CT05, importação e gatilho CT12 continuam sem desenho completo disponível. Não classificar como bug da API. Nenhuma nova consulta ao Figma foi necessária neste complemento.
**Limite da entrega:** demais frames assinalados como Revalidar continuam pendentes; não declarar o inventário inteiro homologado.

## CR06 e LG08 — complemento de 14/11

- [x] CR06: cabeçalho com código, status real, tipo, cliente, valor, garantia e datas; sete etapas sem selecionar uma etapa CRM a partir do status informativo. Corrigida leitura do cliente para client.name (o DTO não possui displayName).
- [x] CR06: seções do desenho, documentos enviados, expansão de Documentos Futuros Previstos, comparativo com colunas aprovadas e histórico em linha do tempo (data/hora, autor, motivo e campos alterados). Sem linhas de propostas fictícias.
- [x] CR06: detalhe, documentos e histórico preservam erro/carregamento independentes. Testes isolados: valor/prazo zero, vazio, loading, falha documental com retry emitido, expansão, fechar e 390 px sem overflow externo. Ícones originais medidos em 16 px e seta em 12 px.
- [x] LG08: cabeçalho/fechamento, confirmação, cinco regras e hierarquia no desenho salvo. Configuração incompleta não recebe ícone de sucesso; só regras satisfeitas recebem check. Testes isolados de configuração válida/incompleta e mobile; ícones originais de 16/20/24 px.
- [x] Validações numéricas: campos ausentes, sinal incorreto, igualdade entre limites e probabilidades fora de 100% não recebem aprovação. Testes unitários específicos.
- [x] Publicado em e338e99; [deploy 43597305433 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43597305433). Lint/build e 292 testes locais passaram; 284 versionados no CI (8 testes futuros preexistentes preservados fora da entrega).
- [x] Homologação: Crédito retorna vazio real em Lista/Cards e não inventa operações no Kanban; seleção de tipo abre escolha de cliente e Fechar retorna. Sem operação cadastrada, CR06 preenchido continua validado somente de forma isolada.
- [x] Homologação: Novo Motor → Confirmar e Criar sem nome abre LG08 com erro, sem ícone de sucesso e com apenas a regra 50+50 atendida. Preencher intensidade 1, tetos 2/5 e pisos -2/-5 faz os cinco checks passarem, mas não aprova a configuração incompleta. Fechar/Cancelar retorna a Quant Core, total 1, sem escrita.
- Evidência publicada: C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/admin-lg08-publicado.jpg.
- Detector executado nos dois componentes: zero antipadrões; avisos consultivos de paleta/raio/tipografia do DESIGN.md antigo mantêm a referência explícita do Figma.

**API (CR06):** faltam etapa CRM, renda mensal da operação, requisitos preenchidos/faltantes e documentais por etapa, responsável/origem, parceiros, pré-propostas/propostas e sua comparação/escolha. Os endpoints de empréstimos atuais são informativos; não usar Active como Contratada. As ações desse funil permanecem desabilitadas. A abertura/download de arquivo exige concluir a revisão da rota documental geral antes de atribuir ausência à API.
**API (LG08):** a aprovação local das regras não persiste nem executa motor. Configuração operacional ainda não tem contrato HTTP; o bloqueio de salvamento permanece explícito.
**Designer:** nenhum novo questionamento nestes dois frames; utilizados somente os contextos completos já obtidos. LG09 completo, editor de mídia, CT05/importação/gatilho CT12 permanecem nas dependências anteriores.
**Limite de teste:** CR06 com conteúdo foi validado isoladamente com props fictícias, sem criar empréstimo. Não afirmar fluxo integrado de propostas aprovado.

## Comunicação CO07 / EC01 / EC02 — complemento de 14/11

- [x] CO07: modal de 512 px, cabeçalho, foto 80 px e inicial 24 px, botão Enviar Foto com SVG original, campos/nota/rodapé do desenho salvo. Criar Redator só habilita com nome, função e atribuição preenchidos; nenhuma ação adicional.
- [x] Foto válida decodificada antes de mostrar; imagem inválida preserva a anterior e mostra erro. Cancelar/Fechar descarta dados/foto, reabrir inicia vazio, e término assíncrono após fechamento não atualiza o componente.
- [x] EC01: Conteúdos/Redatores com aba selecionada azul e sublinhado; navegação por clique e teclado. Badges Publicado/Rascunho/Em Revisão/Arquivado conforme cores, bordas e tipografia do contexto obtido. Valor desconhecido não vira outro status por aproximação.
- [x] EC01: ação principal com ícone original de 16 px, espaço e fundo glass do desenho. Status aplicado na lista e no cabeçalho do editor, preservando o valor real.
- [x] EC02: coluna Data/Hora do histórico agora inclui hora/minuto; consulta de arquivado mantém os registros reais e a edição bloqueada. Agendamento continua sem seletor inventado.
- [x] Testes locais: obrigatórios, validação e preservação da foto, tentativa de gravação informando serviço indisponível, descarte/reabertura, duas abas, quatro badges + desconhecido/nulo, histórico real e mobile 390 px sem overflow externo. Ícones 16 px conferidos. Lint/build e 292 testes locais passaram (284 versionados, 8 de estudo preexistente fora desta entrega).
- [x] Publicado em a13770a e ae7cd27; [deploy final 43599800369 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43599800369).
- [x] Homologação: CO07 vazio/obrigatórios, foto PNG fictícia, imagem inválida preservando foto anterior, campos preenchidos e tentativa de gravação com indisponibilidade explícita; Cancelar/reabrir restaura vazio e botão desabilitado.
- [x] Homologação: abas Conteúdos/Redatores, Publicado e Arquivado reais; cabeçalho de arquivado preserva somente leitura. Histórico exibe 12/11/2026 14:49 em vez de só a data. Lista mantém dois registros e nenhum disparo foi feito.
- [x] Homologação final: rótulos e abas medidos com peso 600; foto 80 px e inicial 24 px; ícones originais de 16 px. Verificação local em 390 px sem excesso horizontal. Detector: zero antipadrões; avisos consultivos relativos ao DESIGN.md antigo não substituem o Figma.
- Evidência: C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/admin-co07-publicado.jpg.

**Backend:** continuam faltando API de redatores (consulta/gravação/foto/perfis editoriais/contagem), grupos editoriais e demais metadados já relacionados. O modal não simula sucesso de gravação nem cadastra redator fake.
**Designer:** escolha de data/hora de Programar e estado aberto do editor de mídia/H2/H3 continuam sem contexto completo. Não foram adicionados campos.
**Limite:** Rascunho/Em Revisão e status desconhecido foram validados por props isoladas, sem publicar comunicados ou gerar notificações.

## Comunicação — histórico completo e falhas independentes (14/11)

- [x] Corrigido corte de frontend: Histórico de Alterações exibia só cinco linhas com paginação oculta. Agora apresenta todas as alterações carregadas, nas mesmas quatro colunas do EC02.
- [x] Consulta percorre todas as páginas da auditoria com ResourceType/ResourceId fixos. Não faz consulta global se o ID do registro for inválido.
- [x] Erro na segunda página não expõe histórico parcial; Tentar novamente reinicia na primeira página. Resposta de consulta substituída/registro fechado é descartada.
- [x] Falha no conteúdo não esconde histórico que carregou; falha no histórico não esconde o conteúdo. Reconsulta com falha mantém Salvar/Publicar bloqueados, sem reutilizar uma fonte antiga.
- [x] Testes isolados de navegador: 107 linhas em duas páginas, última alteração acessível, falha de conteúdo com 107 linhas preservadas, falha da página 2 com zero linhas parciais, retry 1/2/1/2 e vazio real.
- [x] Local integrado: arquivado COM-BB0889A7 retorna seis alterações e agora as seis aparecem, inclusive a criação que ficava cortada.
- [x] Lint, build, diff da entrega e 297 testes locais passaram (289 versionados; 8 do estudo futuro preservados fora da entrega).
- [x] Publicado em c7b3542 e bcd78ba; [deploy final 43602825718 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43602825718).
- [x] Homologação: seis alterações do arquivado COM-BB0889A7 exibidas, incluindo Criação; Salvar permanece desabilitado. Textos longos quebram na quarta coluna: largura e scroll da tabela ambos 894 px no desktop, sem excesso horizontal da página.
- [x] Janela estreita local: rolagem contida na tabela (620 px dentro da seção), sem alterar as quatro colunas. Testes de 107 registros/falhas/retentativa foram isolados, sem dados fictícios no bundle e sem escrita na API.
- Evidência: C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/admin-publication-history-complete.jpg.

**Backend/designer:** nenhum novo bloqueio identificado neste cenário. Paginação, corte da tabela e isolamento eram correções do frontend. Persistem as dependências editoriais relacionadas acima.
**Referências:** CO02/cards estava pendente de recuperação do contexto. A referência foi recuperada no complemento CO02 abaixo; essa limitação anterior foi resolvida.

## CO02 — cards de redatores, referência recuperada (14/11)

- [x] Contexto completo e screenshot recuperados do Figma, nó 1484:96418. Arquivados em [referência CO02](evidence/qa-2026-11-14-co02/source.json), [desenho](evidence/qa-2026-11-14-co02/figma-reference.png) e [contexto](evidence/qa-2026-11-14-co02/figma-context.txt), para não depender do cache da conversa.
- [x] Card com avatar 64 px/initial 20 px, nome 18 px, função/atribuição, menu original, divisor, Publicações/Status e três textos de perfil. Base medida em 565,3 × 274,4 px, como no frame. SVG original do menu medido em 16 px, gatilho 32 px.
- [x] Retirados acordeões extras dos textos e busca/filtros de conteúdo da aba Redatores, ausentes no CO02. Nenhum novo campo ou ação. Foto fornecida por dados continua dinâmica; ausência/falha usa inicial.
- [x] Estados isolados: zero preservado, nulo/ausente indisponível, status desconhecido sem converter para Ativo, foto válida e com falha, textos longos/com palavra sem espaços, HTML escapado, vazio e consulta indisponível sem cards antigos.
- [x] Menu mantém somente Editar existente; emite o redator correto e fecha por Escape. Corrigido o controlador que abria Criar Novo Redator vazio ao pedir edição: agora informa indisponibilidade, sem simular edição.
- [x] Responsividade: 2048 px com três colunas, 1280 px com duas e 390 px com uma; sem overflow externo. Menu compartilhado de Comunicados continua abrindo Abrir/Editar.
- [x] Local integrado: aba Redatores sem busca/filtros de conteúdo e sem dados fictícios; Novo Redator abre o CO07 e fecha normalmente.
- [x] Lint/build/diff da entrega e 297 testes locais aprovados (289 versionados e 8 do estudo preexistente fora desta entrega). Detector do card: zero antipadrões; avisos consultivos do DESIGN.md antigo preservam as definições explícitas do Figma.
- [x] Publicado em 6143e32; [deploy 43604671622 aprovado](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43604671622).
- [x] Homologação: Redatores sem toolbar de conteúdo, zero cards fictícios e Consulta indisponível preservada; Novo Redator abre/fecha CO07. Conteúdos mantém busca/filtros próprios; menu compartilhado abre Abrir/Editar e o arquivado mantém seis alterações reais.
- [x] Referência e resultados arquivados em docs/evidence/qa-2026-11-14-co02. A referência deixou de ser dependência; leitura/gravação integrada de redatores continua bloqueada pela API.

**Backend:** Swagger público consultado novamente em 14/11 (/openapi/v1.json): sem rotas de autores/redatores. Faltam consulta/identificação, foto, função/atribuição, contagem, status, textos de perfil e gravação/edição. O componente usa props e não assume um DTO HTTP novo. A aba publicada permanece com Consulta indisponível até haver integração; não há pessoas de exemplo no bundle.
**Designer:** o CO02 não detalha o menu aberto. Preservado apenas Editar já existente; nenhum Arquivar/Excluir/Ativar foi criado. A edição integrada continua dependente da API e do fluxo de edição aprovado, sem reutilizar o cadastro vazio.
**Evidência isolada:** admin-co02-cards-isolado.jpg e admin-co02-cards-mobile-isolado.jpg na pasta de visualizações desta rodada. Esses testes não representam leitura integrada de redatores nem dados publicados.

## Ainda é trabalho de frontend

- [ ] Concluir a revisão integral LG05/LG06/LG07/LG09; estados básicos de gráfico, tabela e disposição da simulação já preparados e testados, histórico completo ainda pendente.
- [ ] Concluir e revisar as abas e estados expandidos dos contratos CT08–CT23, preservando os serviços existentes.
- [ ] Comparar os estados de Transações e Carteiras com seus frames, inclusive os modais.
- [ ] Concluir o editor de blocos de conteúdo quando houver contexto completo do estado aberto; a área de texto atual não implementa inserção de mídia/H2/H3. CR10 já composto e validado isoladamente; integração de parceiros depende da API.
- [ ] Conferir todos os estados responsivos e as imagens/ícones dos novos módulos.
- [ ] Área do Cliente: revisar solicitações de empréstimo/alavancagem e substituir os dados fictícios legados antes de considerar os fluxos integrados.
- [ ] Executar regressão visual do conjunto de telas anteriores; consultar o inventário abaixo para não esquecer estados.

## Dependências reais de API

Referência: OpenAPI de homologação consultado nesta rodada, sem substituir o snapshot versionado do usuário.

- Lógicas: o catálogo retorna ID, código, nome, descrição e disponibilidade de seleção. Não oferece configuração operacional de ciclo, frequência, probabilidades, intensidade, limites, fechamento, simulação, performance ou histórico operacional. `isSelectable` não é status operacional. Nenhum salvamento parcial foi apresentado como configuração completa.
- Crédito: `/admin/loans` representa empréstimos informativos. Faltam os contratos HTTP do funil, parceiros, produtos/regras, propostas, comissões e responsáveis do CRM. A criação existente exige valor principal; CR04/CR05 só coletam tipo e cliente, portanto o front não inventa valor nem equivalência de tipo.
- Comunicados: os endpoints atuais permitem texto, categoria HTTP e público-alvo. Faltam grupos editoriais (Insight/Comunicado Oficial/Relatório), redatores, temas, capa, anexos/PDF/áudio, versão, referências e disparos. Não converter categorias HTTP em grupos editoriais por suposição. A edição de texto de registro existente preserva audiência e categoria originais.
- Capital atual e operações intradiárias dos contratos: manter indisponível enquanto esses dados não forem retornados; capital inicial não substitui capital atual.

## Definições do designer

- Distribuição após CT05: frame não encontrado; questionamento já solicitado pelo usuário.
- Modelo de importação de contratos: definir o modelo aprovado.
- CR08/CR09: diferenciar produtos oferecidos e produtos habilitados; o desenho seleciona oferecidos e menciona habilitados, sem controle para essa segunda seleção.
- Agendamento de publicação: o botão Programar existe, mas a composição da escolha da data/hora não foi fornecida. Não acrescentar um campo por suposição.
- Inserção dos blocos de mídia: detalhar o estado aberto do editor antes de inventar controles.

## Publicação

- [x] Commit e push da primeira composição: `515c8b6`.
- [x] Deploy `515c8b6` concluído: [execução 43449296804](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43449296804).
- [x] Admin publicado: CT01/CT02 carregam; busca Legacy + tabela com participante e valor inicial reais; capital atual indisponível preservado.
- [ ] Repetir a validação publicada dos demais estados após seus ajustes.
- Área do Cliente não foi alterada nesta rodada; não há novo deploy dela a anunciar.

## Inventário por frame

Legenda: **Preparado / revisão pendente** = há código novo, mas a validação completa do frame não terminou. **Revalidar** = consultar a implementação e evidências anteriores antes de marcar pronto. O inventário não atribui ao backend telas ainda não implementadas.

### Admin

| Frame                                                                                | Desenho                                                                                       | Situação nesta revisão                                                   |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [1484:66878](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-66878) | A01 · Login — Padrão · Glass                                                                  | Revalidar                                                                |
| [1484:66973](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-66973) | A02 · Seleção de Sistema · Glass                                                              | Revalidar                                                                |
| [1484:67206](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-67206) | F01 · Seleção de clientes · Cards / Lista + filtros                                           | Revalidar                                                                |
| [1484:67207](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-67207) | C01 · Seleção de Cliente — Cards · Glass                                                      | Revalidar                                                                |
| [1484:67626](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-67626) | C03 · Seleção de Cliente — Lista · Glass                                                      | Revalidar                                                                |
| [1484:67993](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-67993) | C04 · EC · Painel de Estados · Filtro Status                                                  | Revalidar                                                                |
| [1484:67997](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-67997) | EC01 · Status fechado                                                                         | Preparado / revisão pendente                                             |
| [1484:68005](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-68005) | EC02 · Status aberto                                                                          | Preparado / revisão pendente                                             |
| [1484:68034](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-68034) | F02 · Perfil do cliente · Ficha no centro · estados, cliente novo e patrimônio em volta       | Revalidar                                                                |
| [1484:68035](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-68035) | C02 · Perfil Consolidado — Saldos não selecionados · Glass                                    | Revalidar                                                                |
| [1484:68911](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-68911) | C08 · EC · Visão Consolidada — Carteira Strategy selecionada · Glass                          | Revalidar                                                                |
| [1484:69032](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69032) | C09 · MD · Dados Bancários — Adicionar Conta · Glass                                          | Revalidar                                                                |
| [1484:69073](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69073) | C15 · EC · Preferências — Moeda Primária Aberta · Glass                                       | Revalidar                                                                |
| [1484:69087](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69087) | C16 · EC · Preferências — Moeda Secundária Aberta · Glass                                     | Revalidar                                                                |
| [1484:69103](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69103) | C17 · EC · Preferências — Idioma Aberto · Glass                                               | Revalidar                                                                |
| [1484:69117](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69117) | C18 · EC · Preferências — Fuso Horário Aberto · Glass                                         | Revalidar                                                                |
| [1484:69131](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69131) | C19 · EC · Segurança da Conta — Gerenciamento de Login Expandido · Glass                      | Revalidar                                                                |
| [1484:69170](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69170) | C20 · EC · Documentação Pessoal — Recolhida · Glass                                           | Revalidar                                                                |
| [1484:69175](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69175) | C21 · EC · Contábil Fiscal — Recolhida · Glass                                                | Revalidar                                                                |
| [1484:69180](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69180) | C22 · EC · Plataforma — Expandida · Glass                                                     | Revalidar                                                                |
| [1484:69233](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69233) | C23 · EC · Contratos — Expandido · Glass                                                      | Revalidar                                                                |
| [1930:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1930-281)     | C24 · EC · Edição por seção — todos os estados · Glass                                        | Revalidar                                                                |
| [1968:310](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1968-310)     | C30 · EC · Dados Bancários — Banco com busca · Glass                                          | Revalidar                                                                |
| [1994:284](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1994-284)     | C32 · EC · Identificação e Contato — Em edição · Glass                                        | Revalidar                                                                |
| [1995:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1995-281)     | C33 · EC · Segurança da Conta — Em edição · Glass                                             | Revalidar                                                                |
| [1995:348](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1995-348)     | C35 · EC · Dados Bancários — Logos dos bancos · Glass                                         | Revalidar                                                                |
| [1932:282](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1932-282)     | C25 · EC · Cabeçalho — cliente novo · Glass                                                   | Revalidar                                                                |
| [1932:311](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1932-311)     | C26 · EC · Identificação e Contato — dados do cadastro pendentes · Glass                      | Revalidar                                                                |
| [1973:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1973-281)     | C31 · EC · Registro de Patrimônio — Sem bens registrados · Glass                              | Revalidar                                                                |
| [1932:387](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1932-387)     | C27 · EC · Documentação Pessoal — documento do cadastro aguardando aprovação · Glass          | Revalidar                                                                |
| [1933:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1933-281)     | C28 · MD · Reprovar documento · Glass                                                         | Revalidar                                                                |
| [2011:317](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2011-317)     | C08.1 · EC · Visão Consolidada — Carteira de Depósito selecionada · Glass                     | Revalidar                                                                |
| [2011:546](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2011-546)     | C08.2 · EC · Visão Consolidada — Patrimônio selecionado · Glass                               | Revalidar                                                                |
| [1933:300](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1933-300)     | C29 · EC · Visão Consolidada — carteiras zeradas, sem composição e sem lançamentos · Glass    | Revalidar                                                                |
| [1484:69299](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69299) | C10 · EC · Registro de Patrimônio — Imóvel Expandido · Glass                                  | Revalidar                                                                |
| [1484:69408](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69408) | C11 · Registro de Patrimônio — Editar Imóvel                                                  | Revalidar                                                                |
| [1484:69564](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69564) | C12 · Registro de Patrimônio — Editar Veículo                                                 | Revalidar                                                                |
| [1484:69651](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69651) | C13 · Registro de Patrimônio — Editar Consórcio                                               | Revalidar                                                                |
| [1484:69736](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69736) | C14 · Registro de Patrimônio — Editar Investimento                                            | Revalidar                                                                |
| [1557:2](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1557-2)         | C10.1 · Imóvel financiado expandido                                                           | Revalidar                                                                |
| [1559:71](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1559-71)       | C10.2 · Veículo expandido                                                                     | Revalidar                                                                |
| [1559:297](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1559-297)     | C10.3 · Consórcio contemplado expandido                                                       | Revalidar                                                                |
| [1560:216](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1560-216)     | C10.4 · Consórcio não contemplado expandido                                                   | Revalidar                                                                |
| [1560:383](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1560-383)     | C10.5 · Investimento expandido                                                                | Revalidar                                                                |
| [2053:284](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2053-284)     | C11.1 · Valor e situação financeira · não quitado (campo Restante visível)                    | Revalidar                                                                |
| [2072:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2072-281)     | C08.3 · EC · Visão Consolidada — Carteira Total selecionada · Glass                           | Revalidar                                                                |
| [2072:414](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2072-414)     | C08.4 · EC · Visão Consolidada — Nenhuma carteira selecionada · Glass                         | Revalidar                                                                |
| [2077:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2077-281)     | C11.2 · Identificação e valor · erros ao salvar (caixas no lugar)                             | Revalidar                                                                |
| [2095:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2095-281)     | C09.1 · MD · Dados Bancários — Adicionar Conta · preenchido, conta principal ativa            | Revalidar                                                                |
| [1484:69984](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69984) | F01 · Seleção de contratos · Cards / Lista + painéis temporários                              | Revalidar                                                                |
| [1484:69985](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-69985) | CT01 · PB · Seleção de contratos · Cards · DESIGN GLASS                                       | Busca, cards/lista e retorno testados localmente e no Admin publicado; revisão final pendente |
| [1484:70685](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-70685) | CT02 · SP · Seleção de contratos · Lista · DESIGN GLASS                                       | Busca, cards/lista e retorno testados localmente e no Admin publicado; revisão final pendente |
| [1484:71333](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-71333) | F02 · Criação de contrato · Tela única + painéis acionados                                    | Revalidar                                                                |
| [1484:71334](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-71334) | CT04 · SP · Criar novo contrato · Tela única completa · DESIGN GLASS                          | Revalidar                                                                |
| [1484:72006](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-72006) | CT05 · MD · Selecionar clientes para vincular · DESIGN GLASS                                  | Revalidar                                                                |
| [1484:72120](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-72120) | CT06 · MD · Adicionar ativo elegível · DESIGN GLASS                                           | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:72187](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-72187) | F03 · Contrato aberto · Componentes, estados e ações                                          | Revalidar                                                                |
| [1484:72188](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-72188) | CT07 · PB · Contrato aberto · Página base · DESIGN GLASS                                      | Revalidar                                                                |
| [1484:73154](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73154) | CT08 · CP · Clientes vinculados · Lista · DESIGN GLASS                                        | Tabela e alternância testadas em homologação; dados ausentes identificados |
| [1484:73324](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73324) | CT09 · MD · Adicionar cliente vinculado · DESIGN GLASS                                        | Visual/estados e busca/duplicidade publicados; escrita isolada, limites acima |
| [1484:73364](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73364) | CT10 · MD · Ver detalhes do cliente · DESIGN GLASS                                            | Modal e consulta cadastral testados em homologação; históricos/destino ainda sem integração |
| [1484:73521](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73521) | CT11 · CP · Motores e operações · Maximizado · DESIGN GLASS                                   | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:73658](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73658) | CT12 · MD · Adicionar operação intradiária · DESIGN GLASS                                     | Revalidar                                                                |
| [1484:73745](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73745) | CT13 · CP · Ativos do contrato · Maximizado · DESIGN GLASS                                    | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:73893](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-73893) | CT14 · PE · Ativos do contrato · Editar ativo / Excluir · DESIGN GLASS                        | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74090](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74090) | CT15 · CP · Dívidas vinculadas · Maximizado · DESIGN GLASS                                    | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74204](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74204) | CT16 · PE · Dívidas vinculadas · Modo edição · DESIGN GLASS                                   | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74335](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74335) | CT17 · MD · Adicionar dívida · DESIGN GLASS                                                   | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74524](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74524) | CT18 · MD · Ver detalhes da dívida · DESIGN GLASS                                             | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74680](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74680) | CT19 · MD · Editar dívida · DESIGN GLASS                                                      | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:74946](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-74946) | CT20 · PE · Documentos do contrato · Modo edição · DESIGN GLASS                               | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:75082](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-75082) | CT21 · CP · Performance histórica · Tabela · DESIGN GLASS                                     | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:75314](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-75314) | CT22 · PE · Performance histórica · Gráfico · DESIGN GLASS                                    | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [1484:75524](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-75524) | CT23 · MD · Performance histórica · Histórico completo · DESIGN GLASS                         | Implementado/revisado nesta rodada; testes e bloqueios detalhados acima |
| [2149:300](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2149-300)     | CT11.1 · EC · Resultado no fechamento — Motor Principal + Operações                           | Revalidar                                                                |
| [2157:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2157-281)     | CT11.2 · EC · Motor de Dividendos — Conectado (Aleatório)                                     | Revalidar                                                                |
| [2157:348](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2157-348)     | CT11.3 · EC · Motor de Dividendos — valor Fixo                                                | Revalidar                                                                |
| [1484:76064](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-76064) | F01 · Seleção de lógicas · Cards / Lista + painel temporário                                  | Revalidar                                                                |
| [1484:76065](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-76065) | LG01 · PB · Seleção de lógicas · Cards · TELA BASE · DESIGN GLASS                             | Preparado / revisão pendente                                             |
| [1484:76704](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-76704) | LG02 · SP · Seleção de lógicas · Lista · SUBPÁGINA · DESIGN GLASS                             | Preparado / revisão pendente                                             |
| [1484:77198](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77198) | LG03 · MT · Resumo executivo da lógica · Hover temporário · PAINEL ISOLADO · DESIGN GLASS     | Estado de catálogo implementado; resumo operacional depende da API                                             |
| [1484:77225](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77225) | LG01 · EC · Delta-Income em hover · Abrir · Editar · Vínculos · DESIGN GLASS                  | Preparado / revisão pendente                                             |
| [1484:77226](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77226) | EC01 · Card em hover · Abrir · Editar · Vínculos                                              | Preparado / revisão pendente                                             |
| [1484:77323](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77323) | LG04 · EC · Filtros abertos + Lista em hover · PAINEL DE ESTADOS SOLTO · DESIGN GLASS         | Preparado / revisão pendente                                             |
| [1484:77335](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77335) | DD01 · Status · Aberto                                                                        | Revalidar                                                                |
| [1484:77346](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77346) | DD02 · Vínculos · Aberto                                                                      | Revalidar                                                                |
| [1484:77353](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77353) | DD03 · Ordenação · Aberto                                                                     | Revalidar                                                                |
| [1484:77384](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77384) | EC03.1 · Motor ativo em hover · Pausar · Editar · Entrar                                      | Preparado / revisão pendente                                             |
| [1484:77407](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77407) | F02 · Criar e abrir lógica · Fluxos principais                                                | Revalidar                                                                |
| [1484:77408](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-77408) | LG04 · SP · Criar nova lógica · SUBPÁGINA · DESIGN GLASS                                      | Preparado / revisão pendente                                             |
| [1484:78227](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-78227) | LG05 · PB · Lógica aberta · TELA BASE · DESIGN GLASS                                          | Preparado / revisão pendente                                             |
| [1484:79229](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79229) | EC01 · Identidade configurada · ícone Distribuição + azul                                     | Preparado / revisão pendente                                             |
| [1484:79361](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79361) | EC02.1 · Preview · Alpha-2 Institucional                                                      | Preparado / revisão pendente                                             |
| [1484:79457](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79457) | EC02.2 · Preview · Delta-Green                                                                | Preparado / revisão pendente                                             |
| [1484:79553](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79553) | EC02.3 · Preview · Atlas-Orange                                                               | Preparado / revisão pendente                                             |
| [1484:79652](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79652) | EC03 · Frequência · data e hora preenchidas                                                   | Preparado / revisão pendente                                             |
| [1484:79712](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79712) | EC04.1 · Probabilidade · 50/50 · soma válida                                                  | Preparado / revisão pendente                                             |
| [1484:79755](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79755) | EC04.2 · Probabilidade · 60/50 · soma 110% inválida                                           | Preparado / revisão pendente                                             |
| [1484:79802](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79802) | EC05.1 · Zona de amortecimento · desativada                                                   | Preparado / revisão pendente                                             |
| [1484:79819](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79819) | EC05.2 · Zona de amortecimento · ativada + tabela                                             | Preparado / revisão pendente                                             |
| [1484:79883](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79883) | EC06 · Limites operacionais · regra contornada                                                | Preparado / revisão pendente                                             |
| [1484:79941](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79941) | EC07 · Fechamento soberano · separador                                                        | Preparado / revisão pendente                                             |
| [1484:79981](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79981) | F03 · Edição da lógica · Simulações + validação                                               | Revalidar                                                                |
| [1484:79982](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-79982) | LG06 · PE · Modo de edição · Simulação abaixo · TELA BASE DE EDIÇÃO · DESIGN GLASS            | Preparado / revisão pendente                                             |
| [1484:82147](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-82147) | LG07 · EC · Simulação ao lado · PAINEL DE ESTADOS DO COMPONENTE · DESIGN GLASS                | Preparado / revisão pendente                                             |
| [1484:83473](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-83473) | LG08 · MD · Validação da lógica · MODAL ISOLADO · DESIGN GLASS                                | Composto; estados testados — ver complemento 14/11 |
| [1484:83539](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-83539) | F04 · Estados complementares do motor · Histórico completo + configuração minimizada          | Revalidar                                                                |
| [1484:83540](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-83540) | LG09 · SP · Histórico completo do motor · SUBPÁGINA · DESIGN GLASS                            | Tabela LG09 concluída/publicada; integração operacional pendente |
| [1484:85344](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-85344) | LG11 · EC · Configuração do motor minimizada · PAINEL DE ESTADOS DO COMPONENTE · DESIGN GLASS | LG11 e transições publicados/testados; configuração operacional depende da API |
| [1484:85374](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-85374) | F01 · Extrato + Solicitações + Nova transação                                                 | Revalidar                                                                |
| [1484:85378](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-85378) | P01 · V01 · Transações · Extrato global + Solicitações                                        | Revalidar                                                                |
| [1484:86271](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86271) | MD01 · Nova transação · Seleção de tipo                                                       | Revalidar                                                                |
| [1484:86319](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86319) | MD02 · Nova transação · Depósito                                                              | Revalidar                                                                |
| [1484:86383](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86383) | MD03 · Nova transação · Saque                                                                 | Revalidar                                                                |
| [1484:86476](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86476) | MD04 · Nova transação · Transferência                                                         | Revalidar                                                                |
| [1484:86593](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86593) | MD06 · Solicitação pendente · Detalhes + ações disponíveis                                    | Revalidar                                                                |
| [1484:86740](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86740) | EC01 · Painel de estados do componente · Solicitação pendente                                 | Preparado / revisão pendente                                             |
| [1484:86742](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86742) | E03 · Painel de estados do componente · Validar                                               | Revalidar                                                                |
| [1484:86762](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86762) | E04 · Painel de estados do componente · Aprovar                                               | Revalidar                                                                |
| [1484:86782](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86782) | E05 · Painel de estados do componente · Rejeitar                                              | Revalidar                                                                |
| [1484:86802](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86802) | E06 · Painel de estados do componente · Executar operação                                     | Revalidar                                                                |
| [1484:86822](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86822) | E07 · Painel de estados do componente · Solicitar correção                                    | Revalidar                                                                |
| [1484:86842](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86842) | E08 · Painel de estados do componente · Anexar documento                                      | Revalidar                                                                |
| [1484:86864](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86864) | E09 · Painel de estados do componente · Ver comprovante                                       | Revalidar                                                                |
| [1484:86887](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86887) | E10 · Painel de estados do componente · Adicionar observação                                  | Revalidar                                                                |
| [1484:86903](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86903) | A01 · clique                                                                                  | Revalidar                                                                |
| [1484:86906](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86906) | A01 · escolher tipo                                                                           | Revalidar                                                                |
| [2224:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2224-281)     | A02 · abrir detalhe · saída do P01                                                            | Revalidar                                                                |
| [1484:86909](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86909) | A02 · abrir detalhe                                                                           | Revalidar                                                                |
| [1484:86912](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86912) | A02 · ação interna → EC01                                                                     | Revalidar                                                                |
| [2027:301](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2027-301)     | MD04.1 · Nova transação · Transferência · Moeda aberta (todas as moedas)                      | Revalidar                                                                |
| [2152:329](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2152-329)     | MD04.2 · Nova transação · Transferência · Para outro cliente                                  | Revalidar                                                                |
| [2153:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2153-281)     | MD07 · Confirmar com senha · Executar, aprovar, reprovar ou cancelar transação                | Revalidar                                                                |
| [2160:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2160-281)     | MD06.1 · Depósito processado · Detalhes + Corrigir                                            | Revalidar                                                                |
| [2161:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2161-281)     | P01.1 · EC · Extrato · Depósito corrigido                                                     | Revalidar                                                                |
| [2179:281](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2179-281)     | MD08 · Corrigir depósito · Dados certos e motivo (depois MD07 · senha)                        | Revalidar                                                                |
| [2179:355](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2179-355)     | MD06.2 · Solicitação pendente · Editar dados                                                  | Revalidar                                                                |
| [2187:404](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2187-404)     | MD06.3 · Transação corrigida · Detalhes com a transação original                              | Revalidar                                                                |
| [2282:289](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2282-289)     | E11 · Painel de estados do componente · Cancelar                                              | Revalidar                                                                |
| [1484:86915](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86915) | F02 · Carteiras · Cards ↔ Lista                                                               | Revalidar                                                                |
| [1484:86920](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-86920) | V02 · Carteira Total · Cards                                                                  | Revalidar                                                                |
| [1484:87711](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-87711) | V05 · Carteira de Depósito · Lista                                                            | Revalidar                                                                |
| [1484:88127](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-88127) | V06 · Carteira de Patrimônio · Cards                                                          | Revalidar                                                                |
| [1484:88727](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-88727) | V07 · Carteira de Patrimônio · Lista                                                          | Revalidar                                                                |
| [1484:89118](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89118) | A03 · Cards ↔ Lista · Carteira Total                                                          | Revalidar                                                                |
| [1484:89121](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89121) | A04 · Cards ↔ Lista · Carteira de Depósito                                                    | Revalidar                                                                |
| [1484:89124](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89124) | A05 · Cards ↔ Lista · Carteira de Patrimônio                                                  | Revalidar                                                                |
| [1484:89127](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89127) | V03 · Carteira Total · Lista                                                                  | Revalidar                                                                |
| [1484:89697](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89697) | V04 · Carteira de Depósito · Cards                                                            | Revalidar                                                                |
| [1484:89694](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-89694) | F03 · Carteiras Strategy (contratos vinculados) · Cards + Lista + expansão                    | Revalidar                                                                |
| [1484:90218](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-90218) | V09 · Carteira Strategy · Lista · Recolhido                                                   | Revalidar                                                                |
| [1484:90787](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-90787) | V08 · Carteira Strategy · Cards · Recolhido                                                   | Revalidar                                                                |
| [1484:91469](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-91469) | E01 · Carteira Strategy · Cards · Expandido                                                   | Revalidar                                                                |
| [1484:92301](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-92301) | A06 · Cards · Recolher ↔ Expandir                                                             | Revalidar                                                                |
| [1484:92532](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-92532) | F01 · Operações de crédito · Lista / Cards / Kanban                                           | Revalidar                                                                |
| [1484:92533](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-92533) | CR01 · PB · Operações de crédito · Lista · TELA BASE · DESIGN GLASS                           | Preparado / revisão pendente                                             |
| [1484:92907](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-92907) | CR02 · SP · Operações de crédito · Cards · SUBPÁGINA · DESIGN GLASS                           | Preparado / revisão pendente                                             |
| [1484:93351](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93351) | CR03 · SP · Operações de crédito · Kanban · SUBPÁGINA · DESIGN GLASS                          | Preparado / revisão pendente                                             |
| [1484:93771](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93771) | EC01 · Painel de estados do componente · Visualização Lista / Cards / Kanban                  | Preparado / revisão pendente                                             |
| [1484:93774](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93774) | EC01.1 · Lista selecionada                                                                    | Preparado / revisão pendente                                             |
| [1484:93795](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93795) | EC01.2 · Cards selecionado                                                                    | Preparado / revisão pendente                                             |
| [1484:93816](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93816) | EC01.3 · Kanban selecionado                                                                   | Preparado / revisão pendente                                             |
| [1484:93837](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93837) | F02 · Nova operação · Etapas + detalhes                                                       | Revalidar                                                                |
| [1484:93838](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93838) | CR04 · MD · Nova operação · Seleção do tipo · ESTADO · DESIGN GLASS                           | Preparado / revisão pendente                                             |
| [1484:93952](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-93952) | CR05 · MD · Nova operação · Seleção do cliente · ESTADO · DESIGN GLASS                        | Preparado / revisão pendente                                             |
| [1484:94059](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94059) | CR06 · MD · Detalhes da operação · MODAL FIXO · DESIGN GLASS                                  | Composto; estados testados — ver complemento 14/11 |
| [1484:94631](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94631) | EC02 · Painel de estados do componente · Nova operação                                        | Preparado / revisão pendente                                             |
| [1484:94636](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94636) | EC02.S01 · Etapa padrão                                                                       | Preparado / revisão pendente                                             |
| [1484:94638](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94638) | EC02.S02 · Etapa atual                                                                        | Preparado / revisão pendente                                             |
| [1484:94643](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94643) | EC02.S03 · Tipo de operação                                                                   | Preparado / revisão pendente                                             |
| [1484:94653](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94653) | EC02.S04 · Cliente selecionável                                                               | Preparado / revisão pendente                                             |
| [1484:94673](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94673) | EC02 · CONEXÃO · Fluxo → estados                                                              | Preparado / revisão pendente                                             |
| [1484:94676](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94676) | F03 · Parceiros de crédito · Lista, criação e detalhes                                        | Revalidar                                                                |
| [1484:94677](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-94677) | CR07 · PB · Parceiros de crédito · Lista · TELA BASE · DESIGN GLASS                           | Preparado / revisão pendente                                             |
| [1484:95173](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95173) | CR08 · MD · Novo parceiro · Etapa 1 · ESTADO · DESIGN GLASS                                   | Preparado / revisão pendente                                             |
| [1484:95475](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95475) | CR09 · MD · Novo parceiro · Etapa 2 · ESTADO · DESIGN GLASS                                   | Preparado / revisão pendente                                             |
| [1484:95847](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95847) | CR10 · MD · Detalhes do parceiro · MODAL FIXO · DESIGN GLASS                                  | Preparado / revisão pendente                                             |
| [1484:95957](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95957) | EC03 · Painel de estados do componente · Parceiros                                            | Preparado / revisão pendente                                             |
| [1484:95962](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95962) | EC03.S01 · Aba selecionada                                                                    | Preparado / revisão pendente                                             |
| [1484:95964](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95964) | EC03.S02 · Aba padrão                                                                         | Preparado / revisão pendente                                             |
| [1484:95970](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95970) | EC03.S03 · Status aceito                                                                      | Preparado / revisão pendente                                             |
| [1484:95972](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95972) | EC03.S04 · Status em análise                                                                  | Preparado / revisão pendente                                             |
| [1484:95974](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95974) | EC03.S05 · Status não aceito                                                                  | Preparado / revisão pendente                                             |
| [1484:95984](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95984) | EC03.S08 · Linha de opção                                                                     | Preparado / revisão pendente                                             |
| [1484:95999](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-95999) | EC03 · CONEXÃO · Fluxo → estados                                                              | Preparado / revisão pendente                                             |
| [1484:96066](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96066) | F01 · Comunicação · Conteúdos / Redatores                                                     | Revalidar                                                                |
| [1484:96067](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96067) | CO01 · PB · Comunicação · Conteúdos · TELA BASE · DESIGN GLASS                                | Preparado / revisão pendente                                             |
| [1484:96418](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96418) | CO02 · SP · Comunicação · Redatores · ESTADO BASE · DESIGN GLASS                              | Cards preparados/testados isoladamente; API de redatores pendente |
| [1484:96662](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96662) | EC01 · Painel de estados do componente · Comunicação                                          | Estados disponíveis publicados/testados — ver complemento Comunicação 14/11 |
| [1484:96691](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96691) | F02 · Modais acionados · Tipo / Redator / Prévia                                              | Revalidar                                                                |
| [1484:96692](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96692) | CO03 · MD · Criar conteúdo · Escolher tipo · MODAL FIXO · DESIGN GLASS                        | Preparado / revisão pendente                                             |
| [1484:96758](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96758) | CO07 · MD · Criar novo redator · MODAL FIXO · ALTURA NATURAL · DESIGN GLASS                   | Estados disponíveis publicados/testados — ver complemento Comunicação 14/11 |
| [1484:96838](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96838) | CO08 · MD · Prévia · Visualização do cliente · MODAL FIXO · DESIGN GLASS                      | Preparado / revisão pendente                                             |
| [1484:96881](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96881) | F03 · Editores de conteúdo · Insight / Comunicado / Relatório                                 | Revalidar                                                                |
| [1484:96882](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-96882) | CO04 · SP · Criar Insight · EDITOR BASE · DESIGN GLASS                                        | Preparado / revisão pendente                                             |
| [1484:97193](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-97193) | CO05 · SP · Criar Comunicado Oficial · VARIAÇÃO EDITORIAL · DESIGN GLASS                      | Preparado / revisão pendente                                             |
| [1484:97530](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-97530) | CO06 · SP · Criar Relatório · EDITOR ESPECÍFICO · DESIGN GLASS                                | Preparado / revisão pendente                                             |
| [1484:97906](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1484-97906) | EC02 · Painel de estados do componente · Editor                                               | Estados disponíveis publicados/testados — ver complemento Comunicação 14/11 |
| [2255:282](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2255-282)     | F01 · Configurações › Auditoria · Consulta geral                                              | Revalidar                                                                |
| [2255:283](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=2255-283)     | AU01 · SP · Configurações › Auditoria · Consulta geral                                        | Revalidar                                                                |

### Área do Cliente

| Frame                                                                              | Desenho                                                                      | Situação nesta revisão |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| [1:28279](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-28279)     | [UI] FLUXO CARTEIRA - SAQUE - Passo 1                                        | Revalidar              |
| [251:28194](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=251-28194) | [UI] FLUXO CARTEIRA - SAQUE - Passo 1 · Conta bancária aberta                | Revalidar              |
| [1:28349](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-28349)     | [UI] FLUXO CARTEIRA - SAQUE - Passo 3                                        | Revalidar              |
| [1:28421](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-28421)     | [UI] FLUXO CARTEIRA - SAQUE - Sucesso                                        | Revalidar              |
| [1:28491](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-28491)     | [UI] FLUXO CARTEIRA - SAQUE - Passo 2                                        | Revalidar              |
| [1:29678](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-29678)     | [UI] HOME - VERSÃO PADRÃO                                                    | Revalidar              |
| [1:31985](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-31985)     | [UI] HOME - CONTA NOVA - Sem depósito                                        | Revalidar              |
| [1:32335](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-32335)     | [EC] HOME · Conta nova · Estados do gráfico e do período                     | Revalidar              |
| [1:32479](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-32479)     | [UI] CONTRATOS - GERAL                                                       | Revalidar              |
| [1:34294](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-34294)     | [UI] CONTRATOS - OFERTA_CONTRATO - 1                                         | Revalidar              |
| [1:36148](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-36148)     | [UI] CONTRATOS - OFERTA_CONTRATO - 2                                         | Revalidar              |
| [1:37994](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-37994)     | [UI] CONTRATOS - OFERTA_CONTRATO - 3                                         | Revalidar              |
| [1:39818](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-39818)     | [UI] CONTRATOS - OFERTA_CONTRATO - 4                                         | Revalidar              |
| [1:41796](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-41796)     | [UI] CONTRATOS - OFERTA_CONTRATO - 5A                                        | Revalidar              |
| [1:43678](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-43678)     | [UI] CONTRATOS - OFERTA_CONTRATO - 5A                                        | Revalidar              |
| [1:45691](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-45691)     | [UI] CONTRATOS - PAG ESPECIFICA                                              | Revalidar              |
| [1:46764](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-46764)     | [UI] CONTRATOS - PAG ESPECIFICA                                              | Revalidar              |
| [1:48631](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-48631)     | [UI] CONTRATOS - PAG ESPECIFICA                                              | Revalidar              |
| [1:50141](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-50141)     | [UI] CONTRATOS - PAG ESPECIFICA                                              | Revalidar              |
| [211:28821](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=211-28821) | [EC] CONTRATOS - PAG ESPECIFICA · Operações · sem registro                   | Revalidar              |
| [1:50557](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-50557)     | [UI] ALAVANCAGEM                                                             | Revalidar              |
| [1:50683](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-50683)     | [UI] ALAVANCAGEM - BLOQUEADO                                                 | Revalidar              |
| [1:50860](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-50860)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:50960](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-50960)     | [UI] ALAVANCAGEM - PÁG ALAVANCAGEM - GARANTIA IMÓVEL                         | Revalidar              |
| [1:51347](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-51347)     | [UI] ALAVANCAGEM - PÁG ALAVANCAGEM - GARANTIA AUTOMÓVEL                      | Revalidar              |
| [1:51728](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-51728)     | [UI] ALAVANCAGEM - PÁG ALAVANCAGEM - CONSÓRCIO AUTOMÓVEL                     | Revalidar              |
| [1:52034](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52034)     | [UI] ALAVANCAGEM - PÁG ALAVANCAGEM - COLATERAL                               | Revalidar              |
| [1:52217](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52217)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:52330](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52330)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:52424](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52424)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:52520](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52520)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:52616](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52616)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:52719](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52719)     | OFERTAS CRÉDITO PRÉ APROVADO                                                 | Revalidar              |
| [1:52928](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-52928)     | OFERTAS CRÉDITO PRÉ APROVADO                                                 | Revalidar              |
| [1:53140](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53140)     | OFERTAS FINAIS CRÉDITO                                                       | Revalidar              |
| [1:53312](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53312)     | OFERTAS FINAIS CRÉDITO                                                       | Revalidar              |
| [1:53568](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53568)     | OFERTAS FINAIS CRÉDITO                                                       | Revalidar              |
| [1:53739](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53739)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:53839](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53839)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:53960](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-53960)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54054](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54054)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54146](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54146)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54266](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54266)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54430](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54430)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54617](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54617)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:54810](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-54810)     | OFERTAS CONSÓRCIO - LISTA                                                    | Revalidar              |
| [1:55081](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55081)     | OFERTAS CONSÓRCIO - CARDS                                                    | Revalidar              |
| [1:55357](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55357)     | [UI] FLUXO - SOLICITAR CONSÓRCIO                                             | Revalidar              |
| [1:55448](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55448)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:55539](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55539)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:55637](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55637)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:55709](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55709)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:55832](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55832)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:55919](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-55919)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:56020](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-56020)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:56115](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-56115)     | [UI] FLUXO - SOLICITAR EMPRÉSTIMO -                                          | Revalidar              |
| [1:56231](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-56231)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS ATIVAS                       | Revalidar              |
| [1:57431](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-57431)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS ATIVAS                       | Revalidar              |
| [1:58679](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-58679)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS ATIVAS                       | Revalidar              |
| [1:59912](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-59912)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS ATIVAS                       | Revalidar              |
| [1:61125](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-61125)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS EM ANÁLISE                   | Revalidar              |
| [1:62011](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-62011)     | [UI] ALAVANCAGEM - MINHAS ALAVANCAGENS - STATUS QUITADOS                     | Revalidar              |
| [1:64153](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-64153)     | [UI] COMUNICAÇÃO (List View)                                                 | Revalidar              |
| [1:64344](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-64344)     | [UI] COMUNICAÇÃO (Card View)                                                 | Revalidar              |
| [1:64591](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-64591)     | [UI] COMUNICAÇÃO - COMUNICADO S.A - PÁG ESPECIFICA                           | Revalidar              |
| [1:64751](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-64751)     | [UI] COMUNICAÇÃO - INSIGHTS - PÁG ESPECIFICA                                 | Revalidar              |
| [1:65313](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-65313)     | [UI] COMUNICAÇÃO - RELATÓRIOS - PAG ESPECIFICA                               | Revalidar              |
| [1:65403](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-65403)     | [UI] COMUNICAÇÃO - RELATÓRIOS - PAG ESPECIFICA                               | Revalidar              |
| [1:65504](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-65504)     | [UI] COMUNICAÇÃO - RELATÓRIOS - PAG ESPECIFICA - relatório 2 pags folheado   | Revalidar              |
| [10:26031](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=10-26031)   | [UI] COMUNICAÇÃO - Sem conteúdo                                              | Revalidar              |
| [208:27698](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=208-27698) | [UI] COMUNICAÇÃO - BLOQUEADO (Nível 2)                                       | Revalidar              |
| [1:65981](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-65981)     | [UI] PERFIL - Dados Pessoais - Red Blue                                      | Revalidar              |
| [1:66213](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-66213)     | [UI] PERFIL - Dados Pessoais - Red Blue                                      | Revalidar              |
| [1:66443](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-66443)     | [UI] PERFIL - Contas Bancárias - Red Blue                                    | Revalidar              |
| [1:66549](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-66549)     | [UI] PERFIL - Patrimônios - Red Blue                                         | Revalidar              |
| [1:66813](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-66813)     | [UI] PERFIL - Patrimônios - Red Blue                                         | Revalidar              |
| [1:67143](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-67143)     | [UI] PERFIL - Contas Bancárias - Red Blue                                    | Revalidar              |
| [1:67249](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-67249)     | [UI] PERFIL - Documentação - Red Blue                                        | Revalidar              |
| [1:67951](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-67951)     | [UI] PERFIL - Contratos e Termos - Red Blue                                  | Revalidar              |
| [1:68090](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-68090)     | [UI] PERFIL - Pág Resumo - Dados Pessoais                                    | Revalidar              |
| [1:68461](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-68461)     | [UI] HOME - VERSÃO PADRÃO                                                    | Revalidar              |
| [1:68794](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-68794)     | [UI] HOME - VERSÃO PADRÃO                                                    | Revalidar              |
| [1:69127](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-69127)     | [UI] CONTRATOS - GERAL                                                       | Revalidar              |
| [1:70897](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-70897)     | [UI] CONTRATOS - GERAL                                                       | Revalidar              |
| [1:72668](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-72668)     | [UI] ALAVANCAGEM                                                             | Revalidar              |
| [1:72787](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-72787)     | [UI] ALAVANCAGEM                                                             | Revalidar              |
| [1:72906](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-72906)     | [UI] COMUNICAÇÃO (List View)                                                 | Revalidar              |
| [1:73097](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-73097)     | [UI] COMUNICAÇÃO (List View)                                                 | Revalidar              |
| [1:73288](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-73288)     | [UI] PERFIL - Pág Resumo - Dados Pessoais                                    | Revalidar              |
| [1:73602](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=1-73602)     | [UI] PERFIL - Pág Resumo - Dados Pessoais                                    | Revalidar              |
| [163:27273](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=163-27273) | [UI] PERFIL - Pág Resumo - Dados Pessoais · Moeda Primária aberta (dropdown) | Revalidar              |
| [4:25438](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=4-25438)     | [UI] LOGIN                                                                   | Revalidar              |
| [4:25513](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=4-25513)     | [UI] CADASTRO - 1 Criar conta                                                | Revalidar              |
| [4:25620](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=4-25620)     | [UI] CADASTRO - 2 Confirmar e-mail e celular                                 | Revalidar              |
| [6:25562](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=6-25562)     | [UI] CADASTRO - 3 Dados pessoais                                             | Revalidar              |
| [9:25789](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=9-25789)     | [UI] CADASTRO - 4 Atividade trabalhista                                      | Revalidar              |
| [9:25883](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=9-25883)     | [UI] CADASTRO - 6 Contatos de confiança                                      | Revalidar              |
| [9:25964](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=9-25964)     | [UI] CADASTRO - 7 Revisão e envio                                            | Revalidar              |
| [9:26067](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=9-26067)     | [UI] CADASTRO - Enviado para análise                                         | Revalidar              |
| [9:26096](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=9-26096)     | [UI] PERFIL - Dados Pessoais - Pendente                                      | Revalidar              |
| [6:25690](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=6-25690)     | [UI] CADASTRO - 5 Documento e endereço - Brasil                              | Revalidar              |
| [37:27142](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27142)   | [UI] CADASTRO - 5 Documento e endereço - Estados Unidos e Canadá             | Revalidar              |
| [37:27262](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27262)   | [UI] CADASTRO - 5 Documento e endereço - América do Sul (Argentina)          | Revalidar              |
| [37:27382](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27382)   | [UI] CADASTRO - 5 Documento e endereço - Japão                               | Revalidar              |
| [37:27502](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27502)   | [UI] CADASTRO - 5 Documento e endereço - China                               | Revalidar              |
| [37:27622](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27622)   | [UI] CADASTRO - 5 Documento e endereço - Europa (Portugal)                   | Revalidar              |
| [37:27742](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27742)   | [UI] CADASTRO - 5 Documento e endereço - África (África do Sul)              | Revalidar              |
| [37:27862](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=37-27862)   | [UI] CADASTRO - 5 Documento e endereço - Austrália                           | Revalidar              |
| [121:27090](https://www.figma.com/design/BaDXlWpxbIoY4azOaQnXgv?node-id=121-27090) | [EC] CADASTRO - 1 Criar conta · E-mail já confirmado (aviso abaixo do campo) | Revalidar              |

## Evidência desta rodada

- Captura do CT10 no Admin publicado: `C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/admin-ct10-publicado.jpg`.
- Validações do motor também rejeitam índice inicial infinito e datas inexistentes; nenhum cálculo de prévia assume dados operacionais do servidor.
- `git diff --check` dos arquivos desta revisão aprovado. O snapshot Swagger preexistente contém whitespace e não foi incluído nos commits.

## Evidências anteriores

- [Revisão consolidada anterior](QA-2026-11-12-REVISAO-CONSOLIDADA-FRONT.md).
- [CT04/CT07](QA-2026-11-13-CONTRATOS-CT04-CT07.md).
- [Pendências de backend anteriores](PENDENCIAS-BACKEND-QA.md): retestar antes de considerar resolvidas.

## Fechamento das publicações desta rodada

- Código publicado: c32f5a5 (Contratos), 1b3ccf6 e 5f47719 (estados de Lógicas). Deploys concluídos com sucesso.
- Checks finais: lint, build e 285 testes locais passaram. Oito desses testes pertencem ao estudo de preferências preexistente, que não foi incluído nos commits; os 277 testes versionados também passaram.
- Contraste publicado: cabeçalhos e células das tabelas de aportes/alterações confirmados brancos; screenshot desktop admin-contratos-contraste-publicado.jpg e screenshot mobile admin-historico-contraste-publicado.jpg.
- Lógicas publicado: 22 indicadores no Motor; comparação em Tabela retorna estado próprio indisponível, sem colunas do Motor; tabelas Atual/Simulada mantêm 22 indicadores; Cancelar encerra a edição sem escrita. Screenshot admin-logicas-simulacao-publicada.jpg.
- Capturas em C:/Users/jlbnu/.codex/visualizations/2026/11/13/01a1d51a-ae33-79d1-87aa-854dbd4884dc/.
- Sessão exclusiva usada pelos scripts de teste encerrada pela API (204); arquivo temporário de credenciais removido. Sessões do usuário no navegador preservadas.
- A entrega ampla de todos os frames NÃO está concluída. Os itens abertos na seção Ainda é trabalho de frontend continuam abertos; o limite de consultas do Figma impediu concluir a obtenção dos desenhos restantes. Não encaminhar essas lacunas como falhas do backend.
