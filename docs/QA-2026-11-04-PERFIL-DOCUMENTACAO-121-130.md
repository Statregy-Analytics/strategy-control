# QA 121–130 — Perfil, Documentação e tema 3 — 04/11/2026

Devolutiva recebida em 04/11. Ambiente local Admin :8080 e portal :9010, ambos integrados ao backend de homologação. Este checklist distingue implementação, teste integrado e dependência de contrato; uma tela renderizada não significa uma regra de negócio homologada.

## Revisão complementar dos fluxos — 04/11

Esta seção substitui os limites de teste da primeira publicação abaixo. Não representa aprovação das regras novas de nível ainda ausentes na API.

**Publicado e conferido:** portal 6ac3a76, Admin d8b7a8b. Lint/build aprovados nos dois projetos; 324 testes do portal e 203 testes versionados do Admin (211 locais, incluindo 8 do estudo adiado, que não foram enviados).

- [x] Conferir as referências diretas do Figma e os estados de leitura/edição disponíveis.
- [x] Corrigir e testar reenvio, validações, descarte, falhas parciais, retomada e proteção de sessão.
- [x] Exercitar recusa → motivo no portal → reenvio → aprovação com PDF fictício.
- [x] Exercitar criação dos quatro tipos de patrimônio, alterações financeiras e anexos fictícios.
- [x] Conferir publicação, documentos/termos, desktop 1920 px e mobile 390 px.
- [ ] Aprovar a regra integrada dos níveis, os tipos ausentes e os campos não suportados: dependem do backend.
- [ ] Aprovar sucesso bancário integrado nesta conta: falta documento fiscal na massa do Cláudio; a validação é correta, não bug do backend.

| Item | Resultado da revisão complementar |
| --- | --- |
| 121 | Mantido o cabeçalho Aurora já conferido; regressão dos demais temas e recuos incluída na verificação publicada. |
| 122 | Medição em 1920 px detectou e corrigiu altura de 106 para 104 px e cards de 73 px/largura variável para 216×67 px. Conteúdo adaptado em 1280/390 sem mudar a regra oficial. Estados de níveis 1/2/3, patrimônio indisponível e contagem sem duplicar lados/meses cobertos em testes controlados; nível real inconsistente permanece bloqueio do backend. |
| 123 | Grupos e ordem conferidos; CPF/NIF, bens e termos preservados nas abas próprias. Teste real: IRPF fictício recusado no Admin, motivo visível no portal, contador 2/5 → 1/5, reenvio aceito, contador → 2/5 e nova versão aprovada. Corrigida a ação sobre versão rejeitada antiga em linha de arquivo único com data de criação conhecida; holerite preserva múltiplos arquivos. A API ainda devolve a versão antiga no overview do Admin. |
| 124 | PDF e PNG reais conferidos; imagem carregou com 128 px de resolução original, ícones de formato e download do PDF aprovado passaram. Outros formatos têm apresentação controlada; a API continua aceitando upload apenas PDF/JPEG/PNG. |
| 125 | Tags dos quatro grupos, botões de pendência/recusa e campos indisponíveis conferidos. Arquivo TXT fictício foi recusado, e Salvar sem arquivo exibiu validação mantendo o formulário. Holerite real de três arquivos continua bloqueado pelo catálogo. |
| 126 | Corrigido reenvio de frente/verso para usar o ID e lado de cada arquivo, sem cruzar tipos. Salvar/Descartar documental junto ao título. Edição bancária não apaga silenciosamente PIX mascarado: pede redigitação no campo existente. Campos brancos medidos em 40 px, texto escuro. Cadastro bancário real do Cláudio retorna orientação de documento fiscal ausente, preserva valores e permite descarte; é pré-condição da conta de teste, não bug de API. Escrita bancária 2xx/duplicidade/sessão/falha cobertas em testes controlados, não rotuladas como sucesso real desta conta. |
| 127 | Criação real de veículo, investimento e consórcio fictícios (R$ 100 cada), além do imóvel já existente. Veículo retomou financiado/R$ 50 e foi quitado; leitura da API confirmou remainingBalance=null. Investimento retomou prazo de 12 meses/vencimento e foi alterado para prazo livre; corrigido resumo que antes mostrava Quitado. Consórcio rejeitou parcelas pagas acima do total e gravou após correção. Selects reutilizam dados reais e permitem digitação de texto aceito pelo contrato; não usam opções fake legadas. Salvar antes de Descartar, moeda escura também no saldo devedor e rótulo Valor do Consórcio corrigidos. |
| 128 | Aba selecionada agora atualiza o parâmetro tab, preservando a retomada após recarregar; sem acrescentar navegação ou ação ao desenho. |
| 129 | Contador de suítes conferido com screenshot C11; indisponibilidade é do contrato, sem número fictício. |
| 130 | Corrigida projeção do anexo patrimonial para usar o próprio arquivo/status e não outro arquivo do mesmo grupo. Uploaded do vínculo é apresentado como Pendente para preservar a revisão explicitamente autorizada no overview. A foto PNG fictícia foi aprovada pelo grupo Patrimônios e retomada no editor do bem. Contadores agora consideram somente vínculos ativos: dois arquivos removidos deixaram de contar, inclusive com o grupo recolhido. Em homologação: 2 aprovados, 1 pendente e 1 rejeitado (versão antiga do IRPF mantida pela API). Estado dos totais fica “—” até os vínculos carregarem, em vez de inventar zero. Testes controlados garantem isolamento de ID/estado/motivo e permissão explícita. |

### Referências visuais e cobertura

O recurso de screenshots do Figma funcionou mesmo com a cota de get_design_context esgotada. Foram obtidas as referências diretas 1:67926 (edição documental), 1:66813 (patrimônios), 1484:69408 (C11) e 1484:68035 (C02), complementando os contextos de alta fidelidade já lidos para cabeçalho, níveis e banco. A conferência não equivale a implementar campos que o HTTP ainda não suporta. Campos obrigatórios adicionais já autorizados permanecem enquanto o backend exigir esses dados; não foram preenchidos automaticamente.

As falhas artificiais de rede, sessão encerrada, resposta tardia e falha parcial são testes controlados, sem derrubar o ambiente compartilhado. Holerite real de três arquivos, alternativas civis ausentes, suítes, início do consórcio e transição oficial aos níveis novos não podem receber aprovação integrada até o contrato existir.

### Massa fictícia desta revisão

Conta Cláudio: um imóvel existente QA121–130 e três novos bens identificados QA121-130, R$ 100,00 cada. Sem lançamento de depósito/saque ou operação financeira. A conta bancária antiga e sua marcação principal foram preservadas. PNG e PDF foram selecionados juntos, descartados sem criar vínculo, enviados, retomados e medidos em 104×104. O vínculo do PDF foi removido e o PNG mantido/aprovado. O bem original continua único; a API confirmou um único anexo ativo neste imóvel. O IRPF fictício possui uma versão antiga recusada e uma nova aprovada; essa duplicidade no overview fica como evidência do versionamento pendente.

### Contratos e Termos — correção de integração encontrada na revisão

A aba era bloqueada por uma configuração legada antes de fazer a consulta HTTP. Reutilizada a consulta versionada de Onboarding já existente (requirements, com conteúdo), mantendo somente leitura/download. Arquivos reais da categoria Plataforma do overview também aparecem em Termos; bens e documentos fiscais não entram nessa lista. Marketing não é tratado como termo nem recebe ação de aceite. Falha de uma fonte conserva a outra e oferece o retry já existente.

Em homologação, Termos de Uso, Política de Privacidade e Política de Cookies carregaram; o download de Termos de Uso passou. Não houve novo aceite de termos. Contratos sem arquivos retornaram o estado vazio. Recarregar preservou a aba Contratos e Termos.

### Publicação final e evidências

- [Portal: pipeline 41939764983](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/41939764983), commit 6ac3a76, concluída com sucesso, 324 testes.
- [Admin: pipeline 41940782953](https://github.com/Statregy-Analytics/strategy-control/actions/runs/41940782953), commit d8b7a8b, concluída com sucesso, 203 testes versionados.
- Portal publicado: cabeçalho Aurora a 24/48 px, raio 8, blur 32 e sombra 4/4/48/16; progresso 104 px e três cards 216×67. IRPF aprovado sem botão de reenvio da versão antiga. Quatro grupos, zero imagens quebradas.
- Patrimônio publicado: PNG retomado, miniaturas/uploads 104×104 e valores reais. Investimento com prazo livre não aparece como Quitado.
- Mobile publicado: documento com rolagem interna (tabela 728 px dentro de 312 px), página de 378 px em viewport 390; banco com quatro campos de 40 px e nenhum fora do card. Admin: página 375 px em viewport 390, foto aprovada e contadores corretos. Preferência Cinza e preto restaurada após a prova do Aurora.
- [Documentação no portal](evidence/qa-2026-11-04-revisao-121-130/portal.png), [editor do imóvel](evidence/qa-2026-11-04-revisao-121-130/imovel.png), [Admin](evidence/qa-2026-11-04-revisao-121-130/admin.png), [mobile](evidence/qa-2026-11-04-revisao-121-130/mobile.png).

O upload anterior do Admin levou aproximadamente dez minutos. A tentativa inicial do portal foi interrompida e retomada; a tentativa 2 terminou com sucesso. A publicação passou a reutilizar no servidor os arquivos iguais da release atual via checksum/copy-dest, mantendo diretórios independentes e ativação ao final. Teste local confirmou conteúdo novo, reaproveitamento e preservação da release anterior, sem hard links. O comportamento de copy-dest está documentado no [manual oficial do rsync](https://download.samba.org/pub/rsync/rsync.1#opt--copy-dest). Não houve mudança nos endpoints ou nas portas CORS.

## Primeira publicação — histórico

## Matriz das telas e estados

| Item | Front implementado e estados conferidos | Limite integrado / próximo reteste |
| --- | --- | --- |
| 121 | Cabeçalho Aurora com glass 16%/4%/1%, raio 8, blur 32, sombra 4/4/48/16 a 24%; desktop a 24 px do topo e 48 px das laterais. | Conferido pelo estilo computado e visualmente; mobile mantém os recuos responsivos existentes. |
| 122 | Cabeçalho de níveis com arte e louros existentes conferidos iguais aos assets do Figma, textos aprovados, cards atuais/contador/barra, documentos distintos e identidade frente/verso contando uma vez. Holerite de até 3 arquivos conta uma vez. | Nível oficial continua vindo da API. Cláudio retorna currentLevel=null e nextLevel=LEVEL_1, enquanto o resumo/cartão informa nível 1. Regra nova 1=cadastro, 2=5 documentos não recusados, 3=mais 3 patrimônios ainda depende do backend. Não houve conversão local de permissões ou liberação fictícia. |
| 123 | Quatro grupos e ordem aprovados. CPF/NIF, bens, termos e produtos fora da aba Documentação; dados mantidos no servidor. Frente/verso preservam seus arquivos e motivos de recusa. | Faltam tipos do novo catálogo descritos abaixo; linhas indisponíveis não recebem IDs inventados. |
| 124 | Ícones de formato PDF/IMG obtidos do Figma; XLS verde e identificação de outros formatos na leitura. Nome do arquivo preservado; sem imagem quebrada na revisão. | Envio mantém formatos aceitos pela API (PDF/JPEG/PNG), sem declarar suporte novo a XLS. |
| 125 | Tag única “Conta para o Nível 2” por grupo; botão azul de upload em pendências e recusas. Suporte de seleção até 3 para holerite quando seu tipo existir. | Reteste real de holerite depende do catálogo. |
| 126 | Banco na linha, campos brancos de 40 px, principal/check/descarte ou arquivamento; payload só com campos aceitos, titular automático. Documentos editam dentro do grupo em duas colunas, Salvar/Descartar junto ao título. Campos e moeda nos bens seguem o mesmo padrão. | Arquivos aprovados permanecem protegidos; substituição usa o ID recusado correto. Contratos e Termos hoje é consulta/download: nenhuma edição ou inclusão foi inventada. |
| 127 | Ordem dos campos disponíveis ajustada; ações Salvar/Descartar junto ao título. Uploads de matrícula, IPTU e fotos em caixas de 104×104, miniaturas e ações de ver/remover. Arquivos aguardam salvar e vínculo é retentável sem repetir upload aceito. | Campo início do consórcio e suítes não existem no DTO. Os campos obrigatórios já autorizados anteriormente continuam disponíveis: removê-los só para caber no formulário reduzido quebra os POSTs atuais. Conferir a composição com QA/contrato antes de ocultá-los. |
| 128 | Voltar é botão acessível de 40×40, com 16 px até o título 29 px e alinhamento vertical compartilhado nas abas. | Desktop e mobile conferidos; título não quebra em duas linhas em 390 px. |
| 129 | Suítes preparado no Admin abaixo de Banheiros, no padrão de contador, e no portal. | Indisponível até existir campo em leitura/POST/PATCH. Não exibe zero fictício nem envia propriedade não reconhecida. |
| 130 | Título Documentação; cinco grupos, Patrimônios recolhido por padrão. Ao abrir, lista os bens e seus anexos reais com os mesmos componentes de leitura/revisão. CPF/NIF e comprovantes genéricos saem da lista principal. | Novos tipos dependem do catálogo; vínculo/leitura/revisão dos anexos existentes já têm contrato e foram reaproveitados. Não pedir essas rotas novamente. |

## Fluxos verificados

- Leitura com conta fictícia Cláudio, grupos vazios e preenchidos, tipo ausente desabilitado, pendência, seleção e descarte. Tela em tema Aurora conferida em 1280 px; documentação contida em tabelas com rolagem interna em 390 px. Cabeçalho e título conferidos por medidas computadas.
- PDF fictício `qa121-ficticio.pdf` enviado no grupo Declaração IRPF: retorno aceito, formulário fechou, arquivo retomado como Enviado e contador de documentos distintos passou de 1/5 para 2/5. Esse contador orienta o desenho; a autoridade do nível ainda é a API.
- Patrimônio fictício “QA121–130 — imóvel fictício de upload”, R$ 100,00, criado na conta de teste do Cláudio. O teste detectou e corrigiu referência de componente dentro de v-for. A retomada usou o bem já criado, sem duplicá-lo. PDF enviado, vinculado e retomado no editor; miniatura de formato PDF em 104×104. Remoção pelo editor desvinculou somente o arquivo. Leitura posterior da API confirmou exatamente um bem, moeda BRL e zero vínculos após remoção. O bem e o IRPF fictícios ficam identificados para reteste; sem movimentação financeira.
- Admin/Jorge: cinco grupos, 12 bens carregados e 10 vínculos existentes identificados nos blocos corretos; ações de análise disponíveis conforme o overview. Nenhum documento anterior foi aprovado ou recusado nesta rodada. Mobile sem overflow após correção do alinhamento do aside.
- Testes controlados: sessão encerrada impede escrita tardia; falha no vínculo preserva ID do upload; retries não repetem arquivos já aceitos; remoção atinge somente a associação; falha no segundo arquivo do grupo preserva o primeiro aceito; payload bancário conserva tipo, separa dígito e exclui dados de titular.

## Dependências reais do backend / decisão conjunta

1. Unificar a nova regra de níveis no progresso, perfil, cards e ficha do Admin. Expor contadores atuais de documentos válidos para a regra e de patrimônios, sem contar frente/verso ou três meses de holerite como três documentos. Tratar recusa e reenvio da versão vigente.
2. Disponibilizar catálogo comum: holerite/contracheque, declaração de autônomo, RPA, contrato de prestação de serviços + comprovantes e Decore. Na consulta de 04/11, nenhum desses cinco tipos existe. Estado civil dispõe apenas de Certidão de Casamento, faltando as alternativas de nascimento/união/divórcio pedidas pelo QA.
3. Campo de suítes em resposta, POST e PATCH dos imóveis, no cliente e Admin. Swagger consultado ainda contém bedrooms/bathrooms e não contém suites. Suítes fica indisponível nos dois projetos até contrato real.
4. Quando Começou no consórcio não existe no DTO atual. Confirmar também como o formulário reduzido do QA deve criar veículo/investimento/consórcio sem os outros dados ainda obrigatórios no POST. Não preencher marca, ano, produto, administradora ou quota com valores inventados.
5. Confirmar a categorização/versionamento dos conjuntos de identidade e holerite; upload bruto de arquivos e vínculo patrimonial já funcionam. As regras novas de nível e os novos tipos não estão homologados apenas porque esses endpoints existem.

## Evidência técnica e limites

Portal: 318 testes aprovados; Admin: 208 locais (8 do estudo adiado ficam fora da publicação, total versionado 200). Lint, build e diff das alterações aprovados antes do push. Publicação e confirmação registradas ao final deste documento.

Na primeira publicação, o conector Figma leu cabeçalho/níveis/tabela/contas bancárias e tema 3, depois atingiu o limite de consultas do plano. A revisão complementar acima obteve também screenshots dos painéis restantes; as limitações originais abaixo não são uma certificação geral de fidelidade. O detector mecânico foi executado uma vez: avisos de Inter, tamanhos, raios, cores e borda esquerda são decisões explícitas do Figma/devolutiva, não autorização para redesenhar.

Alterações locais anteriores em PRODUCT.md, estudo futuro de preferências/países, Swagger e notas não relacionadas ficam preservadas e fora do commit deste lote.

## Publicação e confirmação

- Portal runtime **988d7fc**: [pipeline 41930363128](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/41930363128) concluída com sucesso, 318 testes, lint, build e deploy.
- Admin runtime **82bd3ec**: [pipeline 41930348144](https://github.com/Statregy-Analytics/strategy-control/actions/runs/41930348144) concluída com sucesso, 200 testes versionados, auditoria, lint, build, upload e ativação.
- Portal publicado conferido em `https://hml.strategyanalytics.com.br/system/config/profile?tab=documentation`: quatro grupos, PDF fictício retomado como Enviado, atualização em 04/11/2026, contador 2/5, imagens válidas e cabeçalho Aurora. Preferência anterior de tema restaurada após o teste.
- Admin publicado conferido na conta Cláudio: cinco grupos e o imóvel fictício no grupo Patrimônios, com “Nenhum documento enviado” após a remoção do vínculo. Consulta final sem erro de anexos. A revisão de documentos anteriores não foi acionada.
- A primeira sessão do portal foi aberta durante a troca de release e encontrou chunks antigos indisponíveis. Uma navegação completa para a versão nova e novo login resolveram a conferência. A sessão da versão atual foi validada; não é erro de credencial nem reprovação do build.
- Observação visual preexistente fora deste lote: em 1280 px, valores longos nos cards da carteira do Admin podem quebrar linha. Não foi alterado neste reteste de Documentação.

Aprovação integrada dos itens de backend continua pendente nos pontos da matriz. O QA pode retestar o front publicado sem interpretar esses limites como regras já entregues.
