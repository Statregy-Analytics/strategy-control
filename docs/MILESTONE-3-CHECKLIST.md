# Marco 3 — implementação frontend

## Correção de sessão — 12/11, 22h

[Incidente e testes](QA-2026-11-12-REVISAO-CONSOLIDADA-FRONT.md#correção-do-incidente-de-sessão--1211-22h): o refresh do Admin omitia Idempotency-Key e a API retornava 400 idempotency.key_required. Cabeçalho corrigido e renovação 401 → refresh 200 → consultas 200 validada com Axios real/API para Éric e Admin. Versão 9c47bb4 publicada, 241 testes versionados e deploy aprovados; login/seleção/recarga conferidos no navegador. Falha de front corrigida, sem nova pendência de API. O 403 de Éric/Cliente na consulta administrativa permanece uma questão distinta de autorização.

## Entrega consolidada de 12/11

A [matriz única de frontend](QA-2026-11-12-REVISAO-CONSOLIDADA-FRONT.md) reúne correções, testes, evidências anteriores e limites atuais. As seções datadas abaixo são histórico; não reenviar endpoints já entregues como novas pendências. Esta rodada corrige sessão temporariamente indisponível e abertura de documentos no Admin, preservando templates/estilos/campos/ações. Bloqueios de API, massa e decisões de produto estão separados na matriz.

## Revisão de 12/11 — Documentação e prévias dos editores

[Checklist e evidências](QA-2026-11-12-PERFIL-PREVIAS-DOCUMENTOS.md). Corrigida abertura tardia em Documentação, galeria de anexos e edição de imóvel, incluindo falha/retry, clique duplicado, sessão antiga e reserva pendente ao sair. Os três pontos reutilizam a mesma proteção; templates/estilos/ações preservados. Versão 118fd8b publicada; 18 verificações controladas e oito integradas em homologação, destinos 200 e vínculo temporário removido. 25 novos testes e 420 testes totais, lint/build aprovados. Nenhum endpoint novo necessário; bloqueios anteriores de API continuam separados.

## Revisão de 12/11 — abertura de documentos do patrimônio

[Checklist e evidências](QA-2026-11-12-PATRIMONIO-DOCUMENTOS-ABERTURA.md). Corrigida abertura após URL lenta, popup bloqueado, limpeza de erro na nova tentativa e reserva pendente ao sair/trocar sessão. Versão 82faebd publicada, oito verificações controladas e seis integradas em homologação com Éric/Cláudio, sem erro HTTP/JavaScript. Template/estilos/ações preservados; oito testes específicos e 395 testes totais, lint/build aprovados. Nenhum endpoint novo necessário; bloqueios anteriores de API continuam separados.

## Revisão de 12/11 — lista de contratos e paginação

[Checklist e evidências](QA-2026-11-12-LISTA-CONTRATOS.md). Corrigidas consulta duplicada ao reiniciar a página, página que deixou de existir e respostas após sair/trocar sessão. Corrigido também o caminho da fonte Roboto existente. Versão cf84cfc publicada; 11 verificações controladas e três contas reais em homologação, sem erro HTTP/JavaScript. Sem campos ou ações novos; nove testes específicos, 387 testes totais, lint/build aprovados. Nenhum novo endpoint necessário; demais bloqueios de API e massa permanecem separados.

## Revisão de 12/11 — Contratos e Termos e abas do perfil

[Checklist e evidências](QA-2026-11-12-PERFIL-TERMOS-E-ABAS.md). Corrigidas abertura de anexo após consulta lenta, reserva de aba ao sair, aviso de popup bloqueado e volta indevida da aba anterior na navegação rápida. Layout/campos/ações preservados; 19 testes de documentos e oito de abas com roteador real, 378 testes totais, lint/build aprovados. Sem novo endpoint necessário; bloqueios de API e massa permanecem separados.

## Revisão de 12/11 — navegação dos contratos

[Checklist e evidências](QA-2026-11-12-CONTRATOS-NAVEGACAO.md). Corrigidos abertura duplicada, respostas de anexo após trocar contrato/sair, erro residual e consulta com ID de outra rota. Campos, ações e layout preservados; 14 testes específicos e 359 testes totais passaram, com lint/build. Falhas são de front, sem nova demanda de API; bloqueios de valores/documentos do reteste anterior permanecem separados.

## Reteste de 12/11 — perfil e contratos

[Checklist vigente e bloqueios reproduzidos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). A renda atual persistiu no salvamento/recarga e foi restaurada; nível oficial já existe e concorda entre summary/onboarding/cards. Cabeçalho documental corrigido no front para consumir levelProgress. Não reencaminhar “nível unificado ausente”, renda antiga ou baseAmount ausente. Permanecem contrato encerrado do Cláudio no investido, métricas individuais indisponíveis, versão documental vigente, contagem elegível a esclarecer e campos/tipos/escritas sem contrato discriminados na matriz. Celular não confirmado e documento fiscal ausente são pré-condições da massa.

Atualizado em 12/10/2026. Admin: http://localhost:8080. Portal: http://localhost:9010.
As duas portas são as origens autorizadas pelo CORS do backend.

## Entregue no código

- Admin: contratos com listagem e edição lateral, rascunhos, participantes, status, documentos, ativos elegíveis e histórico. Finalização condicionada aos dados necessários.
- Admin: depósitos, saques e operações de contrato; detalhe com ações permitidas pelo servidor, versão esperada, histórico e ledger.
- Admin: carteira por cliente, composição, exportação do extrato; consulta, edição dos campos comuns, documentos e arquivamento de patrimônio existente.
- Portal: Home financeira, carteiras, movimentações e detalhes, extrato com saldo após lançamento, contratos e documentos liberados.
- Portal: formulário de saque com validação e confirmação, bloqueado quando não existe o identificador de moeda exigido pela API.
- Recursos independentes, recuperação de erro, proteção contra respostas antigas e idempotência preservada nas tentativas de escrita.

## Histórico de lacunas de contrato HTTP — 12/10/2026

**Esta tabela registra a rodada de 12/10; não encaminhar como pendência atual. As revisões datadas no início deste documento prevalecem.**

Não foram inventados valores para campos sem vocabulário publicado no OpenAPI. O usuário informou não possuir documentação complementar.

| Lacuna                                                         | Impacto delimitado                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Carteiras do cliente não retornam currencyId; saque exige UUID | Envio de saque indisponível até obter identificador válido                                                             |
| ContractTermRequest.unit não enumera valores aceitos           | Rascunhos novos podem ser salvos sem prazo; seleção usa somente unidade de contrato existente; finalização exige prazo |
| destinationType de transferência não enumera valores aceitos   | Transferência entre carteiras indisponível                                                                             |
| Tipos e situações de patrimônio não enumerados                 | Criação de novos bens pendente; edição mantém classificação existente                                                  |
| Catálogo de preferências fornece ISO, não UUID de moeda        | Admin obtém UUID de carteiras/contrato existentes; cliente sem moedas conhecidas não permite escolhê-las               |

Posição, resultado e evolução NotAvailable são apresentados como indisponíveis, nunca convertidos em saldo zero.
Fonte de referência: docs/Api/milestone-3-swagger.json, snapshot do endpoint /openapi/v1.json.

## Verificações históricas — outubro de 2026

- Builds Admin e Portal: aprovados.
- Lint Admin: aprovado.
- Lint Portal completo: impedido pela configuração legada do repositório, sem eslint.config compatível com ESLint 9. Lint direcionado aos seis componentes Vue alterados: aprovado com configuração temporária baseada em flat/essential.
- Nove testes automatizados aprovados: payloads por operação, valores inválidos, participantes, idempotência e respostas fora de ordem.
- git diff --check: aprovado nos dois projetos.
- Revisão visual desktop/mobile com componentes reais e fixtures explicitamente identificadas; arquivos temporários de revisão removidos antes da entrega.
- Integração real na porta 9010: Home, carteira Livre BRL de R$ 50.000,00, depósito REQ-2026-D578DE0D, composição 100% Liquidez e extrato com saldo após lançamento confirmados em 10/10/2026.
- Não houve criação, aprovação ou execução de movimentação financeira real durante esta validação.

A homologação administrativa integrada foi executada em 10/10 e 12/10: rascunho criado/editado, depósito de R$ 1,00 criado e cancelado, observação gravada, patrimônio regravado sem alteração de valores, carteira/ledger/histórico/CSV conferidos. Veja docs/MILESTONE-3-MANUAL-TEST-CHECKLIST.md para o resultado de cada cenário e as pendências. Aprovação/execução de novas movimentações e demais escritas não exercitadas não estão homologadas.
