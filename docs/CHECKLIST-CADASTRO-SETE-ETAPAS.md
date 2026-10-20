# Cadastro de sete etapas — checklist de conclusão

Atualizado em 20/10/2026 após integração dos endpoints existentes. Figma BaDXlWpxbIoY4azOaQnXgv. Este registro substitui a situação anterior das prévias: publicar uma tela não significa homologar o cadastro completo.

## Situação atual por etapa

| Etapa | Implementado no front | Pendência real da API ou homologação |
| --- | --- | --- |
| 1 · Criar conta | POST /auth/register; nome, e-mail, senha e indicação; chave estável no retry; /register abre o fluxo Figma | Texto/versão e registro do aceite antes da autenticação; residência regional não identifica um país |
| 2 · Confirmar e-mail | Confirmação e reenvio reais; após confirmação usa login existente para continuar na etapa 3; sem senha em storage/URL | Ciclo com e-mail recebido ainda precisa de reteste manual; não é ausência de endpoint |
| 3 · Dados pessoais | GET/PATCH do perfil; nascimento, gênero, estado civil, uma nacionalidade e cidade; preserva dados externos à etapa | País de nascimento e múltiplas nacionalidades não existem no payload; catálogos dos seletores não disponibilizados |
| 4 · Documento e endereço | Endereço/filiação via PATCH; tipos/definições reais; upload e dados tipados para correspondências disponíveis; retry de arquivos sem duplicar upload concluído | Bairro separado, catálogo de estados/UF e tipos/esquemas das demais variantes; permissões/documentos de cliente novo precisam de reteste |
| 5 · Atividade trabalhista | GET/PUT profissional e financeiro; valores precisos em BRL; preserva vigências e empresa; datas iniciais na data de criação | Catálogo de atividade para novas escolhas; gravação com conta existente validada, criação sem perfil ainda precisa de reteste |
| 6 · Contatos de confiança | GET real e PUT de existentes preservando relationship/e-mail; valida todos antes de escrever | Inclusão exige relationship não presente no Figma; declaração de ausência sem operação de persistência |
| 7 · Revisão e envio | Revisa dados carregados da API e alterações locais; Editar por etapa; confirmação; consulta real de onboarding | Operação final/recibo de envio e revisão cadastral não identificados; Data Intake atual contém apenas formulários patrimoniais |

## Concluído neste lote

- [x] Preservar campos, composição, assets e ações existentes do Figma; retirar avisos globais de prévia das etapas integradas.
- [x] Usar clientApi, autenticação existente e idempotência; rotas 3–7 protegidas, com retorno à etapa após login.
- [x] Retomar pela API os dados suportados após recarga; manter rascunhos não salvos apenas em memória.
- [x] Preservar nomes/contatos/endereços secundários, metadados profissionais/financeiros e campos fora da seção.
- [x] Não inventar relacionamento, listas de opções, IDs de país/documento, conversão de moeda, aceite ou status de envio.
- [x] Guardar IDs de contatos existentes; não transformar edição em inclusão e não apagar contatos ao marcar ausência.
- [x] Tratar falha parcial mantendo rascunho; uploads confirmados reaproveitados em repetição e isolados por cliente.
- [x] Máscaras na revisão, sem senhas/códigos/nomes de arquivos no resumo; senha temporária descartada ao confirmar/sair do fluxo.
- [x] Criação e recebimento do código confirmados pelo usuário; sessão autenticada e acesso à etapa 3 observados em homologação. Leitura e registro versionado do aceite continuam pendentes.
- [ ] Retestar upload/dados tipados com arquivos descartáveis e conta nova após os requisitos cadastrais.
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
| 4 · Retomada dos campos | Logradouro/número voltam concatenados em line1; Número separado vazio. Bairro também não retorna; API não possui campo de bairro | Ajuste de adaptação do front para Número; bairro depende de contrato |
| 4 · Documento | Após endereço persistido, consulta documental negada com 403; repetição manteve o bloqueio. Nenhum arquivo foi enviado, CPF real ou sintético válido não foi gerado | Fluxo normal bloqueado aqui; causa/guard a confirmar com backend |
| 5 · Financeiro independente | Renda individual 1.234,56; familiar 2.345,67; bens 0 gravados em BRL. Conferidos em leitura da API e na revisão após recarga; negativo rejeitado localmente | Financeiro aprovado; atividade sem catálogo não homologada |
| 6 · Contato novo | Vazio rejeitado; contato fictício preservado na tela e não enviado porque falta relationship exigido pelo contrato | Inclusão bloqueada; nenhum parentesco inventado |
| 6 · Ausência | Abre revisão com aviso de declaração somente local; após recarga volta Não informado | Comportamento local conferido; persistência pendente |
| 7 · Revisão/envio | Dados suportados da API reaparecem; confirmação obrigatória funciona; ação final consulta status e informa ausência de envio cadastral confirmado, sem tela de sucesso/status inventado | Revisão parcial aprovada; envio para análise não homologado |

**Limite da rodada:** o fluxo sequencial parou na etapa 4. As etapas 5–7 foram acessadas separadamente para testar operações independentes já autorizadas; isso não contorna o guard documental e não aprova o cadastro de ponta a ponta. Nenhuma permissão, aprovação documental, verificação, depósito ou status foi alterado pelo Admin.

**Ajuste do front identificado:** separar corretamente Logradouro e Número na retomada do endereço gravado em line1. Não foi classificado como erro do backend nem marcado aprovado. Consulta automática de CEP continua indisponível no front; não houve requisição postal nesta rodada, portanto não foi registrada como falha HTTP nova.

Os dados fictícios pessoais, endereço/filiação e financeiro desta rodada permaneceram na conta de homologação para reteste. Contato fictício e rascunho documental não foram persistidos; nenhum arquivo pessoal foi enviado e nenhuma conta adicional foi criada. Evidências detalhadas no portal: docs/QA-2026-10-20-CADASTRO-CONTA-NOVA.md.
