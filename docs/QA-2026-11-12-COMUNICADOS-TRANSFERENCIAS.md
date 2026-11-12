# Integração de Comunicados e transferência por ID Strategy — 12/11/2026

## Resultado e escopo

Integração na Área do Cliente, reutilizando a Home, Comunicação, detalhe e modal de transferência. Referências Figma BaDXlWpxbIoY4azOaQnXgv: 1:64153 (lista), 1:64591 (detalhe) e 209:27935 (outro cliente). Sem novos campos ou ações; dados ausentes não são preenchidos com exemplos do desenho.

## Checklist de implementação e testes

- [x] Consultar comunicados pela API, com paginação, categoria, período e somente não lidos; apresentar loading, erro, bloqueio de acesso, vazio e retry.
- [x] Reutilizar lista/card, abas e prévias existentes da Home. Contador de não lidos vem de unreadCount.
- [x] Abrir detalhe por ID real, sem JSON fake. Renderizar título, resumo, texto, código e publicação; texto não executa HTML recebido.
- [x] Registrar leitura somente depois de carregar o detalhe; leitura já registrada não é reenviada. Falha no recibo preserva o conteúdo e permite retry.
- [x] Impedir resposta de outra sessão/tela de atualizar a consulta ou iniciar recibo de leitura.
- [x] Seletor Minhas carteiras / Outro cliente; consulta automática do ID e nome abreviado retornado. Alterar ID invalida o nome anterior imediatamente.
- [x] Carteiras Free/Applied e moeda identificadas pela API, sem destino em contrato, sem customerId no payload do cliente.
- [x] Validar destinatário, moeda, saldo disponível, valor positivo/duas casas e senha. Resumo e prazo variam por origem/destino.
- [x] Escrita com autenticação e idempotência existentes. Um clique duplo envia uma requisição; retry de resposta ambígua conserva a chave; sucesso encerra a intenção. Senha não fica em storage, logs nem chave de cache.
- [x] Tratar códigos de destinatário inexistente, própria conta e senha obrigatória/incorreta/não configurada; não anunciar sucesso após 409.
- [x] Testes de serviço e componente: respostas fora de ordem, fechamento, falha de leitura, troca de sessão, clique duplo e limpeza da senha.
- [x] Consulta real de destinatário: Éric → Cláudio e Client → Cláudio = 200, nome abreviado; ID desconhecido = 404 transaction.recipient_not_found; próprio ID do Cláudio = 400 transaction.same_client.
- [x] Teste real de transferência: Éric → Cláudio, BRL 1 fictício, senha de login válida. API recusou com 409 transaction.withdrawal_password_not_set. Nenhuma transferência concluída nesse teste; não foi cadastrada outra senha para contornar a regra aprovada.
- [x] Comunicado fictício criado e publicado pela API administrativa, direcionado somente à conta Client; registro mantido para reteste posterior. Listar, detalhar e registrar leitura pela API do cliente retornaram 403 DocumentLevelInsufficient nas três contas de teste.
- [ ] Sucesso integrado de transferência: bloqueado pela confirmação de senha da API, conforme tabela abaixo.
- [ ] Sucesso integrado de listagem/detalhe/recibo de Comunicado: falta conta de teste no nível 2. Todos os 14 cards consultados retornaram nível 0; Éric e Cláudio estão sem celular confirmado.
- [x] Revisão no Chromium isolado em Linux, após a interrupção da ferramenta Windows. Verificados local e homologação em 1440 × 1000 e 390 × 844, sem overflow horizontal nos cenários testados. Ações por ID real e bloqueios reais foram testados com Éric e Cláudio; conteúdo, recibo e transferência concluída usam respostas controladas explicitamente identificadas abaixo.
- [x] Runtime final **ef1b6e5** publicado e ativado em https://hml.strategyanalytics.com.br. Pipeline [43238570009](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43238570009) aprovada (auditoria de dependências, lint, testes, build, upload e ativação). Revisão de navegador repetida nessa versão: **26 verificações aprovadas com Éric e 26 com Cláudio**, mais três cenários controlados de carteira vazia, falha e recuperação. Integração inicial 7083404; refinamentos visuais 0156c4f/978c324, período 57eab8b e correção do estado sem carteira ef1b6e5.

Verificações de código: npm run lint e npm run build aprovados; 342 testes aprovados (17 novos). git diff --check das alterações desta entrega aprovado; PRODUCT.md possui whitespace anterior fora do escopo. Detector mecânico apontou apenas cores/tamanhos que constam explicitamente no modal Figma (azul #2cb7ff e rótulos 13/8 px). Revisão visual também executada nesta rodada; fonte/layout/tema globais existentes foram preservados. Os dados de autor, capa e anexos ausentes na API não foram substituídos por exemplos visuais.

## Pendências reais da API

| Item | Evidência e ação necessária |
| --- | --- |
| Senha de confirmação | Regra confirmada pelo Jorge: usar a própria senha de login e auditar a confirmação. POST /client/transactions/transfers com essa senha válida retorna 409 transaction.withdrawal_password_not_set na conta do Éric. Alinhar a validação do servidor; o front preserva o campo do Figma e trata a recusa. |
| Categorias e grupos de Comunicação | API aceita Institutional, Operational, Financial, Regulatory e Other. O desenho separa Comunicados S.A, Insights Relevantes e Relatórios Econômicos. Falta contrato/mapeamento aprovado para separar esses três tipos. O front não transforma Financial em relatório nem Institutional em insight; os dois grupos sem contrato ficam indisponíveis. O filtro já existente usa as categorias reais. |
| Metadados e filtros de publicação | ClientAnnouncementResponse não fornece imagem/capa, autor/perfil do autor, versão, índice ou anexos do desenho. O filtro por autor permanece desabilitado porque a resposta não identifica o autor. O filtro Publicado em funciona no front: períodos existentes de 7/30/365 dias, consulta de todas as páginas antes de filtrar, deduplicação por ID e paginação do resultado filtrado. Falha em uma página resulta em erro da seção, sem apresentar uma coleção incompleta. Metadados ausentes não são inventados. Confirmar quais dados do Figma a API entregará. |

## Massa de homologação e verificações ainda pendentes

O 403 de Comunicados das contas abaixo é uma condição de acesso reproduzida, não um defeito comprovado do servidor. É necessário disponibilizar/confirmar uma conta no nível 2 (e-mail e celular confirmados + documentos conforme regra oficial) para validar leitura bem-sucedida. Não foram enviados SMS nem alterados níveis artificialmente.

Os testes automatizados usam respostas controladas para sucesso, vazio, falha e concorrência. Os cenários controlados foram executados também no navegador da versão publicada; eles não substituem o sucesso integrado impedido pelo nível ou pela senha. As outras entregas do backend (Admin, empréstimos, auditoria, PTAX e correção de depósito) não estão homologadas por esta rodada.

## Evidências de navegador

Os arquivos com `controlled` no nome usam respostas interceptadas apenas no navegador isolado. Não são publicações lidas nem transferências executadas pela API. O teste de sucesso de transferência verificou fechamento do modal, notificação e recarga das carteiras reais; o teste de falha verificou limpeza da senha, manutenção dos campos e ausência de mensagem de sucesso. Nenhum saldo foi movimentado por esses cenários controlados.

- [Carteira vazia, falha e recuperação — 3 verificações controladas](evidence/qa-2026-11-12/wallet-states-results.json).
- [Resultado Éric — 26 verificações](evidence/qa-2026-11-12/hml-results.json) e [Cláudio — 26 verificações](evidence/qa-2026-11-12/hml-claudio-results.json).
- [Respostas reais da API — três contas](evidence/qa-2026-11-12/api-results.json).
- [Transferência real recusada com 409](evidence/qa-2026-11-12/hml-transfer-409.png) e [modal mobile](evidence/qa-2026-11-12/hml-transfer-mobile.png).
- [Comunicados — bloqueio real de nível](evidence/qa-2026-11-12/hml-communication-real-403.png).
- [Lista controlada](evidence/qa-2026-11-12/hml-communication-controlled-list.png), [grade controlada](evidence/qa-2026-11-12/hml-communication-controlled-grid.png), [detalhe controlado](evidence/qa-2026-11-12/hml-communication-controlled-detail.png) e [mobile controlado](evidence/qa-2026-11-12/hml-communication-controlled-mobile.png).

Cobertura no navegador: login, alternância entre destinos, consulta de nome, ID próprio/inexistente, saldo insuficiente, sete moedas com indisponíveis desabilitadas, senha limpa após recusa, 409 real, senha incorreta controlada, sucesso controlado com recarga, layout mobile, bloqueio real de Comunicados, lista/card, paginação no servidor, contador de não lidos, conteúdo seguro como texto, falha/retry do recibo, período sobre a coleção completa, filtro de não lidos, vazio, limpeza de filtros e ausência de erros JavaScript nos cenários concluídos.

As cores e a tipografia do tema da conta foram preservadas; não foi redesenhado o header, os cartões da Home nem as demais telas. A confirmação da senha própria segue bloqueada na API nas duas contas testadas, e a falta de uma conta nível 2 permanece uma necessidade de massa de teste, não um defeito comprovado do servidor.
