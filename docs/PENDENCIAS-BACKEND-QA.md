# Pendências do backend para homologação

A interface segue o Figma e as alterações de ordem/campos expressamente autorizadas pelo designer/QA e pelo usuário. **Na ordem atual, profissional/financeiro é etapa 4 e documentos/endereço é etapa 5.** Precisamos dos estados e operações abaixo sem acrescentar campos ou ações às telas.

## Atualização vigente — 24/10

Lote [QA Admin 56–60](QA-2026-10-24-ADMIN-56-60.md): novos C32/C33/C35 e adequação C09/C10–C19. Permanecem contratos administrativos dos campos pessoais/documentais e de segurança (status da senha/2FA/link de redefinição), tipo CND de condomínio, características adicionais do imóvel e fatos de consórcio ausentes no DTO. Busca/contas bancárias, documentos e fotos já têm integração; não pedir esses endpoints novamente.

Complemento [QA Admin 39–55](QA-2026-10-24-ADMIN-39-55.md): ajustes de apresentação da seleção/ficha. Risco do Jorge conferido em ficha e header: null; o front deve mostrar “—”. A escala A/AA/AAA segue como decisão de produto, não conversão local.

[Reteste de cards, sessões e conta principal](QA-2026-10-24-CARDS-SESSOES-CONTA-PRINCIPAL.md) prevalece sobre os relatos de 23/10 abaixo. Documento mascarado nos cards e sessões por cliente já têm API; as três contas únicas apontadas agora retornam isPrimary=true. Integração de Deslogar por linha e máscara do sufixo no front neste lote. Não pedir novamente essas três entregas como endpoints/dados ausentes.

Restam: escritas administrativas de dados pessoais existentes; declaração PEP/observação sem alerta; valores atual/bloqueado por participante e regra do contrato encerrado no investido; decisão de produto sobre as escalas de classificação (detalhada abaixo); sessão HttpOnly/investigação de identidade e contratos dos módulos ainda sem persistência. A localização da sessão não é fornecida e o catálogo não tem CNPJ para empresas; separar esses limites dos cenários de documento pessoal e encerramento individual já liberados.

Renda atual, UUID da moeda patrimonial, valor base do participante, alternativas documentais, submit/declaração de contatos e defaults liberados não devem voltar como pendências antigas. O estudo futuro de moedas/idioma/fuso/países ficou adiado e não faz parte desta correção.

## Decisão de classificação e declaração PEP — retorno complementar de 24/10

| Indicador | Escala informada pelo backend | Origem |
| --- | --- | --- |
| Classificação do card | A/E/G/I | Quantidade de documentos |
| Progresso documental | A/B/C/I | Percentual de requisitos cumpridos |
| Risco | A/B/C | Alertas de compliance |

A/AA/AAA do Figma não existe nas regras atuais. A sugestão do backend de usar a classificação do progresso documental no card aguarda decisão de Éric/produto; não é conversão autorizada. Até lá, mostrar o valor real de cada domínio. Não traduzir G para outra letra nem igualar risco e classificação documental no front. Consulta atual dos 13 cards encontrou G/I.

Filtros de classificação/compliance/nível no servidor aguardam essa decisão e não bloqueiam o cenário atual: o front consulta o resultado completo antes de filtrar/paginar. São evolução de escala, não falha atual de filtro.

Declaração PEP continua pendente de implementação do backend: gravação e leitura no perfil/onboarding e reflexo nos alertas. A integração da pergunta no fluxo aprovado depende desse contrato; não criar declaração local ou alerta substituto.

Máscara atual conferida: seis asteriscos e quatro caracteres finais em três dos 13 cards; null nos demais. O front passa a preservar o prefixo mascarado efetivamente recebido, sem reconstruir conteúdo oculto. CNPJ próprio para empresas e localização das sessões continuam como limites separados. Os itens de sessões/conta única já homologados não foram reabertos.

## Histórico de evidências — não encaminhar como lista atual

As seções datadas abaixo preservam o que foi observado em cada rodada. A matriz de fechamento acima prevalece para o Admin; o portal mantém checklist próprio e não foi revalidado por este lote. Relatos antigos de endpoints ausentes ou bugs já corrigidos não são solicitações atuais.

## Seleção e ficha — atualização de 23/10

Detalhes e checklist: [QA seleção/ficha](QA-2026-10-23-SELECAO-FICHA.md). Restam maskedDocument vazio nos 13 cards apesar do CPF na identificação, API administrativa das sessões por cliente, declaração PEP do perfil e regra de conta única principal no servidor (três de cinco clientes com conta única ainda retornaram isPrimary=false; Cláudio está correto). Confirmar também a classificação G/I recebida versus os exemplos A/AA/AAA do desenho. Os filtros já funcionam no front sobre todas as páginas; suporte server-side é melhoria de escala. O bind visual de status foi autorizado: Active/Ativo, Suspended/Bloqueado e Prospect+Archived/Inativo, sem mudar os enums ou o estado cadastral real.

Complemento do front em 23/10: Todos no status, Alerta no filtro/badge, prefixo Compliance na lista e cores dos badges da ficha corrigidos sem novo contrato HTTP. Esses ajustes não devem ser encaminhados como demandas do backend. Os bloqueios de dados/API acima continuam separados.

## Ciclo das ações documentais — reteste de 23/10

Loading e arquivo/diálogos por cliente/documento foram corrigidos no front, incluindo conclusão tardia de upload (eb53be3). Pipeline 39973080495 aprovada, 137 testes; leitura do PNG fictício, cancelamento da revisão e troca de cliente conferidos no Admin publicado. Não exige novo contrato HTTP. As regras de progresso/versões documentais do servidor permanecem separadas desta correção. [Relatório e limites](QA-2026-10-23-CICLO-DOCUMENTOS.md).

## Ciclo do editor de patrimônio — reteste de 23/10

Respostas tardias após fechar o painel, trocar de cliente ou sair foram protegidas no front (073253d). Reteste publicado de descarte e alternância Jorge/Cláudio concluído, com 132 testes e pipeline 39970596392 aprovada na tentativa 2. Não exige mudança de API nem desfaz requisições já recebidas pelo servidor. [Evidências e limites](QA-2026-10-23-EDITOR-PATRIMONIO.md). O timeout SSH da primeira publicação foi resolvido na repetição e não é bug dos endpoints do backend.

## Exibição da moeda patrimonial — reteste de 23/10

O Admin passou a usar currencyCode já devolvido no bem, sem depender das moedas da carteira. Correção de front publicada em 9909326/3dbdb4c, com leitura BRL/EUR/USD e mobile conferidos. Não solicitar novo campo/endpoint para essa exibição. A ausência/falha da carteira foi coberta em teste controlado, não induzida no servidor. [Evidências e limites](QA-2026-10-23-MOEDA-PATRIMONIO.md).

## Imagens do patrimônio no Admin — reteste de 23/10

Upload, vínculo, retomada de posições e abertura por URL temporária passaram com arquivos fictícios no Admin publicado (6eab47c / pipeline 39959274171 aprovada). Não há bloqueio de backend nos cenários de imagens exercitados. O contador de documentação pessoal foi ajustado no front para não somar fotos patrimoniais; isso não é demanda do backend. Escopo e limites no [relatório](QA-2026-10-23-IMAGENS-PATRIMONIO.md). O fluxo do portal não foi revalidado neste lote.

## Atualização de 22/10 — prevalece sobre os relatos históricos

O retorno libera envio final, declaração de ausência de contato, RG/CNH/passaporte como alternativas, moeda automática de patrimônio/conta e status/data/bloqueio do cadastro. Esses contratos **não devem mais ser pedidos como ausentes**. Compatibilidade bancária (sem campos de titular), declaração, envio final, bloqueio oficial, países por idioma e moeda automática integrados nesta rodada. Detalhes, testes e limites em [Retorno de 22/10](QA-2026-10-22-RETORNO-BACKEND.md).

Separar trabalho restante do front/homologação de bloqueios do servidor: imagens do patrimônio, visualização de ambos os arquivos e projeção da ficha recém-enviada já possuem endpoints. Consentimentos/contexto e aceite versionado ainda precisam de integração/reteste; a existência do submit não confirma automaticamente a aceitação dos termos. Valores de contratos, reenvio/metadados, sessão HttpOnly, incidente de identidade e módulos sem contrato continuam sujeitos aos retestes próprios.

Os itens abaixo são registros anteriores. Onde contrariem os contratos informados em 22/10, a atualização acima prevalece.

## Atualização após o retorno do backend, 20/10

Consulte [integração e retestes do retorno](QA-2026-10-20-RETORNO-BACKEND.md). Esta atualização prevalece sobre os relatos históricos abaixo: renda atual, catálogos de gênero/estado civil, bairro, nacionalidades, contato sem relationship, patrimônio próprio e Basic/Full já têm contrato e integração no front. Não solicitar esses endpoints novamente. Bairro também foi habilitado no Admin. Permanecem os contratos administrativos de outros dados pessoais, moeda patrimonial sem carteira e os limites listados no reteste.

## Aprovação de documentos e edição do perfil

O front de Aprovar/Reprovar documentos está integrado conforme C27–C28. Situação atual confirmada em 20/10:

- Confirmado em 20/10 na conta nova: aprovação dos dois RGs removeu a pendência dos arquivos e habilitou edição de Dados Básicos/Localização/Atividade no portal. Salvamento de Localização e persistência após recarga validados. Após aprovação da CNH pelo usuário, progresso chegou a 100%/LEVEL_1; permanece o alinhamento da exigência de CNH às alternativas do Figma, não um bloqueio atual de porcentagem nessa conta.
- Como consultar o estado da revisão cadastral, a data de envio e a permissão de edição, para apresentar C26 corretamente?
- Confirmado em 20/10: motivo e mensagem enviados juntos em `notes` chegam no overview/latestReview e aparecem no portal após correção do adaptador (bbbebd8). Reenvio aceito e nova revisão disponível; vínculo de substituição/metadados continuam pendentes abaixo.
- Qual é o catálogo de motivos de reprovação? O front usa apenas “Foto ilegível”, confirmado no Figma.

Confirmar também os defaults do cliente novo em C25: risco sem classificação, compliance pendente, status Prospect e preferências do sistema. O front preserva os valores reais retornados e não simula desbloqueio ou classificação.

Referência: [Figma C25 a C28](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1932-281). Evidências técnicas e limites em [Aprovação de documentos](QA-2026-10-19-APROVACAO-DOCUMENTOS.md).

## Edição dos campos existentes no perfil

- Confirmar escrita para documentos tipados, estado civil, nacionalidade, filiação e preferência de contato que já aparecem no desenho. Os campos sem operação confirmada permanecem somente leitura.
- Definir edição das observações de compliance sem obrigar a criação de um alerta. Hoje só é possível alterar a descrição de um alerta existente.
- Confirmar as operações previstas para segurança e sessões. O front não altera senha, 2FA ou status por meio de endpoints de outro domínio.

Detalhamento: [Edição por seção](QA-2026-10-19-EDICAO-POR-SECAO.md).

## Contratos e carteira

- Corrigir ou esclarecer o contrato encerrado do Cláudio ainda incluído no saldo investido. Na conferência de 19/10, a API retornou R$ 261.500,00 investidos e R$ 286.500,00 no total; o front não desconta valores por conta própria.
- Disponibilizar valor base, atual e bloqueado por participante para os campos do Figma. Capital e saldo do contrato inteiro não substituem o saldo do cliente.

Evidências: [Carteira e extrato](QA-2026-10-19-CARTEIRA-VAZIA.md) e [Devolutiva do Marco 3](MARCO-3-DEVOLUTIVA-BACKEND.md).

## Cadastro e autenticação

- Garantir unicidade do e-mail usado como login e revisar as duplicidades apontadas pelo QA.
- Definir o contrato de sessão com cookies HttpOnly para Admin e portal: login, refresh, logout, CORS e proteção CSRF. Essa proteção exige suporte do servidor/BFF.
- Investigar o incidente de identidade relatado em 17/10 às 18:16. As proteções adicionadas ao front não encerram a análise da causa.

Referência e contexto: [Triagem do QA](QA-2026-10-17-TRIAGEM.md).

## Menu e módulos do Admin — QA 16

O menu segue os itens do Figma; Clientes, Contratos e Transações usam as telas integradas. Formulários, Bancos e Configuração documental existentes ficam em Configurações. A seleção de sistema consulta `GET /me/systems`; esse endpoint já existe e não é bloqueio do backend.

- Confirmar os contratos HTTP dos fluxos de Lógicas, Crédito e Comunicados previstos no Figma. Não foram encontrados nos Swagger consultados. Crédito e Comunicados também precisam de implementação no front; Lógicas ainda usa dados locais.
- Confirmar os contratos HTTP para Leads e Assessores antes de substituir as telas locais/fictícias por dados reais. Esses protótipos não foram apresentados como módulos homologados no menu.
- O endpoint de sistemas anuncia o editor de landing page como disponível, mas a tela atual do front é um protótipo sem persistência. Confirmar as operações de rascunho, mídia e envio para revisão/publicação previstas no desenho; depois será necessário integrar o front. O cartão permanece indisponível na seleção para não oferecer um fluxo sem gravação.

As entradas vazias eram falhas de navegação do front: `/dashboard` agora abre Clientes e `/landing-page` mostra a seleção A02, mantendo a exigência de administrador. Não foi criado dashboard ou painel de métricas fora do desenho. O item 16 permanece parcial pelos módulos sem integração.

## Portal: perfil e cadastro — QA 7 e 8

O login da seção nova (4:25438) foi concluído no front usando a autenticação existente, sem contrato novo. As telas do perfil já usam dados próprios, sem exemplos; o que falta abaixo deve preencher os campos e fluxos do Figma, sem seletores extras:

- Confirmar campo de bairro e catálogos/valores aceitos de gênero, estado civil e nacionalidade. Ocupação usa texto livre do contrato profissional confirmado, com ampliação autorizada da tela. Os seletores preservam o valor recebido enquanto não houver opções confirmadas.
- Contatos de confiança: inclusão sem `relationship` e edição dos contatos existentes já integradas no portal, inclusive lista vazia/múltipla. Resta confirmar persistência da declaração de ausência no cadastro; não é necessário criar campo de relacionamento.
- Confirmar consulta e operações do patrimônio próprio do cliente. As seções não mostram bens fictícios e não usam endpoints administrativos para contornar autorização.
- Informar o `context` correto dos consentimentos/termos do perfil. A consulta sem contexto retorna HTTP 400; o Swagger não enumera os valores. Não assumir um contexto de cadastro nem adicionar seletor.
- Confirmar Compartilhar Perfil: a projeção pública documentada só contém `customerId` e `avatarUrl`; não permite reproduzir o conteúdo completo do desenho.
- Confirmar persistência/retomada das sete etapas, aceite versionado, documentos por país e estado de envio/revisão cadastral. As sete telas já usam os endpoints existentes; dados suportados são retomados pela API. O checklist atual separa lacunas reais de contrato, bloqueio documental 403 e retestes ainda abertos do front.

Referência de evidências: repositório Strategy-analytics-v2, `docs/QA-2026-10-19-PERFIL.md`. Avatar já usa a URL recebida e fallback neutro; uma foto válida precisa estar disponível na API para homologar seu carregamento, sem criar upload fora do Figma.

## Portal: Home — QA 2 a 6

Estado vazio já validado com conta real de homologação, com zeros confirmados pela API e Solicitar contrato abrindo Contratos. Permanecem:

- Fonte de comparação com período anterior e série do motor de variação. Não fabricar percentual, inclusive 0,00%, quando a API não o fornece.
- Iniciação de depósito pelo cliente conforme o botão do desenho. Hoje a ação exibe o aviso existente de indisponibilidade; não simula movimentação.
- Fonte de dívida para decidir a seção de empréstimos; o resumo demonstrativo foi removido do front.
- Contrato de conteúdo para as publicações. Os estados sem comunicação já seguem o Figma, mas não homologam leitura de publicações reais.

As paletas e o relógio dos Ajustes preservam a persistência local existente. Se precisarem sincronizar entre dispositivos, confirmar contrato correspondente; os temas `Light`, `Dark`, `System` da API não equivalem automaticamente às três paletas do Figma.

## Situação do frontend — atualização de 20/10

O bloqueio de lint global do portal foi corrigido; 52 testes e build passaram. A pipeline passa a validar lint e testes antes da publicação. Não há solicitação nova ao backend decorrente desse lote técnico. As dependências acima continuam abertas; as correções de sintaxe/reatividade nos componentes legados não homologam os protótipos.

## Cadastro de sete etapas — pendências reais após integração, 20/10

O front passou a usar os endpoints existentes de registro, confirmação/reenvio, perfil, preferências/país, perfil profissional/financeiro, contatos, documentos e status. Não estamos solicitando recriar essas operações. Mantemos os campos/ações do Figma.

1. **Aceite legal da etapa 1:** fornecer texto/URL e versão dos Termos/Política e forma de vincular o aceite ao registro sem sessão prévia. /auth/register aceita somente name/email/password/referralCode. /client/consents/requirements requer contexto (consulta sem contexto retorna 400) e o fluxo cliente é autenticado; confirmar contexto e vínculo corretos. Na consulta administrativa de homologação em 20/10, GET /admin/consents e GET /admin/consent-policies retornaram listas vazias; além da definição do fluxo, falta configuração desses documentos/políticas no ambiente.
2. **Dados pessoais:** UpdateClientPersonalDetailsRequest possui nationality singular e não possui país de nascimento. Definir gravação/consulta das múltiplas nacionalidades e país já desenhados. Disponibilizar opções de gênero/estado civil/nacionalidade e estados/UF; /preferences/catalog consultado retorna moedas/idiomas/fusos/temas e países BR/PT, não esses catálogos. Valores atuais da API são preservados, sem opções inventadas.
3. **Residência e endereço:** escolha regional do Figma (Europa, África etc.) não determina um país real; confirmar resolução sem acrescentar campo. CustomerAddressRequest não tem bairro separado; complemento permanece em line2, sem misturar os dois. Países únicos disponíveis podem ser associados pelo ID real do catálogo, preservando preferências.
4. **Documentos por país:** APIs de tipos, definição de dados, upload e provided-documents existem e estão conectadas. Na consulta de BR, CPF e RG têm definição válida; confirmar equivalência do Documento de identificação genérico do Figma com o tipo apropriado e completar tipos/esquemas das demais variantes. Não atribuir o país do frame a todos os países da região. O requisito de perfil completo foi esclarecido: faltava profissional. Com a nova etapa 4, a consulta de tipos foi liberada no reteste da conta nova; não solicitar remoção do guard. Upload/dados tipados ainda exigem reteste próprio, não criação de outro endpoint de upload.
5. **Contatos novos e ausência:** POST exige relationship, ausente no desenho. Permitir gravação com nome/telefone ou indicar regra válida sem acrescentar campo. GET/PUT de existentes já preservam o relacionamento real. Falta estado explícito de Não possuo contato de confiança; lista vazia não prova a declaração e não autoriza apagar contatos.
6. **Envio final/revisão:** confirmar operação que vincula dados/documentos/confirmação e inicia análise, com consulta do envio/data/recibo, correção/reenvio e permissão de edição. GET /client/onboarding/status existe, mas não explicita esse envio. Em homologação, GET /data-intake/forms retornou ASSET-CONSORTIUM, ASSET-INVESTMENT, ASSET-VEHICLE e PATRIMONIO-IMOVEL; não há formulário cadastral identificado para reutilizar submit/resubmit. Não fabricar cadastro enviado, aprovação ou desbloqueio.

**Não são pendências do backend:** conectar serviços existentes ao front (realizado neste lote), escolha técnica da data inicial na criação dos perfis, preservação de metadados existentes, autenticação/interceptors/idempotência, testes de falha/retry e execução dos retestes do QA. As vigências existentes são preservadas; novos perfis usam a data de criação, sem campos extras no desenho. Financeiro em outra moeda é preservado e não convertido silenciosamente para BRL.

As evidências de tela/integração e os retestes ainda não executados ficam no checklist; somente falhas reais de API devem entrar na tabela de bugs do checklist manual.

## Evidência com conta recém-criada — 20/10

Criação e recebimento do código confirmados pelo usuário; sessão cliente e campos pessoais básicos funcionando. Endereço/filiação e financeiro da conta nova foram persistidos pelo próprio portal. As próximas solicitações não devem ser tratadas como ausência geral desses endpoints.

- **Bloqueio documental reproduzido:** etapa 4 persiste endereço/filiação, mas a consulta de tipos de documento seguinte no fluxo recebe 403 para esta conta nova; repetir não liberou o acesso. Confirmar o blockingCode, quais requisitos faltam e como concluí-los nos campos do Figma antes de enviar documentos. Não assumimos que todo 403 seja defeito: falta alinhar o guard com o onboarding. RequestId/correlationId não foram expostos pela mensagem da tela; não foram inventados. Nenhum arquivo chegou ao upload.
- **Catálogos e dados pessoais:** gênero/estado civil/nacionalidade/atividade e Estado/UF sem opções nas telas. País de nascimento selecionado não volta após recarga; o payload documentado não possui esse campo. Nascimento e cidade, que possuem campos próprios, persistem corretamente.
- **Endereço:** bairro digitado não retorna porque falta campo separado; complemento permanece independente. O número concatenado em line1 e não reposto no campo Número foi registrado como ajuste de adaptação do front, sem atribuí-lo automaticamente ao backend.
- **Contatos:** exigência de relationship bloqueia o envio de nome/telefone de contato novo antes do POST; ausência declarada fica apenas em memória. Não foram criados campos extras nem relacionamento fictício.
- **Finalização:** revisão carrega dados reais persistidos, mas não foi possível iniciar análise cadastral nem obter recibo/status de envio pelo fluxo confirmado. A leitura de status não equivale a submissão. Termos/Política e aceite versionado continuam sem homologação, apesar da conta criada.

Financeiro com perfil inicialmente vazio foi criado e consultado com valores decimais e zero explícito em BRL. Não é pendência de endpoint nem de vigência do backend. A etapa profissional permanece parcial apenas pela falta das opções de atividade.

### Retomada do Número — correção do frontend publicada em 20/10

O número que voltava concatenado ao Logradouro foi corrigido no adaptador do portal (fdb07ab), sem alterar payload ou campos. Reteste na conta do usuário confirmou Logradouro e Número separados após recarga e retorno pela revisão, sem gravar o formulário nem alterar o endereço salvo. Removido das pendências ativas do frontend e não é solicitação ao backend. Bairro sem campo próprio e o bloqueio documental 403 permanecem separados e abertos.

### Revisão do QA — falhas de leitura no front, 20/10

Corrigida a substituição de rascunhos por dados vazios quando uma consulta da revisão falhava. Falha profissional, financeira e de contatos agora permanece independente e aparece na linha existente, sem campos ou ações adicionais. Esse defeito era do front; não é uma solicitação nova ao backend. O 403 documental, os catálogos/campos e o envio final acima continuam pendentes. Consulta CEP Brasil concluída no front reutilizando validator-cep; retomada no mesmo navegador após novo login concluída no front; progresso entre dispositivos/rascunho completo continua abaixo.

### CEP Brasil — frontend concluído, 20/10

A etapa 4 reutiliza a consulta pública validator-cep existente, sem exigir novo endpoint do backend do Marco 3. Logradouro/Bairro/Cidade/Estado são preenchidos; Número/Complemento permanecem manuais. A falta de bairro separado no payload cadastral permanece pendente, apesar do preenchimento local. O serviço de CEP não fornece catálogo de UF de expedição nem libera documentos; 403 e envio final continuam abertos.

### Progresso do cadastro — retomada no front e limite do contrato, 20/10

O front retoma a última rota visitada das etapas 3–7 no mesmo navegador/origem, separada por usuário autenticado, sem persistir dados pessoais, senha, token ou arquivos no marcador. Login carrega os dados suportados da API; não presume campos enviados a partir do rascunho em memória. Isso corrige o retorno sempre à Home e não exige endpoint novo para a navegação local.

Para cumprir integralmente o progresso salvo do Figma entre dispositivos, confirmar consulta/gravação da etapa atual e do rascunho cadastral, vinculadas ao cliente, e estado explícito de envio/revisão/finalização para encerrar a retomada. GET /client/onboarding/status, conferido no OpenAPI atual, retorna requisitos/features e flags; não contém etapa atual nem comprova envio final. Não inferir cadastro enviado de profileCompleted/documentLevel, nem exigir campos/ações extras na interface. Não estamos solicitando recriar os endpoints existentes de perfil/financeiro/contatos/documentos.

### ProfileIncomplete esclarecido e ordem corrigida — 20/10

O backend identificou que a conta nova não tinha registro profissional; a consulta documental exigia esse registro e o financeiro/endereço. A regra foi aceita pelo usuário com autorização do designer/QA: Atividade trabalhista passa à etapa 4 e Documento/endereço à etapa 5. Foram autorizados Ocupação, Empregador opcional e duas moedas, com escrita nos endpoints já existentes antes dos documentos. Não estamos pedindo remover o guard nem criar outro endpoint profissional.

Occupation é string no OpenAPI, sem enum: o campo passa a aceitar texto livre, deixando de depender de catálogo de ocupações. As duas moedas vêm do catálogo existente e são enviadas pelo front, preservando as demais preferências. Essas duas correções são de fluxo/integração do frontend, não pendências novas do servidor. Os registros anteriores do 403 são evidências da ordem antiga; o reteste atual consta no checklist.

Permanecem: catálogos dos demais seletores/UF, país de nascimento e múltiplas nacionalidades, bairro, países/tipos documentais ainda sem correspondência confirmada, contatos sem relationship/ausência, termos/aceite, progresso entre dispositivos e envio/revisão final. Uma negativa residual após os pré-requisitos deve ser documentada com seu código real, sem presumir novo bug do backend.

### Reteste após antecipar o profissional — bloqueios anteriores superados

Na conta nova de homologação do usuário, o wizard publicou e gravou o profissional, financeiro e as duas moedas antes de documentos (46d5bc5). A consulta de tipos deixou de retornar ProfileIncomplete e o fluxo alcançou a validação de arquivos ausentes. A Home carregou saldos zero e estados vazios sem PreferencesRequired. Esses dois bloqueios não devem continuar sendo cobrados como defeitos atuais do backend nesta conta. Nenhum arquivo foi enviado; isso não homologa upload, revisão/aprovação nem cadastro enviado.

Continuam abertas apenas as outras lacunas descritas acima. O requisito de perfil profissional antes dos documentos foi mantido; a correção foi feita na ordem e nos campos autorizados do frontend.


### Etapa 5 — upload RG Brasil validado, 20/10

Na conta nova do usuário, o portal publicado enviou frente e verso fictícios pelo fluxo existente e avançou à etapa 6. Leitura administrativa confirmou dois arquivos RG/BR Uploaded, privados e disponíveis, e um documento tipado ProvidedDocument/Active com duas evidências Uploaded. Upload e vínculo não devem continuar sendo solicitados como endpoints ausentes ou bloqueados por 403 nesta conta. Não foi realizada aprovação nem envio cadastral final.

UF de expedição continuou sem opções, porém a definição aceitou ausência: issuerState retornou null. Confirmar a fonte das opções/regras para preencher o campo existente do Figma; não tratar como erro de upload reproduzido. Bairro separado e demais países/tipos continuam pendentes nos limites já descritos.

A recarga da etapa 5 não repôs número/emissor/expedição, apesar do registro confirmado no servidor; é necessário confrontar a leitura do cliente com o adaptador antes de atribuir ao backend. O texto ainda não enviado mostrado ao voltar com arquivos já enviados é apresentação do frontend e fica fora da lista de bugs da API. Detalhes e próximos retestes no checklist de cadastro.


### Retomada documental resolvida no front — 20/10

Correção beb01b2 publicada (pipeline 39471786647 aprovada): o wizard retoma número mascarado, emissor, UF disponível e datas pela identificação do perfil. Campos sem retorno integral não são preenchidos com dados inventados. Documento/evidências vigentes sem edição permitem avançar sem reenviar; edição/reenvio exige número completo quando só há máscara. O texto ainda não enviado também foi corrigido nos componentes existentes. Conta do usuário avançou à etapa 6; leitura administrativa manteve os mesmos dois anexos e um RG, sem duplicação. Essas duas ocorrências deixam de ser pendências abertas/atribuíveis ao backend.

UF não preenchida anteriormente, catálogos, bairro e demais lacunas contratuais seguem conforme descrito. Aprovação documental e envio cadastral final continuam sem homologação; Uploaded não representa aprovação. Não é necessário criar campos/ações novos no Figma para essa correção.


### Lista documental do Admin — correção do front, 20/10

Os dois arquivos fictícios do cadastro já eram retornados pelo overview com permissão Review, em PERSONAL_DOCUMENTS. O front não reconhecia esse código e escondia as linhas; corrigido em 4fd3faf e validado no Admin publicado, pipeline 39474455430 aprovada. Ambos aparecem com ações de revisão e contador coerente. Não pedir endpoint/permissão nova ao backend para esse problema. Permanecem as confirmações já descritas sobre efeitos da aprovação, liberação da edição e revisão cadastral; nenhuma decisão documental foi enviada nesta rodada.


## Cadastro — CNH obrigatória divergente do Figma (20/10)

**Situação atual após aprovação da CNH pelo usuário:** progresso confirmado em 100%, LEVEL_1 concluído, 1 de 1 requisitos aprovado e compliance documental OK. Edição de Localização salvou e persistiu após recarga, com dado fictício restaurado. Não há bloqueio atual de porcentagem/edição nessa conta. A solicitação que continua aberta é alinhar a regra/configuração às alternativas do Figma, sem exigir CNH extra. A evidência de 0% abaixo é anterior à aprovação da CNH.

**Reproduzido em homologação após Aprovar os dois arquivos fictícios no Admin.** Overview: total 2, approved 2, pending 0. Área do Cliente mostra os dois Aprovado; edição de localização salvou e persistiu, com dado fictício restaurado ao final. Aprovação, atualização do portal e essa edição não devem continuar sendo cobradas como bloqueios gerais.

GET /admin/customers/{id}/documents/progress devolve currentLevel null, nextLevel LEVEL_1, progressPercentage 0, approvedRequirements 0, requiredRequirements 1 e documentComplianceStatus Pending. Em PERSONAL_DOCUMENTS, RG está Approved/Complete/countsAsComplete true, mas isRequired false; CNH está isRequired true/Pending, sem documento. O portal exibe os 0% recebidos, sem fabricar conclusão.

**Solicitação:** alinhar a configuração/regra de conclusão do nível às alternativas do cadastro aprovado no Figma (documento de identificação/passaporte), sem acrescentar exigência ou campo CNH à tela. Confirmar como representar alternativas aceitas, de modo que a aprovação da documentação prevista complete o requisito correto, e qual estado oficial comprova envio/revisão/conclusão cadastral. Não foi alterada a configuração do servidor nem enviado documento adicional para contornar a regra.

Não atribuímos o 0% a erro aritmético: ele corresponde à CNH obrigatória atual; o conflito é de configuração/regra com o fluxo aprovado. Reprovação/reenvio e conclusão de cadastro continuam não homologados.


## Reenvio após reprovação — vínculo e metadados (20/10)

**Validado:** Admin reprovou arquivo fictício, motivo Foto ilegível + mensagem chegaram no overview e foram exibidos no portal. O defeito que escondia o texto era do frontend e foi corrigido/publicado em bbbebd8, pipeline 39476133451 aprovada (162 testes). O cliente usou Substituir/Enviar com outro PNG fictício; API aceitou e o Admin recebeu o arquivo novo Pending para revisão. Não solicitar endpoint novo para o motivo ou upload.

**Alinhar no replace existente:**

- POST /client/profile/documents/{documentId}/replace criou outro documento Uploaded e manteve o anterior Rejected/archivedAtUtc null. Overview passou a total 4 (2 aprovados, 1 pendente, 1 rejeitado), sem vínculo de substituição exposto. Confirmar se o original deve continuar como pendência ativa ou somente histórico e como o cliente/Admin devem identificar a versão vigente. O front não deve deduzir pelo tipo, pois há vários arquivos RG legítimos.
- O original tinha metadata com issuer/documentNumber fictícios; o novo veio com {}. Tipo RG e emissão 01/01/2025 foram preservados. O multipart documentado aceita somente arquivo/issuedOn/expiresOn, sem metadata. Confirmar preservação dos dados/vínculo no servidor ou fornecer o contrato correto para esse reenvio, sem adicionar campos à interface.

Esses são limites reais do fluxo integrado; não confundem o motivo histórico com o motivo do novo envio, nem autorizam esconder o registro rejeitado. Os dois documentos aprovados anteriores foram preservados. O novo ficou aguardando revisão. A exigência de CNH/progresso e o envio final continuam nos itens próprios.


A apresentação móvel do motivo também foi corrigida em fb15804 e validada na versão publicada (pipeline 39476881643, tentativa 2, aprovada). Isso não altera os dois pontos de contrato do replace acima. Reprovação/motivo/reenvio foram retestados com arquivos fictícios, sem documentos pessoais reais.


### CNH — upload isolado retestado, 20/10

A pedido do usuário, CNH fictícia enviada pelo endpoint existente e exibida como Enviado no portal. Progresso permaneceu 0%; requisito CNH com documentStatus Uploaded, progressState Pending e countsAsComplete false (0 de 1 requisitos aprovados). Nenhuma aprovação dessa CNH foi executada. Isso confirma que upload não equivale a conclusão, sem resolver a configuração que exige CNH fora das alternativas do Figma. Não há novo bug de upload nem necessidade de criar campo adicional.


### Reteste da CNH aprovada — 100% confirmado, 20/10

Após aprovação feita pelo usuário, API e Área do Cliente mostram 100%; CNH Approved/Complete/countsAsComplete true, currentLevel LEVEL_1, nextLevel null e documentComplianceStatus OK. PATCH de Localização pelo portal salvou complemento fictício, persistiu após recarga e permitiu restaurar o original, também persistido. Essas leituras/escritas e a porcentagem não devem permanecer como bloqueios atuais da conta. Não houve alteração adicional do frontend.

A regra ainda considera CNH obrigatória e RG opcional. Portanto permanece o pedido de alinhar a configuração às alternativas do fluxo aprovado do Figma, sem documentos/campos extras. Total documental segue 5 (3 aprovados, 1 pendente, 1 rejeitado), pois 100% mede requisitos configurados; não comprova todos os arquivos aprovados nem envio final. Os pontos de versionamento/metadados do replace continuam independentes e abertos.


### Contatos estruturados do perfil — defeito do front encerrado, 20/10

O e-mail existente não aparecia no perfil porque a interface tratava primaryEmail/mobilePhone do resumo como texto, embora sejam objetos com valueMasked. Corrigido em 639bd6f, publicado na pipeline 39480681134 aprovada: máscara na consulta, valores reais dos contatos principais do perfil completo na edição e validação antes da escrita para impedir limpeza por objeto inválido. Teste integrado de alteração/restauração da naturalidade manteve todos os contatos, confirmado por comparação independente na API. Não solicitar novo campo/endpoint ou preenchimento fictício para resolver esse defeito do frontend. Ausência real de celular segue exibida como não informado.

Isso não encerra as pendências de relationship/ausência de contatos de confiança, unicidade de e-mail no servidor, aceite/envio final, catálogos e demais contratos já descritos.


### Perfil financeiro opcional — validação do frontend corrigida, 20/10

O contrato existente aceita null em rendas/bens. O front impunha preenchimento dos três campos e regravava o profissional sem alteração. Corrigido/publicado em b42b66d (pipeline 39481860662 aprovada, 170 testes), sem criar campos/ações. Reteste na conta do usuário confirmou gravação de renda familiar vazia como null, decimal e zero preservados, metadados intactos e restauração dos valores originais pela edição. Perfil profissional permaneceu idêntico em leitura independente. Não solicitar endpoint novo nem mudar obrigatoriedade no backend por esse defeito do front. Os demais bloqueios contratuais continuam nos itens próprios.


### Perfil financeiro — escrita no histórico não refletida na consulta atual, 20/10

**Aberto; homologação integrada do QA 8 financeiro bloqueada.** Na conta de homologação do usuário, alteração fictícia de renda pela interface é aceita e gera registro no GET /api/v1/admin/customers/{id}/financial-profiles, com createdAtUtc posterior. Entretanto GET /api/v1/client/profile/financial-profile e GET /api/v1/admin/customers/{id}/financial-profile/current continuam devolvendo renda de registro anterior.

Evidência sem identificadores pessoais: renda original 1234.56; escritas de teste 1234.57 e 1234.58 presentes no histórico às 19:24:57 e 19:25:32 UTC de 20/10. Registros retornados têm effectiveFrom e effectiveTo em 2026-10-20; o frontend preserva essas vigências recebidas, sem adicionar campos ao Figma. Confirmar a semântica do PUT de autosserviço, vigência e desempate da consulta atual; não pedir datas ou controles adicionais ao cliente para contornar a seleção do servidor.

O front corrigiu recuperação de falhas parciais e agora avisa quando a releitura não confirma os valores enviados. Sucesso HTTP/histórico não encerra esse bloqueio. Reteste atual substitui a conclusão anterior de persistência integral; a escrita opcional/null foi aceita, mas a consulta vigente precisa ser corrigida ou ter sua regra esclarecida. Nenhuma transação ou movimentação financeira foi realizada.

Após o reteste, dados fictícios originais restaurados pelo endpoint administrativo existente; consulta atual e registro mais recente conferidos com os valores iniciais. Isso não corrige nem encerra a divergência de seleção observada nas escritas do autosserviço. Front a41ae98 publicado na pipeline 39483544799 aprovada; aviso conferido em tela, sem campos/ações extras.


### Perfil — validações e estados do front, 20/10

Validação de data de nascimento futura/inexistente, limpeza de erro ao descartar e ausência falsa após erro no resumo foram corrigidas no frontend (ded785c/916fc56). Reutilizam regra de data do cadastro e os controles existentes; não requerem novo endpoint, campo ou regra de idade no backend. Não reabrir esses pontos como falta de contrato HTTP. Continuam abertos a seleção do financeiro vigente, campos/catálogos, contatos de confiança sem vínculo, aceite/envio final e regras/versionamento documentais já descritos.


Publicação final 916fc56 confirmada na pipeline 39486635711 aprovada, com 177 testes. Bloqueio de data futura e descarte retestados com a conta do usuário, preservando os valores originais e sem escrita cadastral. Nenhum novo bloqueio do backend foi introduzido nesta rodada; não encerra a divergência financeira vigente descrita acima.


### Sessões do perfil — apresentação e concorrência corrigidas no frontend, 20/10

1efe6c5 separa falha/carregamento de resultado vazio e impede erro de consulta antiga de sobrescrever resultado recente. Mantém endpoint, colunas e ações existentes; não exige contrato novo do backend. Casos de erro, troca de conta e retry cobertos automaticamente. Pendências de financeiro vigente, catálogos/campos, documentos e envio final permanecem nos itens próprios; este ajuste não as encerra.


Publicação final das sessões 587e4ba confirmada na pipeline 39487751656 aprovada (183 testes). Duas sessões reais da conta do usuário conferidas com IP mascarado; nenhuma revogada. Rodapé não informa contagem zero durante erro/loading; estado vazio e falhas cobertos automaticamente. Nenhuma nova solicitação ao backend nesta rodada.


### Catálogo bancário do perfil — paginação corrigida no frontend, 20/10

Endpoint existente retorna 513 bancos em 3 páginas. O front carregava apenas os primeiros 200. Correção 97f5e72 usa a paginação já fornecida no resumo e no Perfil Completo, sem novos campos ou ações. Não solicitar outro endpoint nem ampliar pageSize como contorno: o contrato atual é suficiente. Falha intermediária é erro da consulta, não lista vazia ou parcial. Pendências de financeiro vigente e demais itens anteriores permanecem independentes.

Nome de banco longo também causava overflow no formulário mobile; corrigido no frontend em 027257b, sem reduzir o conteúdo do catálogo nem acrescentar controles. Não é limite de nome ou de payload a ser imposto no backend.


Publicação final 027257b confirmada pela pipeline 39489262330 aprovada (189 testes). Reteste real mostrou banco da terceira página e ausência de overflow mobile; formulário cancelado e estado bancário original preservado. Nenhuma nova conta ou operação foi realizada. Não acrescenta bloqueio ao backend nem encerra os anteriores.


## Consolidação atual do perfil — 20/10

As correções conhecidas de frontend com contrato suficiente estão publicadas em 027257b; reteste de leitura confirmou conta própria, sessões reais, 100% documental e edição liberada. Não há nova solicitação ao backend nesta revisão. Foram retiradas marcações históricas ambíguas do checklist manual que ainda pareciam bloquear aprovação/reprovação, upload e desbloqueio já retestados.

Continuam abertos os contratos/configurações dos itens próprios: financeiro vigente, campos/catálogos, contatos sem vínculo extra, patrimônio, contexto dos termos, compartilhamento, envio/revisão cadastral e regras/versionamento documental. Swagger atual novamente consultado: consent context permanece string sem valores documentados; PublicProfileResponse contém apenas customerId/avatarUrl; não foi identificado catálogo dos seletores pessoais nem rota de patrimônio próprio que resolva as lacunas indicadas; o catálogo de preferências continua disponível. Não preencher o desenho com endpoints administrativos, valores inventados ou campos novos.

Foto válida continua dependência de dados para reteste; não justifica criar upload fora do Figma. A revalidação independente pelo QA segue necessária. Sem alteração de runtime ou novo deploy nesta revisão documental.


### Admin — precisão financeira e comparação de alterações, 20/10

0fe6f92/96ebd34 corrigem arredondamento no frontend e comparação de valores equivalentes. Contrato existente já aceita string decimal, portanto não requer campo ou endpoint adicional. Moeda/vigências preservadas fora da interface e os cinco campos do Figma mantidos. A divergência de seleção do financeiro vigente permanece separada e aberta; esta correção do envio não resolve a consulta do servidor.


Admin 96ebd34 publicado (pipeline 39497171684). Formatação/validação/descarte conferidos na ficha real; hash independente confirmou perfil profissional e histórico financeiro sem alterações. Precisão verificada no template real até o plano de envio em testes automatizados, sem enviar valores grandes à API. Não há novo pedido ao backend por essa correção; seleção do financeiro vigente e os demais contratos administrativos continuam abertos.


### Admin — concorrência da listagem corrigida no frontend, 20/10

00d601f impede resposta antiga de substituir consulta recente ao buscar/filtrar/trocar cartões e tabela. Erro e retentativa usam os componentes existentes; não há endpoint/campo novo solicitado ao backend. O problema era controle das leituras no frontend. Unicidade de e-mail no servidor e causa do incidente de identidade no login continuam abertos e não são encerrados por esse ajuste.


Admin 00d601f publicado pela pipeline 39498456402 aprovada. Busca/filtro, cartões/tabela, vazio e paginação real retestados sem escrita; mobile sem alargar a página. Correção de frontend encerrada nos limites descritos, sem nova dependência do backend e sem encerrar unicidade/HttpOnly/incidente de identidade.

## Esclarecimento 20/10 — catálogo bancário no Admin

O endpoint administrativo já retorna os 513 bancos ativos em três páginas. A leitura incompleta no perfil era um defeito do front e foi corrigida com paginação completa e erro/retentativa existentes; não é uma solicitação de nova API. Campos e ações do Figma foram preservados. As pendências contratuais listadas acima continuam abertas.

## Esclarecimento 20/10 — campos inteiros do patrimônio no Admin

A validação local de anos, quartos/banheiros, parcelas e prazo foi ajustada aos tipos int32 já publicados. Era um problema do frontend, sem necessidade de endpoint, campo ou regra adicional no backend. Dinheiro e áreas continuam decimais; pendências anteriores deste documento permanecem abertas.

## Esclarecimento 20/10 — nascimento no editor administrativo

A validação de data de nascimento impossível/futura foi corrigida no front do Admin, usando o mesmo campo e os estados de erro previstos. Não requer endpoint ou campo adicional. Campo opcional continua opcional; não foi criada regra de idade mínima. Pendências de escrita dos demais dados pessoais permanecem abertas.

## Esclarecimento 20/10 — listagem da configuração documental

O endpoint já devolve 30 tipos. O limite visual de cinco registros sem navegação era imposto pela tabela do front e foi removido, inclusive o corte interno da tabela de schemas sobre a página recebida. Não é solicitação de API, campos ou ações adicionais. Os bloqueios de módulos e estados listados acima permanecem.

## Esclarecimento 20/10 — busca do catálogo bancário

A busca da gestão de bancos filtrava somente a página visível. O front foi corrigido para consultar as páginas já disponíveis e buscar/paginar o resultado completo no mesmo controle. Não precisamos acrescentar parâmetro, campo ou ação ao backend para esse ajuste. Os bloqueios contratuais anteriores permanecem.

## Próximo lote do Admin — revisão do escopo original do QA

Não há outra correção independente do backend identificada nesta revisão dos itens originais 10–19. Isso não encerra a entrega: após receber os contratos/estados abaixo, ainda haverá integração do frontend conforme os mesmos campos e ações do Figma.

1. Estados/data de envio e análise cadastral, defaults e regras/vínculos documentais.
2. Escrita dos dados pessoais/documentos, segurança da conta e observações livres já desenhados.
3. Consulta do financeiro vigente e cálculo do contrato encerrado.
4. APIs/persistência de Lógicas, Crédito, Comunicados, Leads, Assessores e LP, para integrar os protótipos existentes.
5. Unicidade de e-mail; logs do incidente de identidade; sessão HttpOnly e autorização da API, seguidas da adaptação dos fronts.

Swagger atual conferido sem novas rotas; UpdateCustomerRequest permanece kind/birthDate. Revalidação independente do QA não é pendência de backend e está separada no checklist manual. Esta revisão não solicita nem autoriza campos ou ações fora do desenho.


## Reteste do envio/consentimentos — 22/10/2026

Consulta autenticada dos termos foi integrada na etapa 7, autorizada pelo usuário. Não solicitar mais consulta pública para este fluxo aprovado. Envio final e consentimentos possuem endpoints e integração; o teste integrado foi concluído após autorização explícita do usuário: envio, bloqueio, rejeição/desbloqueio, reenvio/novo bloqueio, aprovação/desbloqueio e nova sessão. Não há bloqueio de API confirmado nesses cenários. A preparação dos novos arquivos foi via API, sem homologar o controle de reenvio do perfil.

Pendência confirmada: na mesma conta client@example.com, GET /client/onboarding/status retorna requiredConsentsCompleted=true, enquanto GET /client/consents/requirements?context=Onboarding&locale=pt-BR retorna isSatisfied=false e os dois acordos Pending. Alinhar as projeções; o front já consulta a versão atual antes de enviar. Não acrescentar campos/ações para contornar a divergência.

RG/CNH/passaporte alternativos e moedas automáticas foram disponibilizados no retorno mais recente; as observações históricas anteriores sobre contratos ausentes não são a situação atual desses endpoints. Ver relatório QA-2026-10-22-ENVIO-CONSENTIMENTOS.md para o escopo e limites do reteste.

Após aceite real, a conta fictícia passou a retornar isSatisfied=true e ambos os termos Accepted, alinhados ao status. A divergência registrada acima foi observada antes desse aceite e permanece solicitação de alinhamento da projeção inicial/legada; não impede o fluxo integrado atualizado. Cookies e marketing permaneceram Pending.

Reteste da identificação alternativa concluído: somente RG aprovado completou 100% (1/1 requisito) e liberou o perfil, sem CNH/passaporte extra. A API já informa alternativeGroup=IDENTITY; a etiqueta individual equivocada era do front e foi corrigida. Não encaminhar essa etiqueta ou a antiga obrigatoriedade exclusiva da CNH como bug atual de API.


## Reenvio pelo perfil — 23/10/2026

Fluxo atual homologado: POST de substituição pelo upload do perfil preservou Front/Back e providedDocumentId. Após reenviar os dois lados, a aprovação única no Admin aprovou ambos; progresso 100%, onboarding Approved e edição liberada. Número mascarado, emissor/UF, datas, país e versão da identificação foram preservados. Não solicitar campos extras nem tratar esses dados como perdidos nesta rodada.

Pendência confirmada de histórico: antes da correção visual, substituir o arquivo rejeitado 9954cee1-cb83-4f8f-b354-84e6001561fb (provided-document antigo 60c4c5da-716d-48f2-91df-ecd176b9df8e) criou 7f1824b2-5502-4799-8f00-904e77364dd7 e fez progresso cair de 100% para 0%, onboarding UnderReview/lock=true. O perfil mantinha a identificação atual b532bff0-eac0-437c-b557-0bddc15fc091 com evidências aprovadas. Validar se a API deve rejeitar substituição de versão histórica e calcular progresso/onboarding apenas pela identificação vigente. O front passou a usar o perfil/overview atual e não oferece mais esse reenvio histórico. Não é necessário acrescentar campo ou ação ao desenho.

Detalhes e limites: QA-2026-10-23-REENVIO-PERFIL.md. Conta utilizada client@example.com, dados/arquivos fictícios; conta pessoal do usuário preservada.
