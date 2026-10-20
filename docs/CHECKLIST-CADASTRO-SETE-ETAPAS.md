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
- [ ] Retestar criação → recebimento de e-mail → confirmação com usuário responsável pelo código/aceite legal.
- [ ] Retestar upload/dados tipados com arquivos descartáveis e conta nova após os requisitos cadastrais.
- [ ] Homologar inclusão de contatos, ausência persistida e envio final após correção/confirmação dos contratos.
- [ ] Aprovação completa pelo QA: continua aberta; integração parcial não equivale a cadastro concluído de ponta a ponta.

## Pendências exclusivas do backend

Somente as incompatibilidades descritas no [documento consolidado](PENDENCIAS-BACKEND-QA.md#cadastro-de-sete-etapas--pendências-reais-após-integração-2010). Cadastro, confirmação, perfil, arquivos, dados profissionais/financeiros, contatos e status já possuem endpoints; não devem ser solicitados novamente como ausentes.

As rotas /cadastro/etapa-1 a /cadastro/etapa-7 estão no build. /cadastro/enviado continua sendo referência visual identificada; não é exibida como sucesso sem confirmação do servidor. Evidências atuais no portal: docs/QA-2026-10-20-CADASTRO-INTEGRADO.md. Registros anteriores de telas ficam nos documentos por etapa.

## Publicação e conferência integrada

Portal b163763 publicado em homologação; pipeline 39444891206 com lint, 117 testes, build, upload e ativação aprovados. Integração principal em 388175f. Em hml.strategyanalytics.com.br, Cláudio entrou com retorno à etapa 5, regravou profissional/financeiro mantendo os valores e avançou à etapa 6. Etapa 3 gravou cidade de teste; a versão final limpou o campo pelo próprio formulário e a recarga da revisão confirmou a persistência da limpeza. Dados financeiros permaneceram disponíveis após recarga. Dado temporário restaurado. Ciclo de e-mail/aceite e upload de arquivos novos continuam como retestes não executados, separados das incompatibilidades reais da API.
