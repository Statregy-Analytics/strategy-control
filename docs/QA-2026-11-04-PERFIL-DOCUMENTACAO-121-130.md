# QA 121–130 — Perfil, Documentação e tema 3 — 04/11/2026

Devolutiva recebida em 04/11. Ambiente local Admin :8080 e portal :9010, ambos integrados ao backend de homologação. Este checklist distingue implementação, teste integrado e dependência de contrato; uma tela renderizada não significa uma regra de negócio homologada.

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

O conector Figma leu cabeçalho/níveis/tabela/contas bancárias e tema 3, depois atingiu o limite de consultas do plano. Edição documental, patrimonial e C02 novo foram orientados pela devolutiva detalhada e pelas composições existentes; não certificar comparação pixel a pixel dos nós não lidos. O detector mecânico foi executado uma vez: avisos de Inter, tamanhos, raios, cores e borda esquerda são decisões explícitas do Figma/devolutiva, não autorização para redesenhar.

Alterações locais anteriores em PRODUCT.md, estudo futuro de preferências/países, Swagger e notas não relacionadas ficam preservadas e fora do commit deste lote.

## Publicação e confirmação

- Portal runtime **988d7fc**: [pipeline 41930363128](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/41930363128) concluída com sucesso, 318 testes, lint, build e deploy.
- Admin runtime **82bd3ec**: [pipeline 41930348144](https://github.com/Statregy-Analytics/strategy-control/actions/runs/41930348144) concluída com sucesso, 200 testes versionados, auditoria, lint, build, upload e ativação.
- Portal publicado conferido em `https://hml.strategyanalytics.com.br/system/config/profile?tab=documentation`: quatro grupos, PDF fictício retomado como Enviado, atualização em 04/11/2026, contador 2/5, imagens válidas e cabeçalho Aurora. Preferência anterior de tema restaurada após o teste.
- Admin publicado conferido na conta Cláudio: cinco grupos e o imóvel fictício no grupo Patrimônios, com “Nenhum documento enviado” após a remoção do vínculo. Consulta final sem erro de anexos. A revisão de documentos anteriores não foi acionada.
- A primeira sessão do portal foi aberta durante a troca de release e encontrou chunks antigos indisponíveis. Uma navegação completa para a versão nova e novo login resolveram a conferência. A sessão da versão atual foi validada; não é erro de credencial nem reprovação do build.
- Observação visual preexistente fora deste lote: em 1280 px, valores longos nos cards da carteira do Admin podem quebrar linha. Não foi alterado neste reteste de Documentação.

Aprovação integrada dos itens de backend continua pendente nos pontos da matriz. O QA pode retestar o front publicado sem interpretar esses limites como regras já entregues.
