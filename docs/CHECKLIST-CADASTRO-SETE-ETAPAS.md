# Cadastro de sete etapas — checklist de conclusão

Atualizado em 20/10/2026 após a mudança de ordem e campos autorizada pelo designer/QA e confirmada pelo usuário. **Ordem vigente: etapa 4 profissional/financeiro/moedas; etapa 5 documentos/endereço.** As rodadas anteriores abaixo registram a sequência anterior. Figma BaDXlWpxbIoY4azOaQnXgv. Este registro substitui a situação anterior das prévias: publicar uma tela não significa homologar o cadastro completo.

## Situação atual por etapa

| Etapa | Implementado no front | Pendência real da API ou homologação |
| --- | --- | --- |
| 1 · Criar conta | POST /auth/register; nome, e-mail, senha e indicação; chave estável no retry; /register abre o fluxo Figma | Texto/versão e registro do aceite antes da autenticação; residência regional não identifica um país |
| 2 · Confirmar e-mail | Confirmação e reenvio reais; após confirmação usa login existente para continuar na etapa 3; sem senha em storage/URL | Criação/código confirmados pelo usuário e sessão na etapa 3 observada; aceite versionado continua pendente |
| 3 · Dados pessoais | GET/PATCH do perfil; nascimento, gênero, estado civil, uma nacionalidade e cidade; preserva dados externos à etapa | País de nascimento e múltiplas nacionalidades não existem no payload; catálogos dos seletores não disponibilizados |
| 4 · Atividade trabalhista e moedas | Ocupação obrigatória em texto livre; Empregador opcional; rendas/bens; duas moedas do catálogo. PUT profissional e financeiro + PATCH preferências antes de avançar | Criação profissional, moedas e financeiro validados na conta nova; ocupação não exige catálogo. Defaults de idioma/fuso/tema ausentes ainda exigiriam alinhamento |
| 5 · Documento e endereço | Endereço/filiação, CEP, tipos/definições e serviços documentais existentes. Entrada exige profissional/financeiro e moedas; links antigos e retomada migrados | Upload, aprovação, reprovação/motivo e reenvio RG validados; vínculo de substituição/metadados continuam parciais. Retomada de número mascarado/emissor/datas e indicação de evidências corrigidas e validadas em homologação; bairro, UF e outros países continuam parciais |
| 6 · Contatos de confiança | GET real e PUT de existentes preservando relationship/e-mail; valida todos antes de escrever | Inclusão exige relationship não presente no Figma; declaração de ausência sem operação de persistência |
| 7 · Revisão e envio | Revisa dados carregados da API e alterações locais; Editar por etapa; confirmação; consulta real de onboarding | Operação final/recibo de envio e revisão cadastral não identificados; Data Intake atual contém apenas formulários patrimoniais |

## Concluído neste lote

- [x] Preservar campos, composição, assets e ações existentes do Figma; retirar avisos globais de prévia das etapas integradas.
- [x] Usar clientApi, autenticação existente e idempotência; rotas 3–7 protegidas, com retorno à etapa após login.
- [x] Retomar endereço/filiação e dados profissionais/financeiros pela API após recarga; manter rascunhos não salvos apenas em memória. Retomada documental por número mascarado/emissor/datas concluída no lote beb01b2; número integral não é retornado pela API de perfil.
- [x] Preservar nomes/contatos/endereços secundários, metadados profissionais/financeiros e campos fora da seção.
- [x] Não inventar relacionamento, listas de opções, IDs de país/documento, conversão de moeda, aceite ou status de envio.
- [x] Guardar IDs de contatos existentes; não transformar edição em inclusão e não apagar contatos ao marcar ausência.
- [x] Tratar falha parcial mantendo rascunho; uploads confirmados reaproveitados em repetição e isolados por cliente.
- [x] Máscaras na revisão, sem senhas/códigos/nomes de arquivos no resumo; senha temporária descartada ao confirmar/sair do fluxo.
- [x] Criação e recebimento do código confirmados pelo usuário; sessão autenticada e acesso à etapa 3 observados em homologação. Leitura e registro versionado do aceite continuam pendentes.
- [x] Retestar upload RG Brasil/dados tipados com dois arquivos fictícios na conta nova após os requisitos cadastrais; vínculo confirmado pela leitura administrativa. Outros tipos/países e aprovação não homologados.
- [ ] Homologar inclusão de contatos, ausência persistida e envio final após correção/confirmação dos contratos.
- [ ] Aprovação completa pelo QA: continua aberta; integração parcial não equivale a cadastro concluído de ponta a ponta.

## Pendências exclusivas do backend

Somente as incompatibilidades descritas no [documento consolidado](PENDENCIAS-BACKEND-QA.md#cadastro-de-sete-etapas--pendências-reais-após-integração-2010). Cadastro, confirmação, perfil, arquivos, dados profissionais/financeiros, contatos e status já possuem endpoints; não devem ser solicitados novamente como ausentes.

As rotas /cadastro/etapa-1 a /cadastro/etapa-7 estão no build. /cadastro/enviado continua sendo referência visual identificada; não é exibida como sucesso sem confirmação do servidor. Evidências atuais no portal: docs/QA-2026-10-20-CADASTRO-INTEGRADO.md. Registros anteriores de telas ficam nos documentos por etapa.

## Publicação e conferência integrada

Portal b163763 publicado em homologação; pipeline 39444891206 com lint, 117 testes, build, upload e ativação aprovados. Integração principal em 388175f. Em hml.strategyanalytics.com.br, Cláudio entrou com retorno à etapa 5, regravou profissional/financeiro mantendo os valores e avançou à etapa 6. Etapa 3 gravou cidade de teste; a versão final limpou o campo pelo próprio formulário e a recarga da revisão confirmou a persistência da limpeza. Dados financeiros permaneceram disponíveis após recarga. Dado temporário restaurado. Ciclo de e-mail/aceite e upload de arquivos novos continuam como retestes não executados, separados das incompatibilidades reais da API.

## Teste acompanhado com conta pessoal — 20/10

Solicitado pelo usuário com seu e-mail; endereço integral omitido do repositório. Estado desta rodada: etapa 1 preparada em homologação, ainda sem submissão.

- [x] /cadastro/etapa-1 abriu no ambiente publicado, preservando campos e ações do Figma.
- [x] Nome/e-mail preenchidos na tela, sem transmitir senha, aceite ou cadastro.
- [!] Leitura dos Termos de Uso e da Política de Privacidade indisponível: os dois botões exibem aviso de texto/versão não disponibilizados. Pendência já consolidada do backend/configuração. O aviso da interface não foi confundido com uma nova chamada HTTP.
- [ ] Definir residência e senha pelo próprio usuário e decidir sobre o aceite na tela. Participação necessária pelas regras de controle do navegador; não é bug nem pendência do backend.
- [ ] Submeter criação e confirmar resultado; envio/recebimento do código ainda não testados nesta conta.
- [ ] Confirmar e-mail com o usuário, validar sessão e continuar nas etapas permitidas.
- [ ] Registrar dados pessoais, endereço/documentos, profissional/financeiro, contatos e revisão desta conta conforme resultados reais. Nenhuma dessas etapas foi aprovada antecipadamente.

A tela ficou aberta para participação do usuário. Não foi criada conta nem solicitado código nesta preparação. Não foram inventados dados pessoais, residência, patrimônio ou arquivos para o e-mail real do usuário.

## Continuação do teste acompanhado — conta nova, 20/10

O usuário concluiu a criação e confirmou recebimento do código. Autorizou dados fictícios sem documentos pessoais reais. Sessão autenticada na etapa 3 e vínculo com a conta solicitada conferidos; nenhum e-mail integral, senha, código ou identificador pessoal foi incluído neste registro. Esta seção substitui a situação de preparação acima.

| Etapa/cenário | Resultado observado | Situação |
| --- | --- | --- |
| 1–2 · Criação, código e sessão | Criação/recebimento relatados pelo usuário; continuação autenticada na etapa 3 e cliente correspondente consultado, sem contornar permissões | Aprovado para o que foi observado; aceite versionado não homologado |
| 3 · Validações locais | Data impossível rejeitada com erro/foco; data válida aceita | Aprovado |
| 3 · Gravação e retomada | Nascimento e cidade fictícios persistiram e reapareceram após recarga | Aprovado nesses campos |
| 3 · Seletores | Gênero, estado civil e nacionalidade sem opções; países Brazil/Portugal disponíveis. País de nascimento selecionado não reapareceu após recarga, conforme lacuna do payload | Parcial; catálogos e campo de nascimento pendentes |
| 4 · Endereço e filiação | Endereço residencial, país e filiação fictícios gravados; retorno pela API confirmado. Endereço também conferido em consulta administrativa somente leitura | Gravação parcial aprovada |
| 4 · Retomada dos campos | Número corrigido no adaptador e retestado após recarga na conta do usuário; Logradouro e Número separados. Bairro continua sem campo próprio na API | Número aprovado em homologação; bairro depende de contrato |
| 4 · Documento | Após endereço persistido, consulta documental negada com 403; repetição manteve o bloqueio. Nenhum arquivo foi enviado, CPF real ou sintético válido não foi gerado | Fluxo normal bloqueado aqui; causa/guard a confirmar com backend |
| 5 · Financeiro independente | Renda individual 1.234,56; familiar 2.345,67; bens 0 gravados em BRL. Conferidos em leitura da API e na revisão após recarga; negativo rejeitado localmente | Financeiro aprovado; atividade sem catálogo não homologada |
| 6 · Contato novo | Vazio rejeitado; contato fictício preservado na tela e não enviado porque falta relationship exigido pelo contrato | Inclusão bloqueada; nenhum parentesco inventado |
| 6 · Ausência | Abre revisão com aviso de declaração somente local; após recarga volta Não informado | Comportamento local conferido; persistência pendente |
| 7 · Revisão/envio | Dados suportados da API reaparecem; confirmação obrigatória funciona; ação final consulta status e informa ausência de envio cadastral confirmado, sem tela de sucesso/status inventado | Revisão parcial aprovada; envio para análise não homologado |

**Limite da rodada:** o fluxo sequencial parou na etapa 4. As etapas 5–7 foram acessadas separadamente para testar operações independentes já autorizadas; isso não contorna o guard documental e não aprova o cadastro de ponta a ponta. Nenhuma permissão, aprovação documental, verificação, depósito ou status foi alterado pelo Admin.

**Ajuste do front corrigido em 20/10:** Logradouro e Número agora são retomados separadamente do endereço gravado em line1. Reteste em homologação aprovado conforme registro abaixo; não é pendência do backend. Consulta automática de CEP continua indisponível no front; não houve requisição postal nesta rodada, portanto não foi registrada como falha HTTP nova.

Os dados fictícios pessoais, endereço/filiação e financeiro desta rodada permaneceram na conta de homologação para reteste. Contato fictício e rascunho documental não foram persistidos; nenhum arquivo pessoal foi enviado e nenhuma conta adicional foi criada. Evidências detalhadas no portal: docs/QA-2026-10-20-CADASTRO-CONTA-NOVA.md.

## Reteste — retomada do Número corrigida, 20/10

- [x] Correção somente no adaptador de leitura, sem mudar campos, ações, layout ou assets do Figma. Variantes sem Número separado continuam com endereço integral.
- [x] 121 testes, lint, build e diff do lote aprovados. Regressão cobre regravação sem duplicar o número, vírgulas no logradouro, sufixos/zero/s/n, linhas sem número e preservação das outras variantes.
- [x] Portal fdb07ab publicado; pipeline 39449807714 concluiu upload e ativação com sucesso.
- [x] Conta do usuário conferida em nova aba com a mesma sessão: Logradouro Rua Fictícia de Homologação e Número 100 separados. Voltar à revisão, Editar Endereço e recarga da página preservaram a separação.
- [x] Nenhum formulário foi enviado no reteste. Comparação das leituras administrativas antes/depois confirmou que o endereço salvo não mudou.
- [x] Aba original com dados/documentos e arquivos ainda não enviados preservada, sem recarregar ou perder o rascunho. Evidência visual inclui somente os campos do endereço necessários para a correção.

A regravação sem duplicar Número foi validada por testes automatizados, sem reenviar dados/documentos da conta real pelo Continuar. O 403 documental, bairro, catálogos e as demais pendências do backend continuam abertos; esta aprovação é somente da retomada do Número. Evidência técnica no portal: docs/QA-2026-10-20-CADASTRO-NUMERO-ENDERECO.md.

## Revisão do QA — falhas parciais e celular, 20/10

- [x] Corrigida perda de rascunhos ao abrir a revisão quando a leitura profissional/financeira ou dos contatos falha. Somente respostas bem-sucedidas hidratam cada grupo; renda zero real continua zero.
- [x] Na mesma linha do resumo, consulta com falha é indicada como indisponível, sem ser confundida com Não informado. Sem campos, botões ou seções adicionais.
- [x] Erros simultâneos ficam no aviso existente; recuperar a consulta limpa o aviso e preserva as edições dos grupos já carregados.
- [x] 126 testes, lint e build aprovados; falhas e recuperação cobertas pelo composable real com serviços simulados, sem provocar falhas na API de homologação.
- [x] Revisão conferida no navegador local 9010 em desktop e viewport efetivo de 390 px. Cinco grupos e Editar preservados; sem overflow horizontal. Enviar sem confirmação mantém a etapa, mostra erro e foca o checkbox; nenhuma escrita realizada.

### Próximos itens do front e retestes

- [x] Preenchimento por CEP Brasil implementado e testado com a consulta existente, preservando campos manuais, Número/Complemento e o desenho. Ver lote de CEP abaixo.
- [x] Retomada da última etapa no mesmo navegador implementada por usuário, com dados suportados recarregados da API; saída/novo login e troca de conta conferidos localmente. Ver lote de retomada abaixo; progresso entre dispositivos e rascunho completo continuam pendentes.
- [ ] Reexecutar upload, contatos novos e envio final somente após alinhamento dos bloqueios documentados; esses cenários continuam sem aprovação integrada.

Detalhes do lote: Strategy-analytics-v2/docs/QA-2026-10-20-CADASTRO-FALHAS-PARCIAIS.md. Este ajuste é do frontend e não entra na tabela de bugs do backend. A homologação completa do cadastro e dos 19 itens do QA permanece aberta.

### Publicação deste lote

Portal 8784ab8 publicado; pipeline 39452089997 concluída com lint/testes/build/upload/ativação aprovados. Conferência somente leitura em hml.strategyanalytics.com.br/cadastro/etapa-7, na sessão da conta do usuário: cinco grupos presentes, dados pessoais/endereço retomados e renda individual 1.234,56, familiar 2.345,67 e bens 0 disponíveis. Nenhum envio ou escrita feito nesta conferência; aba original documental preservada. Não foi reproduzida falha de rede no servidor para obter evidência visual artificial.

## Etapa 4 — preenchimento automático por CEP, 20/10

- [x] Reutilizar validator-cep do cadastro antigo por serviço compartilhado; consulta pública sem cookies/tokens, sem endpoint novo nem chamada documental.
- [x] Ao sair do CEP válido, preencher Logradouro, Bairro, Cidade e Estado; preservar Número/Complemento. Máscara/teclado numérico no campo existente, sem novas ações.
- [x] CEP inválido/inexistente, resposta incompleta e falha deixam preenchimento manual disponível; erro no campo e retry ao sair novamente. Não apagar rua/bairro ausentes de CEP genérico.
- [x] Ignorar resposta antiga após troca de CEP/saída; preservar campos editados durante a consulta; evitar blur repetido sobrescrevendo correção manual.
- [x] 135 testes, lint/build e diff do lote aprovados. Consulta real em 9010 preencheu endereço do CEP público 01001-000; CEP 99999-999 mostrou erro sem apagar os campos e recuperação funcionou.
- [x] Desktop/celular 390 px conferidos sem overflow; nenhuma alteração no perfil ou arquivo enviado pelo teste. Aba original com documentos/rascunho preservada.

A consulta fornece Bairro para o rascunho, mas a persistência continua sem campo próprio no contrato. Não resolve UF de expedição, 403 documental ou envio final. Próximo item do front: retomada da etapa após novo login. Evidências no portal: docs/QA-2026-10-20-CADASTRO-CEP.md.

### Publicação e reteste do CEP em homologação

Portal aae0e31 publicado; pipeline 39453639953 concluiu lint, 135 testes, build, upload e ativação com sucesso. Na sessão da conta do usuário, em nova aba de hml.strategyanalytics.com.br/cadastro/etapa-4/br?review=1, o CEP público 01001-000 preencheu Praça da Sé, Sé, São Paulo e Estado São Paulo; Número 100 e Complemento Unidade de teste foram preservados. Teste somente no rascunho: nenhum Continuar, PATCH cadastral, documento ou envio final. Aba original com documentos não enviados preservada. CEP concluído no front; próximo item permanece retomada após novo login.

## Retomada após sair e fazer login — 20/10

- [x] Login comum e Login com sessão válida retomam a última rota autenticada visitada, limitada às etapas 3–7 e variantes existentes da etapa 4. Nenhuma tela/ação/campo novo.
- [x] Marcador contém somente rota por usuário autenticado. Home e logout preservam; navegação cancelada/anônima/fora do cadastro não sobrescreve. Conta sem marcador entra na Home.
- [x] Não guardar e-mail, senha, código, token, dados pessoais/financeiros, arquivos ou aceite no marcador. Storage indisponível/corrompido não quebra o login.
- [x] Depois de novo login, descartar rascunhos da sessão anterior e consultar os dados suportados da API, inclusive para o mesmo cliente; refresh normal não é tratado como outro login. Escrita de uma aba de sessão antiga exige recarga.
- [x] 145 testes, lint/build e diff do lote aprovados; incluem autenticação/router reais com serviços simulados, isolamento de contas e dados da sessão anterior.
- [x] Local 9010, no Edge: Cláudio abriu etapa 5, saiu pela ação existente e fez login em /login sem next. Retornou à etapa 5 com Analista e valores salvos 12.000/18.000/450.000. Logout/login de Éric abriu Home sem herdar o marcador.

**Limites:** concluída a retomada de rota no mesmo navegador/origem. Não equivale a autosave de todo o formulário, retomada em outro dispositivo ou cadastro enviado. Campos não gravados e arquivos não são guardados em storage; sem marcador anterior, o front não inventa a etapa. O status atual do backend não retorna etapa atual/rascunho nem confirmação de envio para encerrar o fluxo. Esses contratos continuam pendentes; reteste documental ainda depende da liberação do 403. Detalhes no portal: docs/QA-2026-10-20-CADASTRO-RETOMADA.md.

### Publicação e reteste da retomada em homologação

Portal 4a4076b publicado; pipeline 39455314973 concluiu lint, 145 testes, build, upload e ativação com sucesso. No Edge, Cláudio abriu etapa 4/br; reabrir /login com sessão válida retornou à mesma etapa. Depois, Home → Sair pela ação existente → /login sem next → novo login retornou automaticamente à etapa 4/br, com endereço/complemento/cidade/Estado recarregados da API. Nenhum Continuar, alteração cadastral, arquivo, aceite ou envio final realizado. Sessão e aba original do usuário no navegador integrado preservadas, sem logout/recarga nessa aba. Evidência visual salva somente do cabeçalho da etapa retomada.

Retomada no mesmo navegador aprovada; autosave completo, progresso entre dispositivos e envio/revisão permanecem abertos conforme os limites acima. Não aprova o cadastro de ponta a ponta nem remove o bloqueio documental.

## Ordem e campos autorizados pelo designer/QA — 20/10

O usuário confirmou a inversão das etapas e aprovou explicitamente os quatro campos Ocupação, Empregador (opcional), Moeda principal e Moeda secundária, mantendo as três informações financeiras existentes. Esta autorização altera a sequência anterior do Figma; componentes, cores e Voltar/Continuar preservados.

1. Criar conta.
2. Confirmar e-mail.
3. Dados pessoais.
4. Atividade trabalhista: Ocupação, Empregador opcional, renda individual, renda familiar, bens, moeda principal e secundária.
5. Documento e endereço por país.
6. Contatos de confiança.
7. Revisão e envio.

- [x] Ocupação como texto livre obrigatório, compatível com occupation string no OpenAPI; não depende de catálogo ausente. Empresa opcional nullable, sem vigência/status técnico na tela.
- [x] Continuar salva profissional, financeiro e preferências com as duas moedas do catálogo real; só depois entra em documentos. Preserva país/idioma/fuso/tema e metadados profissionais/financeiros, sem defaults fictícios.
- [x] Falha mantém etapa/rascunho. Retry não repete partes idênticas já confirmadas; valores financeiros ausentes continuam null e zero explícito preservado.
- [x] Etapas, Voltar/Continuar, Editar na revisão, links antigos com variante e retomada por usuário ajustados. Marcadores v1 de documentos 4/trabalho 5 migram para 5/4. Documentos sem pré-requisitos retornam à etapa 4.
- [x] 152 testes, lint/build e diff do lote aprovados; ocupação vazia com erro/foco conferida em 9010, sem escrita. Desktop/390 px sem overflow e composição com os sete campos aprovada no reteste visual.

**Devolutiva do backend incorporada:** o 403 era ProfileIncomplete pela falta de profissional, não ausência de endpoint nem defeito de autorização confirmado. A sequência anterior tentava documentos antes de criar o profissional. Moedas vazias também passam a ser tratadas no front. Reteste publicado e limites abaixo; upload e envio final não são aprovados por esta mudança.

### Publicação e reteste integrado da nova ordem

- [x] Portal 46d5bc5 publicado; pipeline 39468374725, tentativa 2, concluiu lint, 152 testes, build, upload e ativação. A primeira tentativa de upload teve timeout SSH; a repetição concluiu. Ajuste do isolamento VM dos testes eliminou a queda do Node na pipeline, com a mesma suíte aprovada também em Node 20.20.2 local, sem remover testes/assertivas.
- [x] Local 9010 com API de homologação, Cláudio: regravados os valores fictícios existentes, profissional/financeiro/preferências concluídos e avanço para Documento/endereço na nova etapa 5. Voltar abriu etapa 4; recarga confirmou os valores da API. Nenhuma transação financeira/documento.
- [x] Na conta nova do usuário, em nova aba de homologação: Ocupação Analista de testes, Empregador Empresa Fictícia QA, BRL e USD selecionados e salvos; rendas 1.234,56/2.345,67 e bens 0 preservados. Após a gravação dos três serviços, avançou à etapa 5. Recarga posterior da etapa 4 confirmou todos esses valores pela API. E-mail integral omitido.
- [x] Repetido o cenário que retornava 403: Continuar na etapa 5 salvou endereço/filiação fictícios e a consulta de tipos passou; a mensagem foi Endereço salvo. Selecione os arquivos do documento para concluir esta etapa. Essa mensagem só é alcançada após obter os tipos e localizar o tipo esperado; ProfileIncomplete não voltou nesse cenário. Nenhum CPF, arquivo ou documento tipado foi enviado.
- [x] Home da mesma conta mostrou saldos R$ 0,00 / USD 0.00, Sua jornada começa aqui e Você ainda não tem contratos, sem PreferencesRequired. Não houve depósito, saque, transferência, contrato ou mudança de permissões.
- [x] Prévia em PNG da tela real salva para compartilhar com designer/QA, com os dados fictícios. Nova aba publicada mantida; aba original com arquivos/rascunho não enviados preservada, sem recarga/logout.

**Concluído neste cenário:** ordem profissional antes dos documentos e preenchimento das moedas; consulta documental e Home liberadas pelos requisitos reais, sem bypass do guard. **Ainda não homologado:** upload/documento tipado, conclusão das etapas pendentes e envio/revisão final. As demais lacunas de contrato continuam no documento do backend.


## Etapa 5 — envio de arquivos fictícios em homologação, 20/10

Teste na conta do usuário, na versão publicada 46d5bc5, preservando o layout aprovado. Dois PNGs novos, identificados como ARQUIVO FICTÍCIO / HOMOLOGAÇÃO / SEM VALIDADE COMO DOCUMENTO, sem fotografia, CPF ou documento pessoal real. A aba antiga com arquivos do usuário permaneceu intacta.

- [x] Etapa 4 com profissional/financeiro/moedas já salvos avançou à etapa 5 normalmente.
- [x] Número QA-TESTE-0001, emissor ORGAO TESTE QA e expedição 01/01/2025 preenchidos no formulário existente; CPF permaneceu vazio. Não foram gerados identificadores pessoais válidos.
- [x] Frente e verso selecionados pelo seletor real de arquivos: documento-teste-frente.png (16.471 bytes) e documento-teste-verso.png (16.420 bytes).
- [x] Continuar salvou endereço/filiação fictícios, consultou tipos/definição, concluiu os dois uploads e o documento tipado, avançando à etapa 6 — Contatos de confiança. Nenhuma negativa de API apareceu; o 403 anterior não se repetiu.
- [x] Leitura administrativa independente confirmou exatamente dois documentos RG/BR com status Uploaded; arquivos image/png, Private e Available, tamanhos correspondentes aos selecionados. Identificação confirmou um RG de origem ProvidedDocument, registro Active, data/emissor de teste e evidenceSummary.count = 2, latestStatus = Uploaded. Active é estado do registro tipado, não aprovação das evidências.
- [x] Voltar à etapa 5 preservou o rascunho em memória. Recarga confirmou endereço, Número 100, Complemento e filiação; os arquivos locais não são persistidos pelo navegador.
- [x] Retomada documental corrigida no lote beb01b2 abaixo. Evidência anterior: após recarga Número do documento, Órgão emissor e Data de expedição voltaram vazios, embora o RG e as duas evidências existam no servidor. Atribuição ainda depende de confrontar o contrato de leitura do cliente com a adaptação do front; não classificar automaticamente como defeito do backend. Não repetido o envio após recarga, para evitar duplicação.
- [x] Texto do front corrigido no lote beb01b2 abaixo. Evidência anterior ao ajuste: os arquivos já enviados ainda mostravam Selecionado localmente, ainda não enviado. Corrigir a apresentação do estado no componente existente, sem novas ações/campos. Não é bloqueio da API.
- [!] UF de expedição continuou sem opções; não foi inventado valor. A definição atual permitiu RG sem UF (issuerState retornou null). Portanto a falta de catálogo é lacuna para completar esse campo do desenho, mas não bloqueou este envio.

**Resultado:** envio RG Brasil e vínculo das duas evidências aprovados nesta conta. Não houve bloqueio atual do backend nesse percurso. Nenhuma aprovação/reprovação, criação de contato, aceite ou envio final foi executado. Outros documentos/países e o cadastro de ponta a ponta permanecem sem homologação. Evidência visual: cadastro-etapa-5-envio-concluido.png, mostrando o avanço à etapa 6. Nenhuma alteração de código/layout foi feita nesta rodada; os dois pontos de retomada/apresentação acima continuam abertos.


## Retomada documental e texto de envio — correção publicada, 20/10

Portal beb01b2 publicado em homologação; pipeline 39471786647 aprovada em lint, 158 testes, build, upload e ativação. Os dois defeitos identificados no reteste anterior foram tratados no frontend, sem alterar composição, campos, ações ou CSS da tela aprovada.

- [x] Hidratar campos existentes pela identificação documental do perfil: número mascarado, emissor, UF salva e expedição/validade no formato da variante. Respeitar país, registro Active/ProvidedDocument e tipo suportado; não escolher registro quando há ambiguidade. A retomada não recupera nem persiste arquivos locais ou número integral em storage.
- [x] Número protegido não é enviado como número real. Documento vigente e evidências suficientes, sem edição, permitem Continuar sem novo upload ou PUT documental. Para alterar/reenviar com número mascarado, exigir número completo no mesmo campo, pela mensagem existente; não tentar obter dados administrativos integrais.
- [x] Remover ainda não enviado. Arquivo novo selecionado é identificado como selecionado para envio; recibo local confirmado permite Arquivo enviado. Após abrir novamente, o resumo real da API mostra Há arquivos enviados para este documento nos slots existentes, sem inventar qual evidência corresponde à frente ou verso, nome local, aprovação ou permissão.
- [x] Na conta do usuário, versão publicada carregada e Voltar da etapa 6 reabriu a etapa 5 com número mascarado terminado em 0001, emissor ORGAO TESTE QA e expedição 01/01/2025. Nova aba independente na mesma sessão confirmou a mesma retomada pela API e as duas indicações de arquivos enviados, sem arquivos selecionados localmente.
- [x] Continuar nessa aba avançou realmente à etapa 6. Consulta administrativa somente de leitura confirmou os mesmos dois IDs de anexos do teste anterior, um único RG e duas evidências; não houve upload duplicado nem máscara gravada como dado documental. Endereço/filiação fictícios foram regravados pelo fluxo existente.
- [x] Recarga completa final na mesma aba confirmou novamente número mascarado/emissor/expedição e resumo das evidências. Desktop e celular 390 px conferidos, sem overflow horizontal; override de viewport removido ao terminar.
- [x] Revisão da composição existente e evidência visual da versão publicada: cadastro-documentos-retomada-hml.png. Aba antiga do usuário com rascunhos pessoais preservada. Nenhum contato, aprovação, aceite ou envio cadastral final executado.

**Pendências reais restantes:** catálogos/UF não gravada anteriormente, bairro, tipos/países adicionais, contatos e envio/revisão final conforme documento consolidado. Número integral não retornado pela API de perfil é uma proteção do contrato; a retomada usa a máscara. Não cobrar novamente o 403 superado, upload RG ou esses dois ajustes do frontend como bloqueios atuais.


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
