# Marco 3 — checklist manual

Atualizado em 24/10/2026. Rodadas iniciais: Admin em 12/10 e portal em 13/10. Admin localhost:8080; Portal localhost:9010 (origens CORS autorizadas).

## Devolutiva Admin — 24/10 — itens 56–60

Implementação, validações e bloqueios reais em [QA Admin 56–60](QA-2026-10-24-ADMIN-56-60.md). C32/C33, selects glass, ícone Deslogar, modal bancário C09/C30/logos C35 e editores patrimoniais C10–14. Não inclui o estudo futuro de países/preferências. Impacto estimado em [escopo e horas](IMPACTO-ESCOPO-QA-56-60.md). Runtime 33b238e publicado; pipeline 40136130908 aprovada com 180 testes, auditoria, lint, build, upload e ativação. Ficha, C09, preferências e patrimônio conferidos em homologação; responsivo em 390 px sem overflow. Campos sem contrato continuam apontados no checklist, sem aprovação integrada fictícia.

## Devolutiva Admin — 24/10 — itens 39–55

Checklist e evidências atuais em [QA Admin 39–55](QA-2026-10-24-ADMIN-39-55.md). Ajustes de seleção/ficha conforme C01/C02/C03/C04, sem novos campos/ações. Risco continua refletindo a API (Cláudio A, Jorge “—”); a escala A/AA/AAA aguarda decisão de produto. Esta rodada complementa o fechamento anterior. Runtime final 8e9b29c publicado, pipeline 40130800983 aprovada com 174 testes; seleção/ficha conferidas em homologação, incluindo responsivo e extrato.

## Fechamento consolidado do Admin — 23/10

A situação atual dos itens 10–19 e 27–38 está no [checklist consolidado](QA-ADMIN-FECHAMENTO-2026-10-23.md). Essa matriz prevalece sobre os quadros históricos abaixo. Renda atual/histórico conferidos consistentes; CNH exclusiva, defaults e endpoints liberados em 22/10 não são pendências atuais. Valor base do contrato e criação patrimonial sem carteira foram integrados com os campos já existentes da API. Runtime final 8a00cb4, pipeline 39981438642 aprovada com 162 testes; regressão desktop/mobile, patrimônio sem carteira, valor base, extrato e descarte registrados no relatório consolidado, sem homologação automática dos bloqueios de servidor ou do portal.

## Integração do retorno de 22/10

- [x] Compatibilidade bancária do cliente (titular automático), moeda patrimonial automática, etapa 4 sem moedas, declaração persistida de contatos, submit com confirmação, bloqueio oficial e países por idioma implementados. Busca Admin usa search nos cartões e tabela.
- [x] 274 testes portal e 107 Admin; lint, build e diff das alterações aprovados.
- [x] Portal 3392626 / pipeline 39856647893 e Admin c4f7849 / pipeline 39856658075 publicados com sucesso. Leitura do perfil, formulário bancário sem titular, moedas dos bens existentes, etapas 4/6/7 e busca por e-mail em cartões/tabela conferidos sem gravação. Revisão responsiva Admin 390 px sem overflow; nova rodada mobile portal e salvamentos integrados ficam ao QA.
- [ ] Homologação integrada dos novos fluxos; imagens patrimoniais, agrupamento/visualização de ambos os arquivos e ficha recém-enviada ainda exigem trabalho/conferência do front. Endpoints foram liberados; não pedir novamente como inexistentes. Ver [relatório e limites](QA-2026-10-22-RETORNO-BACKEND.md).

Esta seção prevalece sobre as rodadas históricas abaixo sobre CNH exclusiva, declaração/submit e currencyId ausentes.

## Estado atual do perfil — QA 8 e 9

Esta seção consolida as rodadas abaixo. Registros históricos descrevem o estado observado naquela data e não reabrem correções já retestadas.

- [x] Dados reais no resumo, Perfil Completo e Ajustes; contatos/documentos mascarados, ausência real e zero distintos; validação de data e descarte sem gravação.
- [x] Aprovação e reprovação documental, motivo no portal, reenvio e liberação da edição retestados. Aprovação da CNH pelo usuário levou a 100%/LEVEL_1. Isso não equivale ao envio final do cadastro nem à aprovação de todos os arquivos.
- [x] Estados de loading/erro/vazio, recuperação de salvamentos parciais, sessões e proteção contra respostas antigas corrigidos. Validação das falhas controladas coberta automaticamente.
- [x] Patrimônio/investimentos: datas impossíveis e prazo opcional zero corrigidos em 4a8bd8a, nos inputs e antes do HTTP. Sem novos campos/ações; 247 testes, lint e build aprovados. Publicado em 117b421, pipeline 39532851194 aprovada (CI alinhado ao Node 24 após SIGSEGV reproduzido no Node 20). Prazo zero/fração, recuperação para 12/vazio, datas bissextas e desktop/mobile retestados em homologação sem gravação; criação na conta sem carteira ainda depende de currencyId do backend.
- [x] Preferências: ciclo de vida e sessão protegidos em 7262cfa. Respostas de outra sessão/da tela encerrada não iniciam confirmação nem atualizam valores; salvamento aceito sem confirmação bloqueia novas escritas até recarga. 243 testes aprovados, lint/build e diff da alteração aprovados. Pipeline 39532153190 aprovada; leitura, seletor de idioma e desktop/mobile conferidos em homologação com a conta do Jorge, sem gravar alterações. Falhas de rede/sessão cobertas em testes controlados.
- [x] Preferências nos controles existentes; catálogo bancário completo de 513 instituições e formulário mobile sem overflow. Nenhum campo/ação adicional criado.
- [x] Descrições do perfil: catálogo ausente/parcial não representa nacionalidade salva como ausente; fallback em português corrigido em 0e0de79, com 236 testes. Leitura desktop/mobile conferida sem alterar cadastro.
- [x] Documentação: duplicidade de envio/substituição e orientações antigas corrigidas em 60c799d, com 231 testes. Formulários/validação/cancelamento e desktop/mobile retestados sem novos uploads.
- [x] Contas bancárias: envios concorrentes e respostas tardias corrigidos em 154080a, com 224 testes. Validação/cancelamento e desktop/mobile conferidos sem cadastro bancário.
- [x] Concorrência em Contratos e Termos corrigida em 2b07793; estados independentes, retentativa e desktop/mobile conferidos, com 215 testes do portal. Contexto de consentimentos permanece pendente.
- [x] Ocupação do perfil liberada como texto livre em a5104f2; salvamento/recarga/restauração e desktop/mobile retestados. Não depende de catálogo de ocupações.
- [x] Retorno do backend integrado em d65939b: renda atual retestada, catálogos/campos pessoais, bairro, patrimônio próprio e Basic/Full. Contatos vazios/múltiplos corrigidos em 2591a8b; portal com 207 testes. Detalhes e limites nas rodadas próprias.
- [ ] Backend/negócio restante: contexto dos termos/aceite versionado e vínculo/metadados do replace aguardam reteste específico. Atualização de 22/10 resolve contratos de declaração, submit/estado, identidade alternativa e moeda patrimonial; integração/homologação não se confunde com ausência de API. Renda vigente, catálogos/campos disponibilizados, contato sem relationship, rotas patrimoniais e Basic/Full não são mais endpoints ausentes.
- [ ] Dados de homologação: foto válida disponível na API para verificar o carregamento real; fallback sem imagem quebrada já implementado. Não criar upload fora do Figma.
- [ ] QA: revalidação independente dos cenários corrigidos. Não equivale a uma pendência de implementação nem à homologação integral do Marco 3.

O retorno recente do backend permitiu novas correções locais, registradas abaixo. Esta consolidação prevalece sobre os relatos históricos de contrato ausente; a revalidação independente pelo QA continua aberta. Detalhes contratuais em PENDENCIAS-BACKEND-QA.md.

## Estado atual do Admin — QA 10 a 19

- [x] Catálogo de bancos (QA 16/17): busca por código/nome passa a considerar todas as páginas recebidas, com paginação/contadores sobre o resultado filtrado. Em 8080, banco 325 encontrado, pesquisa sem acentos, vazio e retorno da página 52 validados. 99 testes aprovados.
- [x] Busca bancária publicada em 3ea3c43/62babcf, pipelines 39503676010 e 39503972684 aprovadas. Em homologação: código 325/nome sem acento, vazio, limpar pelo botão, página 52, retorno à página 1 e filtro ativos validados. Campo legível em 390 px, sem overflow da página; nenhum banco gravado.

- [x] Configuração documental (QA 16): removido o corte interno de cinco linhas das duas tabelas com paginação oculta. Em 8080, os 30 tipos reais aparecem; busca RG, vazio e abertura do último tipo validados sem gravar configuração. 95 testes, lint e build aprovados.
- [x] Configuração documental publicada em 2eea460, pipeline 39502645633 aprovada. Em homologação, lista completa de 30 tipos, categoria pessoal com sete, busca RG, vazio, limpeza dos filtros e editor do último tipo validados; nenhuma configuração gravada.

- [x] Identificação: data de nascimento impossível/futura bloqueada antes das escritas da seção, usando erro no topo/campo existentes. Sem idade mínima nem novo campo. 95 testes, lint/build e teste local em 8080 aprovados; descarte preservou o nascimento original.
- [x] Nascimento publicado em 60423d3: pipeline 39501477543 concluída com sucesso. Data futura bloqueada em homologação; descarte/reabertura preservaram o original e limparam o erro. Mobile 390 px sem overflow. Conteúdo cadastral conferido por hash antes/depois, sem mudança.

- [x] Registro de patrimônio: anos, quartos/banheiros, parcelas e prazo em meses validados como inteiros no input e antes do HTTP, respeitando os tipos já publicados. Opcionais e zero preservados; valores e áreas continuam decimais. 93 testes locais aprovados; ano fracionado/correção retestados em 8080, sem gravação.
- [x] Patrimônio publicado em 9d10d93, pipeline 39500642230 aprovada em lint/build/upload/ativação. Em homologação: anos fracionados rejeitados, correção para inteiro e opcional vazio aceitos, Valor FIPE decimal preservado e mobile 390 px sem overflow; formulário descartado sem gravação.

- [x] Perfil/Admin: catálogo completo de bancos (513 instituições em três páginas), pesquisa sem acentos e nomes de bancos após a primeira página. Falha do catálogo usa o erro/retentativa existentes, sem expor opções parciais. 91 testes locais, lint e build aprovados; seletor conferido na porta 8080.
- [x] Publicação ddfb04d confirmada: pipeline 39499746938 aprovada em lint/build/upload/ativação. Em homologação, busca `orama` encontrou e selecionou o banco 325 da terceira página; formulário cancelado sem cadastrar conta. Em 390 px, página e card sem overflow horizontal.

- [x] Listagem de clientes respeita a última consulta e distingue erro/vazio; reteste de filtros, cartões/tabela e paginação publicado em 00d601f (85 testes locais).
- [x] Estrutura de edição por seção C24, cinco campos profissionais/financeiros, preferências no mesmo bloco, catálogo de bancos/países, datas e histórico traduzido preservados nas rodadas registradas abaixo.
- [x] Carteira zerada/extrato e documentos de onboarding/revisão retestados nas rodadas próprias; decisões já concluídas não devem constar como falta de implementação de Aprovar/Reprovar.
- [x] Precisão decimal no input/plano financeiro, comparação por valor e validações corrigidas em 96ebd34; suíte local completa com 78 testes aprovada. Lint/build/deploy aprovados na pipeline 39497171684.
- [x] Reteste de edição por seção em homologação: formatação equivalente não habilita Salvar; mudança efetiva habilita e destaca só o campo alterado; negativo bloqueado e descarte confirmado. Profissional e histórico financeiro permaneceram integralmente iguais ao baseline de leitura.
- [ ] Contratos do backend: campos de identificação/documentos, efeitos/estado oficial do cadastro, segurança e observações sem alerta; módulos sem API e persistência (Lógicas, Crédito, Comunicados, Leads, Assessores e LP); unicidade de e-mail, sessão HttpOnly e investigação do incidente de identidade.
- [ ] Revalidação independente pelo QA dos cenários administrativos liberados. A correção da seleção financeira foi retestada no portal após o retorno do backend; repetir o cenário financeiro administrativo na rodada do QA. Não simular defaults de risco/compliance nem criar campos/ações para contornar bloqueios.

## Revisão final do escopo original do QA — Admin, 20/10

Nesta revisão não foi identificado outro item do QA original (10–19) com implementação pendente que possa avançar apenas no frontend. Isso não aprova integralmente o Admin: há integração futura de frontend bloqueada por contratos/estados do servidor e revalidação independente do QA. As correções adicionais encontradas durante as revisões estão publicadas e registradas nas rodadas abaixo.

| QA | Parte do front disponível para revalidação | O que ainda impede concluir o item |
| --- | --- | --- |
| 10 | Aprovar/Reprovar, motivo obrigatório, atualização de contadores e integração com o portal. | Estado/data oficiais do envio cadastral, defaults risco/compliance, regra CNH e vínculo/metadados do reenvio. |
| 11 | Campos preservados no mesmo bloco; validação de nascimento; escrita apenas dos campos suportados. | Contratos de escrita dos dados pessoais e documentos ainda somente leitura; integrar esses campos após definição do backend. |
| 12 | Cinco campos profissionais/financeiros, precisão, validação, destaque e descarte. | Consulta financeira vigente ainda retorna registro anterior após escrita no histórico. |
| 13 | Preferências com edição e ações da seção, sem botão isolado. | Revalidação do QA; metadados existentes preservados. |
| 14 | Carteira zerada, composição e extrato vazios; consulta do Cláudio. | Revalidação do QA; valores indevidos de contrato encerrado permanecem questão de cálculo do servidor. |
| 15 | Uma seção por vez; salvar só após mudança; descarte/saída; loading/erro/sucesso. | Escritas de identificação, segurança e observações livres não disponíveis; integração futura depende desses contratos. |
| 16 | Menu/seleção de sistema e acessos integrados; listagem documental completa e busca bancária completa. | Definir APIs/persistência de Lógicas, Crédito, Comunicados, Leads, Assessores e LP; depois ainda implementar a integração do front conforme Figma. Protótipos não são considerados integrados. |
| 17 | Datas, histórico em português, países legíveis e catálogo/pesquisa de bancos. | Unicidade de e-mail no servidor e revalidação do QA. |
| 18 | Proteções de identidade/sessão/concorrência implementadas. | Logs do incidente de 17/10 às 18:16 e reteste do QA; a causa original não foi confirmada nem o item encerrado. |
| 19 | Rotas de LP exigem sessão e papel administrativo no front. | Autorização da API e sessão HttpOnly no backend/BFF; depois adaptar o transporte dos dois fronts e retestar. |

Conferência atual: Swagger público sem novas rotas em relação ao snapshot anterior; UpdateCustomerRequest continua apenas kind/birthDate. Homologação carregou identificação e profissional, confirmou Salvar desabilitado sem mudanças, bloqueio dos outros lápis durante edição e estado civil somente leitura. Seção encerrada sem alterações. Compliance sem alerta continua bloqueado pelo contrato, sem criar flag para contornar.

Validação desta revisão: 99 testes locais, lint e build aprovados. Runtime de homologação 62babcf e publicação documental 8a27522 confirmados em pipelines concluídas. Esta rodada atualiza a documentação e não altera o runtime; sua publicação não representa implementação dos módulos bloqueados nem homologação integral.

## Histórico das rodadas

## Homologação administrativa integrada

| Cenário                                           | Resultado                                  | Evidência                                                                                                            |
| ------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Login administrativo                              | Aprovado                                   | Sessão autenticada e acesso às páginas em 8080                                                                       |
| Rascunho: criar, editar, reabrir e histórico      | Aprovado em 10/10                          | CTR-0EDD86A7, HOMOLOGAÇÃO M3 — 10/10/2026; criação e atualização persistidas                                         |
| Listagem de rascunhos                             | Aprovado após correção frontend            | API exige registrationStatus=Draft; seletor permite alternar com contratos cadastrados                               |
| Contratos cadastrados                             | Aprovado para consulta                     | Cinco contratos listados em 12/10; Alpha Hedge Fund com prazo, moeda, dois participantes e histórico                 |
| Transações: listagem, detalhe, histórico e ledger | Aprovado para consulta                     | Depósito REQ-2026-D578DE0D, débito externo e crédito da carteira de R$ 50.000,00; histórico completo                 |
| Observação administrativa                         | Aprovado                                   | Nota de homologação de 12/10 gravada e recarregada no depósito de teste                                              |
| Criar depósito sem comprovante                    | Aprovado                                   | REQ-2026-ADB71B0D, R$ 1,00, criado em AwaitingReceipt                                                                |
| Cancelar solicitação                              | Aprovado                                   | REQ-2026-ADB71B0D passou a Canceled; histórico registrado e ledger vazio                                             |
| Carteira, composição e reserva                    | Aprovado                                   | Éric: saldo R$ 50.000,00, reserva R$ 2.500,00, disponível R$ 47.500,00; composição BRL/USD carregada                 |
| Exportação de extrato CSV                         | Aprovado                                   | Download pelo botão; cabeçalho e linha conferidos, crédito e saldo após de R$ 50.000,00                              |
| Patrimônio: lista, detalhe e salvar               | Aprovado no cenário sem mudança de valores | Honda Civic regravado mantendo R$ 120.000,00; formulário retornou sem erro; dois bens carregados                     |
| Documentos existentes da transação                | Aprovado para consulta                     | Nome do comprovante do depósito exibido; conta bancária mascarada                                                    |
| Aprovar/executar novas movimentações              | Não executado                              | Apenas histórico já existente foi conferido; teste de R$ 1,00 cancelado antes dessas etapas                          |
| Saques e operações de contrato: criação           | Pendente                                   | Não foram criadas novas solicitações desses tipos nesta rodada                                                       |
| Finalização, status e vínculos de contrato        | Pendente de escrita                        | Consulta validada; contratos cadastrados de terceiros preservados; rascunho novo sem unidade de prazo publicada      |
| Universo de ativos                                | Bloqueado por dados                        | Catálogo retornou lista vazia em 10/10 e 12/10                                                                       |
| Vincular documentos de transação                  | Pendente contrato HTTP                     | AttachTransactionDocumentRequest.role não enumera os valores aceitos; não enviar AttachDocument ao endpoint de ações |
| Documentos de contrato/patrimônio e arquivamento  | Pendente de escrita                        | Estado vazio consultado; nenhum vínculo ou arquivamento realizado                                                    |

## Correções frontend verificadas

- Filtro explícito de rascunhos e ajuste do filtro após salvar/finalizar.
- Ações de aprovação restritas a Validate/Approve/Reject/Execute/Cancel autorizadas pelo servidor.
- AddObservation usa o endpoint observations e payload content; documentos possuem seção própria.
- Traduções dos status reais encontrados e das origens/contas contábeis.

## Portal e verificações locais anteriores

Em 10/10, Home do Éric, depósito, composição e extrato reais foram aprovados em 9010. Os valores daquela rodada precedem a reserva de saque encontrada em 12/10. Revisão desktop/mobile com fixtures explicitamente identificadas e proteção do formulário de patrimônio durante PATCH lento aprovadas anteriormente. Home do Cláudio validada em 13/10, conforme complemento abaixo. Documentação permanece bloqueada.

## Bugs do backend

Nenhum erro de execução do backend confirmado nesta rodada. Catálogos vazios e vocabulários ausentes são limitações de dados/contrato HTTP, descritas no checklist de implementação. Os erros encontrados no frontend foram corrigidos e não entram nesta tabela.

## Registros deixados pela homologação

Rascunho CTR-0EDD86A7; observação identificada no depósito de teste; solicitação REQ-2026-ADB71B0D cancelada. Nenhuma movimentação financeira nova foi aprovada ou executada. Não foram alterados os valores patrimoniais nem os contratos cadastrados.

## Complemento de 13/10/2026

Home e carteira de Cláudio consultadas: BRL 25.000,00 em carteira e BRL 261.500,00 de capital contratado. Documentação segue bloqueada: API retorna documentLevel=1 e exige 2, com featureCode=Communication. A aprovação nível 2 informada pelo produto não aparece na resposta. Causa interna pendente de investigação. Consulte MARCO-3-DEVOLUTIVA-BACKEND.md para evidência sanitizada e critérios de reteste. A mensagem frontend que indicava depósito foi corrigida; isso não libera o guard do backend.

## Complemento de 15/10/2026

Resposta do backend recebida: PRs #200 (currencyId da carteira) e #201 (guard da
listagem documental) informados como publicados. Reteste com Cláudio confirmou
listagem de documentos 200 e carteira Free BRL 25.000,00 com currencyId. Resumo
segue nível documental 1; são cálculos diferentes do nível de verificação Admin.
A Home agora responde PreferencesRequired; não foi alterado o cadastro para
contornar a exigência. Valores de saldo e mensagens foram conferidos no portal.

Os vocabulários de prazo, transferência, patrimônio e função de documento estão
esclarecidos. As pendências antigas de contrato HTTP acima são registros históricos,
não a situação atual. A nova rodada mantém sem homologação as escritas não
executadas. Catálogo de ativos informado como populado pelo backend; aplicação a
contratos ainda pendente. Motor de variação pertence ao Marco 4.

Frontend: Saldo Investível usa availableBalance; Banking usa Free.available;
saque permite apenas Free e recebe currencyId da API; mensagens traduzem os sete
blockingCode documentados; Admin aceita prazo Day/Month/Year com os limites
confirmados. Mesma composição visual e mesmas portas 8080/9010.

## Correção visual do perfil administrativo — 15/10/2026

- Nome longo de banco: coluna limitada, reticências e nome completo no título;
  tabela sem rolagem horizontal no card (794/794 px no desktop, 308/308 px no celular).
- Menu de três pontos: lista vertical compacta alinhada ao botão, com tema escuro
  e contraste das ações. Abertura e fechamento conferidos no navegador.
- Preferências: idioma e demais seletores limitados à coluna, sem sobreposição
  com o fuso horário. Texto extenso recebe reticências; valor salvo é preservado.
- Revisão no cliente da captura, em localhost:8080, incluindo largura móvel de
  390 px; largura da página 375 px, sem overflow horizontal do fluxo afetado.
- Nenhuma conta, preferência ou dado do cliente foi alterado nesta revisão.

## Conferência com a referência Figma — 15/10/2026

Arquivo i2jizg7UtPyg3KjAOvuFtI: página Piloto · Fluxo (1484:66875), seção
Clientes (1484:67093), perfil F02 (1484:68034) e estado C17 (1484:69103).
O nó informado era a página completa; a leitura direta não retornava seleção.
Após localizar os filhos, o estado C17 foi obtido com código e captura.

O acabamento do menu de ações foi alinhado ao padrão de menus da referência:
vidro branco a 6%, desfoque de 20 px, borda branca a 20%, raio de 12 px,
preenchimento de 6 px, intervalo de 3 px e opções de 36 px com raio de 8 px.
Mantido o gatilho de três pontos pedido pelo usuário. O quadro C02 mostra ações
bancárias inline e não possui estado específico desse menu; portanto, a comparação
é com o padrão visual de menu C17, sem alegar equivalência integral da tabela.
Nome longo e idioma permanecem contidos, conforme correção anterior. Nenhuma
conta ou preferência foi modificada na validação.

## Ações bancárias na linha — 16/10/2026

A pedido do usuário, a tabela de contas bancárias passou a seguir as ações inline
mostradas no C02: indicação de principal, editar e arquivar. O menu de três pontos
foi retirado somente dessa tabela; o componente compartilhado continua disponível
nos demais fluxos. A situação da conta pode ser alterada no formulário de edição.
Ícones originais extraídos dos nós 1484:68299, 1484:68302 e 1484:68304, salvos em
public/icons/client-profile, com dimensões de 16 × 16 px. Nome longo permanece
truncado e a tabela mantém largura limitada ao card. Nenhuma conta foi alterada.


## Perfil administrativo conforme Figma — 16/10/2026

Revisados C02, C08–C14 e C19–C23 no arquivo i2jizg7UtPyg3KjAOvuFtI.
Corrigida a composição de identificação, preferências, carteira, bancos,
documentação, compliance e patrimônio. Ações de gerenciamento fora do desenho
foram removidas do perfil. O histórico não abre mais o gerenciamento de verificação.
Formulários patrimoniais usam apenas campos previstos e preservam metadados
não editáveis. Lint, build e testes de payload verificam as alterações; revisão
visual em desktop e 390 px, incluindo nome longo de banco e abertura/cancelamento
de inclusão. Nenhuma escrita na conta do cliente foi executada.

Pendências de contrato e limites da integração estão no adendo de 16/10 da
MARCO-3-DEVOLUTIVA-BACKEND.md. Esta revisão não aprova as operações financeiras
pendentes nem declara equivalência integral de estados dependentes desses dados.


## Reteste dos perfis de Éric e Cláudio — 16/10/2026

Leitura administrativa em localhost:8080, confrontada com API de homologação.
Nenhum saldo, contrato, documento, preferência ou cadastro foi alterado.

| Cliente / moeda | Saldo base | Investido | Investível | Carteira total | Contratos |
| --- | ---: | ---: | ---: | ---: | ---: |
| Éric / BRL | 370.000,00 | 0,00 | 47.500,00 | 417.500,00 | 0 |
| Éric / USD | 0,00 | 250.000,00 | 0,00 | 250.000,00 | 2 |
| Cláudio / BRL | 0,00 | 261.500,00 | 25.000,00 | 286.500,00 | 1 |

Éric: BRL 50.000,00 de saldo, BRL 2.500,00 reservados; disponível 47.500,00.
Patrimônio BRL 370.000,00 corresponde a imóvel 250.000,00 e veículo 120.000,00.
Contratos em USD: Legacy Prime, alocação do cliente 200.000,00 / 40%;
Alpha Hedge Fund, alocação 50.000,00 / 40%. Os capitais totais dos contratos
(500.000,00 e 125.000,00) não foram exibidos como saldo do cliente.
Cláudio: Beta Growth Spec, BRL 261.500,00 / 100%, status Encerrado retornado
pelo backend. O front preserva o saldo investido que /portfolio ainda informa.

Documentação: cada cliente tem um arquivo Pending em ACCOUNTING_FISCAL,
tipo Extratos Bancários, enviado em 09/10/2026. Os arquivos de teste de depósito
foram abertos pela ação Visualizar em ambos os perfis. Os três contratos
retornam lista vazia de documentos vinculados; a categoria Contratos vazia é
coerente com essas respostas e não deve receber cópias dos documentos fiscais.

Correções de front reexecutadas: categoria ACCOUNTING_FISCAL reconhecida;
contadores passam a usar o mesmo overview dos itens, inclusive documentos sem
requisito individual; contratos aparecem ao selecionar Saldo investido, por moeda,
no bloco C08. Ver contrato abre o painel administrativo do contrato selecionado.
Removida a paginação automática excedente das tabelas de composição no perfil.
Moedas permanecem separadas. Valor base, atual e bloqueado por participação
continuam indisponíveis, sem aproximações com o capital global do contrato.

Comparação visual com C08 (1484:68911), mantendo as quatro métricas e a composição
do perfil. Ícones locais conferidos em suas dimensões originais 14/20/12/12 px.
Layout desktop sem overflow: página 1897/1897 px. Lint, build e testes de regressão
validam a alteração. A homologação de escritas financeiras continua fora desta rodada.

## Preferências do portal — retomada em 19/10/2026

Seletores de moedas, idioma e fuso integrados à API, conforme Figma `1:68237`,
sem botão de salvar ou campo de país adicional. Salvamento feito pela tela em
9010, usando Cláudio: o país ausente nas preferências foi reaproveitado do seu
único endereço residencial principal cadastrado. A API confirmou preferências
e país completos; Home e contratos HTTP 200, Banking BRL 25.000,00, investimento
BRL 261.500,00 e Beta Growth Spec visíveis. Persistência conferida após recarga.

A pendência de contrato encerrado no investimento permanece no backend. A
verificação telefônica também continua pendente no status geral, sem bloquear
a Home nesta resposta. Nenhuma escrita financeira ou aprovação documental foi
realizada. Estados vazios de Comunicação aplicados na Home e página própria;
integração de publicações depende de contrato HTTP ainda não disponível no
Swagger consultado. Demais itens do QA não estão aprovados por esta rodada.

## Carteira consolidada vazia — QA item 14, 19/10/2026

- [x] Cadastro de teste Jane Austin Doe: portfolio, composição e carteiras vazios consultados; quatro métricas R$ 0,00, “Nenhuma composição ainda” e “Nenhum lançamento ainda” conforme Figma C29.
- [x] Cláudio: valores consolidados preservados e depósito real exibido no extrato com saldo após o lançamento. Saldo atual zero não é usado para presumir histórico vazio.
- [x] Loading, erro e resposta incompleta não viram vazio; consultas antigas são descartadas ao trocar cliente/sair da tela. Desktop e celular revisados.
- [x] 35 testes, lint, build e diff dos arquivos do lote aprovados. Detalhes em [QA-2026-10-19-CARTEIRA-VAZIA.md](QA-2026-10-19-CARTEIRA-VAZIA.md).
- [x] Deploy 8c64763 conferido no domínio administrativo: Jane zerada e depósito real do Cláudio visíveis. Upload e ativação aprovados na execução 39299774726. As demais pendências da triagem continuam abertas.

## Edição por seção — QA 11, 12, 13 e 15, 19/10/2026

- [x] Referência C24: sem Editar global, uma seção por vez, campos na composição original, Salvar desabilitado antes de alterações, Descartar e confirmação de saída.
- [x] Jane: escrita e restauração de empresa, renda familiar, preferência de tema e complemento; validação local de renda e campos somente leitura preservados. Sem transação financeira ou aprovação documental.
- [x] Cláudio: composição profissional/financeira carregada com dados reais; início sem mudanças não permite salvar. Desktop/celular revisados.
- [ ] Homologação de todos os campos do desenho: depende de contratos de escrita para documentos/dados pessoais, segurança e observações livres de compliance. Limites e evidências em [QA-2026-10-19-EDICAO-POR-SECAO.md](QA-2026-10-19-EDICAO-POR-SECAO.md).

## Aprovação documental no perfil — parte do QA 10, 19/10/2026

- [x] C27: contadores no cabeçalho, aguardando aprovação, visualização/download e Aprovar/Reprovar conforme permissões reais.
- [x] C28: somente motivo obrigatório e mensagem para o cliente; cancelar sem escrita, erro sem falso sucesso e bloqueio de gravação concorrente.
- [x] Dois arquivos descartáveis de homologação: rejeitado com notas e aprovado pela tela; contadores e download conferidos. Arquivos de QA removidos e documento original do Cláudio preservado pendente.
- [x] Desktop/celular e testes automatizados de permissão, validação, concorrência e respostas antigas. Detalhes em [QA-2026-10-19-APROVACAO-DOCUMENTOS.md](QA-2026-10-19-APROVACAO-DOCUMENTOS.md).
- [ ] C25–C26 completos, defaults, reenvio e desbloqueio cadastral após aprovação: dependem dos estados e efeitos confirmados no backend. Este lote não aprova integralmente o item 10.

## Histórico e países dos bancos — QA 17

- [x] Histórico recente/completo do Cláudio em português, incluindo cadastro, preferências, profissão, finanças e documentos. Data, autor, ordem e observações preservados; arquivamento não é confundido com revisão documental.
- [x] Catálogo de bancos mostra Brasil no lugar do UUID. Campo País usa o catálogo existente, com Brasil e Portugal; país inativo não aparece entre as opções. Seleção testada e cancelada sem cadastrar banco.
- [x] Primeira e segunda páginas exibem os dez registros recebidos, em concordância com o rodapé. Não há paginação local de cinco linhas escondendo metade da página do servidor.
- [x] Testes automatizados de tradução, preservação de texto, catálogo paginado, países inativos, falha e ausência de país. Sem escritas cadastrais ou financeiras neste lote.
- [x] 65 testes, lint e build aprovados; revisão visual em desktop e celular sem transbordamento no histórico. Nenhum erro de console observado na validação local.
- [ ] Unicidade do e-mail no servidor permanece pendente. Encaminhamento consolidado em [Pendências do backend](PENDENCIAS-BACKEND-QA.md).

## Menu administrativo e seleção de sistema — QA 16, 19/10/2026

- [x] Menu comparado aos sidebars 1484:85381/1484:69989; seleção comparada a A02 (1484:66973). Ícones e logo fornecidos pelo Figma, sem campos ou ações novos nas telas de destino.
- [x] Clientes, Contratos e Transações abertos com dados da API. Configurações oferece os acessos existentes a Formulários, Bancos e Configuração documental; carregamento real conferido nos três.
- [x] Destaque da seção, recolher/expandir, rodapé sem sobreposição e ausência de barra horizontal no menu conferidos em desktop. No celular, menu abre e fecha após navegação; seleção usa uma coluna sem transbordar.
- [x] Trocar Sistema abre A02 e consulta `/me/systems`. Inserção de Dados abre Clientes; editor de LP permanece indisponível por ainda não persistir alterações. Carregamento/erro não habilitam destinos fictícios.
- [x] 70 testes automatizados aprovados, incluindo rotas existentes, destaque por seção, proteção da seleção e mapeamento de sistemas sem seguir URLs arbitrárias da API.
- [ ] QA 16 integral: módulos ainda sem integração e editor de LP continuam pendentes. A entrada vazia de Dashboard foi tratada no complemento abaixo. Dependências confirmadas e limitações de frontend em [Pendências do backend](PENDENCIAS-BACKEND-QA.md).

## Entradas vazias e conciliação da triagem — QA 16, 19/10/2026

- [x] `/dashboard` abre a listagem integrada de Clientes; não deixa somente o shell vazio nem cria métricas fora do desenho.
- [x] `/landing-page` renderiza a seleção A02 existente e exige sessão administrativa. `/edit-lp` preserva a proteção do editor; a seleção não oferece acesso ao protótipo sem persistência.
- [x] Testes de regressão usam a resolução real do Vue Router para a entrada de Clientes e verificam as negativas para visitante, cliente comum e papéis não confirmados nas duas rotas de LP.
- [x] Triagem dos itens 2–5, 8 e 9 conciliada com os registros posteriores do portal. Não foi realizada nova homologação desses fluxos neste lote; as evidências e limites anteriores foram preservados.
- [x] Documento único ampliado com lacunas do perfil, cadastro e Home do portal. Separados contratos pendentes do servidor e implementação pendente no front; nenhum item integralmente aprovado por inferência.
- [x] Seleção A02 revisada em desktop e celular de 390 px, sem transbordamento; ícones locais de 32/24 px carregados. Retorno a Clientes conferido. 72 testes, lint, build e diff dos arquivos do lote aprovados.
- [ ] QA 16 completo e cadastro de sete etapas: continuam pendentes; consultar a triagem e o documento consolidado.

## Reteste de cadastro com conta nova — 20/10/2026

- [x] Usuário confirmou criação e recebimento de código; sessão autenticada acessou etapa 3.
- [x] Nascimento/cidade, endereço/filiação e financeiro fictícios persistidos pelas operações do cliente. Decimal/zero e recarga conferidos. Consultas do Admin foram somente leitura.
- Registro histórico superado: a rodada inicial encontrou 403 na consulta de tipos documentais. O backend identificou ausência de perfil profissional; antecipar sua gravação para a etapa 4 corrigiu o fluxo, e os uploads foram retestados na etapa 5. Não é bloqueio atual de frontend nem pedido de remover o guard.
- Registro histórico superado parcialmente: upload documental foi retestado nas rodadas posteriores de 20/10, incluindo aprovação, reprovação, motivo e reenvio. O envio final do cadastro continua dependente do contrato oficial; não considerar as sete etapas integralmente homologadas.

O 403 foi inicialmente investigado como bloqueio de integração e depois resolvido pela sequência autorizada do frontend, conforme retestes abaixo. Catálogos/relationship/campos ausentes são pendências de contrato/configuração, detalhadas em PENDENCIAS-BACKEND-QA.md. Retomada de Número no campo separado foi registrada no checklist como ajuste de frontend e não entrou na seção de bugs do backend. Nenhuma nova movimentação financeira ou aprovação documental foi executada.

## Reteste de retomada do Número — 20/10/2026

- [x] Portal fdb07ab publicado com pipeline 39449807714 aprovada. Na conta do usuário, Logradouro e Número retomados separadamente; recarga e reabertura pela revisão conferidas.
- [x] Dados salvos inalterados em comparação antes/depois; nenhuma escrita do formulário/documento neste reteste. Aba original com rascunho/arquivos preservada.

Correção exclusivamente do frontend; não acrescenta item à tabela de bugs do backend. As pendências documentais/cadastrais anteriores continuam sem aprovação integrada.


## QA do cadastro — revisão com falhas parciais, 20/10

Defeito do frontend corrigido no portal: leitura profissional/financeira ou de contatos com falha não substitui rascunhos por valores vazios. Seções independentes preservadas, erro indicado na linha existente e aviso limpo após recuperação. Não foi adicionada ocorrência à tabela de bugs do backend.

126 testes, lint/build e diff do lote aprovados. Revisão local 9010 conferida em desktop e 390 px efetivos, sem overflow horizontal. Enviar sem confirmação mostra erro e foca o checkbox, sem escrita. Falhas/retry verificados por testes automatizados com serviços simulados, sem provocar erros na API. Não homologa upload bloqueado por 403, contatos novos ou envio final.

Checklist ativo: CHECKLIST-CADASTRO-SETE-ETAPAS.md; evidência técnica no portal em docs/QA-2026-10-20-CADASTRO-FALHAS-PARCIAIS.md.


## Etapa 4 — QA do preenchimento por CEP, 20/10

Consulta existente do legado reutilizada no Brasil, sem novas ações/campos. Em 9010, CEP público 01001-000 preencheu Logradouro/Bairro/Cidade/Estado e manteve Número/Complemento. CEP inexistente mostrou orientação no campo sem apagar endereço; CEP válido recuperou o preenchimento. Desktop e 390 px sem overflow; 135 testes, lint/build aprovados. Não foi clicado Continuar nem gravado perfil/documentos. Falhas/concorrência cobertas em testes; nenhuma falha nova do backend adicionada à tabela de bugs. Limites e publicação em CHECKLIST-CADASTRO-SETE-ETAPAS.md.

Reteste publicado: aae0e31, pipeline 39453639953 aprovada. Mesmo preenchimento por CEP confirmado no navegador de homologação, em aba separada na sessão da conta nova; Número/Complemento preservados, sem salvar perfil ou documentos.


## Cadastro — retomada após logout/login, 20/10

Frontend: marcador somente de rota das etapas autenticadas, por usuário e na mesma origem/navegador. Logout/Home mantêm, outra conta não herda; dados suportados reconsultados da API e rascunhos de sessão anterior descartados. 145 testes, lint/build/diff do lote aprovados. Em 9010, Cláudio saiu pelo botão existente e /login sem next retomou etapa 5 com seus dados; após logout, Éric entrou na Home. Nenhum perfil/documento ou operação financeira foi gravado. Progresso no servidor, rascunho completo, retomada entre dispositivos e envio final continuam sem homologação; não é ocorrência nova para a tabela de bugs do backend. Publicação e reteste no checklist de cadastro.

Reteste publicado: 4a4076b/pipeline 39455314973 aprovada. Em homologação no Edge, Cláudio: etapa 4/br → Home → Sair → /login sem next → login → etapa 4/br com dados da API. /login com sessão válida também retornou à etapa salva. Nenhuma escrita cadastral/financeira/documental; conta e rascunho originais do usuário no navegador integrado preservados. Somente retomada local aprovada, sem homologar progresso entre dispositivos/envio final.


## Cadastro — nova ordem autorizada e pré-requisitos, 20/10

Profissional/financeiro/moedas antecipados para etapa 4; documentos/endereço agora etapa 5. Ampliação autorizada pelo designer/QA e confirmada pelo usuário: Ocupação, Empregador opcional, Moeda principal/secundária. 152 testes/lint/build/diff aprovados; ocupação vazia e edição pela revisão conferidas, desktop/390 px sem overflow. O backend esclareceu o 403 anterior como ProfileIncomplete pela ausência de profissional: a correção de sequência é do front, sem remover o guard. Preservada a evidência histórica; não aberta nova ocorrência de backend por esta alteração. Publicação/reteste no checklist de cadastro.


### Reteste publicado — profissional antes dos documentos

Portal 46d5bc5, pipeline 39468374725 tentativa 2 aprovada (152 testes). Conta nova do usuário com dados fictícios: PUT profissional + PUT financeiro + PATCH duas moedas concluíram antes da etapa 5. Continuar documental alcançou a mensagem de arquivos ausentes após consultar tipos; 403 ProfileIncomplete anterior não se repetiu. Home mostrou saldos zero/estados vazios, sem PreferencesRequired. Profissional e moedas retomados pela API após recarga; nenhum arquivo/documento tipado, CPF real, transação ou aprovação enviados. Bloqueios antigos superados nesse cenário por adequação do front à regra confirmada, sem abrir bug novo do backend nem homologar upload/envio final. Aba original do usuário preservada.


### Etapa 5 — upload fictício aprovado em homologação, 20/10

Portal 46d5bc5, conta nova do usuário: dois PNGs claramente fictícios selecionados no formulário e enviados; avanço real à etapa 6. Leitura administrativa confirmou dois RG/BR Uploaded, arquivos Private/Available e um ProvidedDocument/Active com duas evidências Uploaded. Não houve 403 nem aprovação documental. UF sem catálogo não bloqueou este RG; issuerState null aceito pela definição. Sem alteração de layout/código, contato, aceite ou envio final.

Recarga manteve endereço/número/complemento/filiação, mas não repôs campos do RG. Antes da recarga, Voltar preservou arquivos em memória com texto incorreto ainda não enviado. Retomada e apresentação ficam abertas no checklist principal; não adicionadas como bugs do backend sem atribuição confirmada. Cadastro completo e aprovação seguem parciais. Evidência: cadastro-etapa-5-envio-concluido.png.


### Retomada documental corrigida e publicada — 20/10

beb01b2, pipeline 39471786647 aprovada; 158 testes/lint/build. Perfil do usuário em homologação repôs número mascarado/emissor/expedição e indicação de evidências nos campos/slots existentes, inclusive em nova aba sem arquivos locais. Continuar avançou à etapa 6; conferência administrativa manteve dois anexos com os mesmos IDs e um RG com duas evidências. Máscara não é enviada como número real; sem alterações usa o registro confirmado, sem novo upload. Texto ainda não enviado corrigido. Ocorrências de frontend encerradas, sem novo bug da API; UF/catálogos, bairro, contatos e envio final permanecem nos respectivos limites. Evidência: cadastro-documentos-retomada-hml.png.


## Admin — documentos do cadastro visíveis para revisão, 20/10

Corrigido o mapeamento de categoria no frontend: GET /admin/customers/{id}/documents/overview retornava summary.pending = 2 e dois itens Pending/Review em PERSONAL_DOCUMENTS. A projeção só reconhecia PERSONAL e escondia as linhas, embora o contador estivesse correto. PERSONAL_DOCUMENTS agora usa a primeira seção já existente do Figma; alias antigo e demais seções preservados. Nenhum campo, ação, layout ou permissão novos.

- [x] Regressão cobre dois arquivos do mesmo tipo RG, sem requirementId, com IDs distintos e ações Review/Download retornadas pela API. Doze testes de projeção/revisão aprovados; lint, build e diff do lote aprovados.
- [x] Admin 4fd3faf publicado, pipeline 39474455430 aprovada em lint/build/upload/ativação. Local 8080 e perfil do usuário em admin.strategyanalytics.com.br conferidos.
- [x] Após recarga, aparecem dois RGs na seção Documentação pessoal; contador 2 Aguardando coerente; ambos com Visualizar, Baixar, Aprovar e Reprovar. Evidência: admin-documentos-jorge-aprovacao.png.
- Registro histórico: nesta rodada inicial ainda não houve decisão e os arquivos estavam Pending. Superado pelos retestes posteriores de aprovação, reprovação/motivo, reenvio e edição do perfil descritos abaixo; não manter como pendência atual de frontend.

A ausência das linhas era defeito do frontend, encerrado após o reteste publicado. Nenhum novo bloqueio/bug de backend foi aberto por esse cenário.


## Aprovação integrada dos arquivos fictícios e edição do cliente — 20/10

Teste autorizado pelo usuário nas versões já publicadas: Admin 4fd3faf (correção documental) e portal beb01b2. Nenhuma alteração de layout, campo ou ação foi necessária nesta rodada.

- [x] No Admin, Aprovar foi acionado separadamente nos dois arquivos fictícios RG. Primeiro resultado: 1 Aprovado / 1 Aguardando; segundo: 2 Aprovados / 0 Aguardando / 0 Rejeitados. Ações de decisão deixaram de aparecer nos arquivos concluídos; nenhuma revisão duplicada.
- [x] Consulta administrativa independente confirmou summary.total = 2, approved = 2, pending = 0, rejected = 0. Progresso identifica RG Approved, progressState Complete e countsAsComplete true.
- [x] Área do Cliente, mesma conta: Dados Básicos, Localização e Atividade Trabalhista com Editar habilitado. Aviso de análise documental e badges Pendente removidos conforme as leituras atuais.
- [x] Edição integrada comprovada em Localização: complemento fictício alterado para Unidade de teste QA aprovação, salvo e confirmado após recarga completa. Em seguida, restaurado para Unidade de teste pelo mesmo formulário e confirmado em tela. Nenhum dado pessoal real ou valor financeiro alterado.
- [x] Aba Documentação mostra os dois nomes de arquivos fictícios com Aprovado, mantendo os controles existentes. A mudança do Admin foi recebida pela API do portal, sem alteração manual de nível, guard ou permissão.
- [!] Progresso ainda 0%: a API devolve currentLevel null, nextLevel LEVEL_1, approvedRequirements 0, requiredRequirements 1 e documentComplianceStatus Pending. A configuração traz RG isRequired false e CNH isRequired true, pendente/sem arquivo. Portanto os arquivos RG estão aprovados, mas não completam o requisito atualmente configurado. Alinhar regra/configuração de nível às alternativas do fluxo aprovado do Figma; não criar campo CNH obrigatório nem simular 100% no front.
- Regra preservada: edição documental usa a aba Documentação. Reprovação/reenvio e progressão após CNH foram retestados posteriormente. Contatos sem vínculo e envio final continuam nas pendências de contrato; não são novos campos/ações a criar na tela.

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


## CNH aprovada pelo usuário — progresso e edição retestados, 20/10

O usuário realizou a aprovação no Admin. Reteste na mesma conta e nas versões já publicadas, sem alterar o Figma, campos, ações, guards ou permissões.

- [x] GET administrativo de progresso confirmou progressPercentage 100, approvedRequirements 1, requiredRequirements 1, currentLevel LEVEL_1, nextLevel null, documentClassification A e documentComplianceStatus OK.
- [x] Requisito CNH: Approved, Complete, countsAsComplete true e isRequired true. O RG mais recente continua Uploaded/Pending/opcional. Overview tem 5 registros: 3 aprovados, 1 pendente e 1 rejeitado. Assim 100% é conclusão dos requisitos configurados, não aprovação de todos os arquivos nem envio final do cadastro.
- [x] Área do Cliente mostrou 100% concluído e CNH aprovada após recarga/abertura de Documentação; leitura visual e resposta do servidor coerentes.
- [x] Dados Básicos, Localização e Atividade Trabalhista com Editar habilitado. Teste de escrita em Localização: complemento fictício Unidade de teste → Unidade de teste QA CNH; Salvar, recarga completa e persistência confirmada. Valor original Unidade de teste restaurado pelo formulário e confirmado após nova recarga; edição permaneceu habilitada.
- [x] Nenhuma falha nova do front reproduzida; nenhuma alteração de runtime, layout ou publicação nova necessária. Somente documentação atualizada. Evidência: cliente-cnh-aprovada-progresso-100.png.

**Encerrado:** reteste da porcentagem após aprovação da CNH e gravação/persistência da edição de Localização. **Backend ainda aberto:** alinhar CNH obrigatória às alternativas do Figma (não exigir documento adicional ao RG/passaporte previsto), vínculo/metadados no replace e as demais lacunas já registradas. Não cobrar 0% como falha atual desta conta nem confundir nível documental completo com todas as sete etapas concluídas.


## Perfil — contatos reais e preservação na edição básica, 20/10

- [x] QA 8: corrigida leitura de primaryEmail/mobilePhone estruturados no resumo. Consulta mostra a máscara real em vez de Não informado; edição usa valores dos contatos principais obtidos no perfil completo, nunca o objeto ou a máscara.
- [x] Escrita rejeita objeto inválido de contato e leitura recusa primários ambíguos antes de abrir edição. Testes verificam máscaras, preservação de contatos/endereço e alteração independente de dado pessoal.
- [x] Portal 639bd6f/pipeline 39480681134 aprovado em lint, 165 testes, build, upload e ativação. Na conta do usuário, naturalidade fictícia editada/salva/retomada e restaurada/retomada. Hash independente confirmou todos os contatos idênticos ao estado anterior. Nenhum dado de contato integral ou senha registrado.
- [x] Desktop/celular 390 px conferidos sem overflow. Layout/campos/ações existentes preservados; não houve alteração de documentos aprovados, níveis ou permissões. Evidência: cliente-perfil-contatos-api-corrigidos.png.

Falha do frontend encerrada; não é pendência de cadastro/campo de contato no backend. O checklist geral foi atualizado para não repetir como abertos os retestes documentais e de edição já feitos. Os bloqueios contratuais/configuração e homologação final pelo QA permanecem separados no documento consolidado.


## QA do perfil — valores financeiros opcionais e gravação por seção, 20/10

Próximo ajuste independente do backend no QA 8: a edição de Atividade Trabalhista exigia preencher todos os valores financeiros, embora o contrato aceite null, e regravava o profissional mesmo quando só uma renda era alterada. O perfil agora aceita ausência explícita sem transformá-la em zero, mantém zero e decimais e envia apenas o perfil que efetivamente mudou. Valores inválidos/negativos são validados antes de iniciar as escritas. Comparação decimal não converte strings para float no payload; moeda/vigências e metadados profissionais são preservados.

- [x] Portal b42b66d publicado; pipeline 39481860662 aprovada em lint, 170 testes, build, upload e ativação. Testes incluem null/zero/decimais, formatação equivalente sem escrita, limpeza intencional, alteração profissional isolada e validação antes da gravação.
- [x] Na conta do usuário em homologação, valor negativo rejeitado com erro na seção e rascunho preservado. Corrigido para valor fictício válido, renda familiar apagada e bens zero mantidos; salvamento concluiu e recarga confirmou decimal, ausência e zero distintos.
- [x] Consulta administrativa independente confirmou householdMonthlyIncome null, declaredNetWorth 0 e valor decimal salvo; moeda/vigências preservadas e perfil profissional integralmente idêntico à leitura anterior.
- [x] Valores fictícios originais restaurados pela mesma edição e recarregados. Nova leitura administrativa confirmou rendas/bens/moeda/vigências iguais ao início e profissional intacto. Nenhuma transação financeira, contrato, documento ou permissão foi alterado.
- [x] Desktop e edição a 390 px conferidos; conteúdo 378 px para viewport 390, sem overflow. Descartar fechou a edição sem nova gravação; viewport restaurado. Campos, botões, seletor e composição existentes do Figma preservados; não foi criado campo técnico ou ação adicional.

Defeito do frontend encerrado, sem novo endpoint ou ajuste do servidor. Ausência real de dado continua Não informado; este teste não libera catálogos, escrita de contatos sem vínculo, termos/envio final nem o replace documental. Evidência: cliente-perfil-financeiro-validado.png (valores já restaurados).


## Perfil — falhas parciais e divergência após salvar, 20/10

- [x] Correção do frontend e2997fd: mantém base de edição separada de consultas; não repete uma escrita já confirmada ao tentar novamente após falha parcial.
- [x] Testes automatizados: falha na segunda escrita preserva rascunho/primeira confirmação; falha na primeira não envia a segunda; troca de sessão interrompe a sequência. Total 173 testes aprovados.
- [x] Correção a41ae98: usa a mensagem de erro existente para avisar quando a consulta após salvar retorna valores diferentes dos enviados. Mesmo layout, campos e ações.
- [ ] Homologação integrada do financeiro: backend grava novos valores no histórico, mas consulta atual retorna registro anterior. Pendência real detalhada em PENDENCIAS-BACKEND-QA.md; não considerar este cenário aprovado só pelo PUT aceito.

A aprovação anterior de leitura financeira integral foi revista por este reteste. Os cenários independentes de contatos, documentos e edição de localização não foram reabertos.

- [x] Deploy final a41ae98 / pipeline 39483544799 aprovado em lint, 173 testes, build, upload e ativação. Reteste com renda fictícia 1234.59 mostrou o aviso real de consulta divergente; campo consultado permaneceu com 1234.56. Falha parcial/troca de sessão cobertas por testes automatizados, sem induzir falha no servidor.
- [x] Valores originais restaurados por POST administrativo de teste ao endpoint existente de perfis financeiros, pois a consulta do portal já estava desatualizada. Histórico mais recente e consulta atual conferidos com rendas/bens/moeda/vigências originais; perfil profissional integralmente idêntico ao início. Não houve movimentação financeira.
- [x] Revisão visual: aviso existente visível e legível; 390 px com conteúdo 378 px, sem overflow. Viewport restaurado e perfil recarregado com os dados originais. Evidência: cliente-perfil-divergencia-financeira.png e cliente-perfil-aviso-consulta.png.
- [x] Lint/build do portal e do Admin aprovados; diff das alterações desta rodada sem erros. O diff global do portal ainda aponta whitespace em PRODUCT.md e docs/MILESTONE-3-INTEGRATION.md preexistentes, preservados fora destes commits.


## QA 8 — validação da data e estados de erro do perfil, 20/10

- [x] Data de nascimento futura/inexistente bloqueada antes da criação do PATCH, com regra reutilizada do cadastro. Sem nova idade mínima/obrigatoriedade e sem alterações de catálogo ou layout.
- [x] Testes de payload preservam contatos/endereços e recusam 29/02 inválido, mês/dia impossível, ano zero e data futura; aceitam ano bissexto, dia local atual e ausência permitida pelo contrato.
- [x] Templates reais do resumo e ProfileResourceState testados: erro em profissional ou financeiro mantém mensagem/retry sem campos de ausência/zero falsos; demais seções seguem visíveis. Loading e retorno bem-sucedido também conferidos.
- [x] Descartar limpa a mensagem da edição cancelada, sem novo campo/ação.
- [x] Portal 916fc56 publicado; pipeline 39486635711 aprovada em lint, 177 testes, build, upload e ativação. Pipeline intermediária ded785c cancelada em favor da versão final.
- [x] Na conta do usuário, data futura bloqueada com erro no mesmo bloco; rascunho preservado e demais inputs idênticos aos anteriores. Descartar fechou a edição e zerou os erros; reabertura trouxe os dados originais consultados e Salvar desabilitado, sem envio de alteração cadastral.
- [x] Celular 390 px: conteúdo 378 px, mensagem 313 px, sem estouro. Repetidos bloqueio local e descarte; viewport restaurado. Resumo de Ajustes conferido com dados reais, renda e bens zero preservados; Perfil Completo deixado aberto.
- [x] Lint/build local do portal e Admin aprovados; diff dos commits desta rodada sem erros. Alterações preexistentes em PRODUCT.md, MILESTONE-3-INTEGRATION.md e swagger administrativo preservadas fora dos commits.
- [x] Evidências: cliente-perfil-validacao-nascimento.png e cliente-resumo-perfil-api-validado.png. Estados de falha de consulta verificados nos templates por teste automatizado; sem provocação de falhas no backend.

Não simular falhas do servidor em homologação para testar a apresentação: os cenários de erro estão cobertos por teste automatizado de renderização. O bug de consulta financeira vigente permanece bloqueio do backend, independente destas correções.


## QA 8 — erro, vazio e concorrência na consulta de sessões, 20/10

- [x] Nenhuma sessão disponível aparece apenas em sucesso vazio; erro e loading não simulam conta sem sessões. Mantidos tabela, colunas e controle Tentar novamente existentes.
- [x] Erro de consulta antiga não substitui sucesso mais recente; sucesso antigo não apaga erro atual. Respostas após troca de sessão ou desmontagem não atualizam o estado da conta.
- [x] Script real e template Vue testados; nova tentativa limpa o erro e retorna linhas reais formatadas com IP mascarado. Total 183 testes aprovados.
- [x] Publicação final 587e4ba confirmada na pipeline 39487751656 aprovada em lint, 183 testes, build, upload e ativação. Rodapé/contagem também ficam ocultos quando os dados estão indisponíveis, preservando a paginação normal após sucesso.
- [x] Na conta do usuário, duas sessões reais renderizadas, sem erro nem mensagem de vazio e com IP mascarado. Ação Deslogar preservada e não acionada; nenhuma sessão foi revogada.
- [x] Revisão desktop/celular: viewport 390 px e documento 378 px; tabela permanece com rolagem horizontal interna, sem alargar a página. Viewport restaurado; Ajustes mantido aberto.
- [x] Lint/build local de portal e Admin aprovados; diff das alterações desta rodada sem erros. Modificações preexistentes de PRODUCT.md, MILESTONE-3-INTEGRATION.md e swagger administrativo preservadas.
- [x] Evidência: cliente-perfil-sessoes-validadas.png. Vazio, loading, erro, retry e concorrência testados automaticamente no script/template reais, sem simular respostas dentro do aplicativo publicado.

Sem revogação de sessões, logout ou alteração de preferências/perfil nesta rodada. Falhas e concorrência são cenários automatizados com respostas injetadas somente no teste.


## QA 8 — paginação do catálogo bancário no perfil, 20/10

- [x] Consulta real do catálogo: 513 instituições, 3 páginas (200/200/113). Banco Órama, código 325, presente na terceira página e ausente da lista anterior limitada à primeira.
- [x] Resumo de Contas Bancárias e Perfil Completo usam o mesmo carregamento completo, preservando campos, ações e filtro existente de bancos ativos.
- [x] Testes validam todas as páginas, vazio real, falha intermediária sem lista parcial, metadados ausentes/inconsistentes, IDs repetidos e interrupção após troca de sessão. Total 189 testes aprovados.
- [x] Publicação final 027257b confirmada na pipeline 39489262330 aprovada em lint, 189 testes, build, upload e ativação. Banco Órama (325), da terceira página, novamente selecionado no controle existente; formulário cancelado sem salvar.

Reteste planejado somente de leitura/seleção e cancelamento do formulário existente, sem criar conta bancária, alterar titularidade, definir principal, arquivar ou movimentar valores. Não requer novo endpoint ou campo no backend.

- [x] Catálogo 97f5e72 publicado na pipeline 39488689472 aprovada. Banco Órama (325), opção de índice 512 oriunda da terceira página, localizado e selecionado no formulário existente; Cancelar fechou o rascunho e a conta continuou sem contas cadastradas.
- [x] Diagnóstico mobile identificou campo com largura mínima de 455 px, causando overflow no formulário estreito. Correção 027257b restringe o grid interno dos campos ao espaço disponível e reutiliza a truncagem nativa do QSelect.
- [x] Reteste mobile final: viewport 390 px, documento 378 px, card clientWidth/scrollWidth ambos 317 px; campo 237 px, texto natural 401 px truncado no espaço disponível de 183 px. Sem rolagem horizontal no formulário, sem ocultar controles.
- [x] Formulário cancelado e resumo de Contas Bancárias em Ajustes conferido com o estado vazio real da conta. Nenhuma conta criada/editada/arquivada; nenhuma alteração de titularidade, principal ou valores. Viewport restaurado.
- [x] Lint/build de portal e Admin e diff dos commits/documentos desta rodada conferidos. Alterações preexistentes de PRODUCT.md, MILESTONE-3-INTEGRATION.md e swagger administrativo mantidas fora dos commits.
- [x] Evidências: cliente-perfil-catalogo-bancos-completo.png e cliente-perfil-banco-mobile-sem-overflow.png. Falha intermediária/paginação inconsistente e troca de sessão exercitadas automaticamente, sem induzir falhas na API publicada.


## Admin — QA 12/15: edição financeira sem arredondamento ou gravação equivalente, 20/10

- [x] Input preserva string decimal até o plano HTTP; sem Number no transporte do valor digitado. Plano mantém moeda/vigências e distingue null/zero.
- [x] Dirty e destaque da seção usam comparação decimal normalizada; formatação equivalente permanece sem alteração e não anuncia salvamento nem cria registro.
- [x] 78 testes completos aprovados com a flag experimental-vm-modules: inclui template Vue real até plano HTTP, decimais além da precisão segura do float, negativos/invalidade, zero/null e ausência de escrita em formatação equivalente.
- [x] Deploy final 96ebd34 confirmado na pipeline 39497171684 (lint, build, upload e ativação); 78 testes completos executados localmente com experimental-vm-modules, não pelo npm test legado.
- [x] No Admin publicado, os cinco campos existentes foram mantidos. Formatações 01234.5600, 2345.670 e 0.00 não destacaram campos nem habilitaram Salvar. Decimal distinto habilitou o botão e destacou somente o campo alterado.
- [x] Valor grande digitado permaneceu exato após blur, sem envio à API. Negativo mostrou validação local, preservou rascunho e não gravou. Descartar abriu o diálogo do Figma e encerrou a edição após confirmação.
- [x] Mobile 390 px: documento 375 px e seção 344 px, sem overflow; zero equivalente não habilitou Salvar. Viewport restaurado, edição encerrada e ficha recarregada com os valores originais.
- [x] Leitura administrativa independente e comparação por hash confirmaram perfil profissional e histórico financeiro integralmente idênticos ao baseline. Nenhum registro financeiro ou profissional novo, movimentação, documento, decisão ou permissão alterados.
- [x] Diff dos commits e documentos sem erros; swagger administrativo preexistente preservado fora dos commits. Evidência admin-financeiro-formatacao-sem-gravacao.png.

Este lote não encerra a divergência entre histórico financeiro e consulta vigente do backend. Teste integrado planejado de leitura/validação/descarte, sem criar histórico financeiro para contornar a consulta. Valores grandes são fixtures automatizadas, nunca enviados para a API.


## Admin — QA 17: última consulta e estados da lista de clientes, 20/10

- [x] Somente a busca/filtro/visualização mais recente atualiza linhas/paginação; resposta antiga ou após saída não repõe dados anteriores. Callback tardio após desmontagem não inicia consulta nem limpa outra tela.
- [x] Erro reutiliza ResourceState/retentativa existentes; não vira vazio legítimo ou exportação dos dados anteriores. Exportar/Comparar bloqueados durante carregamento/erro, com controles de negócio preservados.
- [x] Script real do componente testado com respostas concorrentes/controladas e retry; 85 testes completos aprovados localmente com a flag experimental-vm-modules. Lint/build aprovados.
- [x] Deploy 00d601f confirmado na pipeline 39498456402 em lint, build, upload e ativação. Suite local completa: 85 testes aprovados; não atribuir essa suíte ao npm test legado da pipeline.
- [x] Homologação: busca Jorge e filtro Prospect retornaram somente a ficha correspondente em tabela e cartões; exportação voltou a ficar disponível após leitura concluída. Nenhum arquivo de clientes exportado.
- [x] Busca sem correspondência mostrou Nenhum cliente encontrado e contagem 0 a 0 de 0; não tratada como falha. Limpar filtros/busca retomou os 12 registros; página 2 exibiu os dois restantes e footer 11 a 12 de 12.
- [x] Mobile 390 px: documento 375 px, sem alargamento horizontal da página. Tabela, controles e estado vazio revisados; viewport restaurado e lista voltou a cartões, sem filtros ou busca.
- [x] Erro/retry e respostas fora de ordem cobertos automaticamente no script real e no recurso existente; não foram provocadas falhas na API de homologação. Cadastros, documentos, decisões, saldos e permissões preservados.
- [x] Diff de código/documentos sem erros; swagger preexistente não incluído. Evidência admin-lista-clientes-vazia-validada.png.

Nenhum cadastro ou dado financeiro alterado. Falhas e respostas fora de ordem exercitadas automaticamente; não provocar falhas do backend para validar apresentação. Unicidade de e-mail e investigação do login com identidade divergente continuam pendências independentes.

## Rodada 20/10 — catálogo bancário do perfil no Admin

- Defeito de frontend: a seção consultava apenas 200 dos 513 bancos ativos. O mesmo catálogo já corrigido no portal agora é lido por inteiro no Admin, preservando o formulário e as ações do desenho.
- A publicação das opções só ocorre após confirmar todas as páginas e os totais; falha de uma página não aparece como lista vazia ou resultado completo. O banner com Tentar novamente existente recupera a seção.
- Na porta 8080, a pesquisa `orama` encontrou o banco 325 — Órama, presente na terceira página. Formulário apenas consultado, sem cadastrar conta nem realizar operação financeira.
- Testes: seis novos cenários cobrem 513 registros, catálogo vazio, falha/retry, paginação inconsistente e integração com os nomes/erro da seção. Suíte completa: 91 aprovados.
- Não depende de endpoint novo. Pendências contratuais anteriores permanecem abertas.

Reteste publicado desta rodada: banco Órama selecionado em `https://admin.strategyanalytics.com.br/` após recarga do deploy ddfb04d. Em 390 px, documento com 375 px e card com largura interna/rolável de 326 px; nome longo limitado ao campo. Formulário cancelado, perfil permaneceu sem conta bancária. Evidência: `admin-perfil-catalogo-bancario-completo.png`. Nenhuma operação financeira executada.

## Rodada 20/10 — validação de inteiros no patrimônio administrativo

- Defeito de frontend: campos de contagem/anos usavam passo livre e conversão numérica genérica, permitindo montar payload com frações incompatíveis com os campos int32 do Swagger atual.
- Corrigidos os campos existentes: ano de fabricação/modelo, quartos/banheiros, total de parcelas/pagas e prazo em meses. Regra reutilizada no formulário e no payload; opcionais vazios permanecem nulos e zero continua válido. O prazo mantém o texto até validar, sem arredondar frações muito pequenas. Nenhum campo/ação foi acrescentado.
- Dinheiro e áreas permanecem decimais; não foram criados limites de ano/calendário ou outras regras de negócio além do contrato de inteiros já publicado.
- Testes: frações (inclusive além da precisão numérica), negativos, não finitos e limite int32; opcionais, zero e áreas decimais preservados. Suíte completa: 93 aprovados. No navegador em 8080, ano 2020.5 exibe erro e 2020 remove o erro; formulário descartado sem gravar.
- Defeito corrigido no front, não incluído na tabela de bugs do backend. Publicação 9d10d93 confirmada na pipeline 39500642230 (sucesso). Reteste no Admin publicado rejeitou 2020.5/2021.5 nos dois anos; correção para 2020 removeu o erro, ano modelo vazio foi aceito e Valor FIPE 1234.56 preservado. Em 390 px, documento com 390 px e card com largura interna/rolável de 374 px, sem overflow horizontal. Formulário descartado sem gravar. Evidência: `admin-patrimonio-validacao-inteiros.png`.

## Rodada 20/10 — nascimento na identificação administrativa

- Na revisão funcional dos itens QA 11/15, identificada ausência de validação de nascimento no editor administrativo. O portal já rejeitava datas impossíveis ou futuras.
- Correção na validação da seção: formato de calendário, anos bissextos e comparação com o dia local atual, sem criar idade mínima ou obrigatoriedade adicional. Campo vazio permanece permitido pelo contrato atual.
- O erro usa o resumo e o campo existentes; todos os campos continuam na seção e os demais lápis ficam bloqueados durante a edição, conforme C24.
- Suíte completa com 95 testes aprovada, incluindo nascimento futuro/impossível, hoje, anos bissextos e opcionais. Teste com o controlador real comprovou zero escritas ao reprovar a data e salvamento permitido após correção.
- Em 8080, data futura 2099-01-01 bloqueada no Salvar. Descarte e reabertura restauraram a data original da API, sem erro e sem mudanças habilitadas. Nenhum dado da conta de teste foi gravado nesta rodada.
- Publicação 60423d3 confirmada na pipeline 39501477543 (lint/build/upload/ativação aprovados). Em homologação, nascimento futuro bloqueado; descarte/reabertura restauraram o original, limparam o erro e mantiveram Salvar desabilitado sem mudança. Em 390 px, documento com 375 px e seção com largura interna/rolável de 342 px, sem overflow. Conteúdo de identification-contact integralmente igual por hash antes/depois do reteste, excluindo requestId/correlationId transitórios do envelope. Evidência: `admin-perfil-validacao-nascimento.png`. Não é bug do backend nem exige campos ou endpoints novos.

## Rodada 20/10 — configuração documental acessível pelo menu

- Conferência em homologação: Contratos abriu cinco registros pelo menu; Transações abriu seis e Bancos exibiu os dez registros da página. Configurações mantém os acessos existentes a Formulários, Bancos e Configuração documental. Sem novos módulos ou ações.
- Reprovação documental sem motivo foi bloqueada no modal existente; teste cancelado sem revisar arquivo. Evidência: `admin-qa-motivo-obrigatorio-revalidado.png`.
- Durante essa conferência, encontrada falha de frontend: Configuração documental recebia 30 tipos da API, mas QTable exibia apenas cinco e escondia sua paginação. Corrigida a paginação interna para mostrar todos os registros recebidos, como já ocorre na gestão de bancos; a tabela de schemas recebeu o mesmo ajuste. Nenhum botão ou campo foi criado.
- Em 8080, 30 ações de Configurar tipo documental disponíveis; pesquisa RG retorna um registro, busca inexistente mostra o vazio, limpar restaura os 30 e o último tipo abre o editor existente. Editor fechado sem alterações. Não foram criados tipos, categorias, schemas ou associações.
- Validação automática: suíte existente com 95 testes aprovada, lint/build/diff-check aprovados. Não foi criado teste que apenas replique os atributos da tabela. A massa real com mais de cinco schemas não foi alterada/criada para esta conferência; o ajuste remove o corte local sobre a página já recebida, sem modificar o contrato HTTP.
- Publicação 2eea460 confirmada na pipeline 39502645633, com lint/build/upload/ativação aprovados. A versão anterior exibiu cinco ações; após recarregar a publicação, 30 tipos exibidos. Categoria Documentação Pessoal mostrou sete, busca RG um, busca sem correspondência mostrou vazio e limpar filtros restaurou os 30. Editor do último tipo aberto e fechado sem gravação. Em 390 px, página com 375 px e rolagem horizontal restrita à tabela de 343 px (conteúdo 848 px), sem overflow da página. Evidência: `admin-configuracao-documental-lista-completa.png`. Os módulos e estados sem contrato continuam no documento de pendências do backend.

## Rodada 20/10 — busca global no catálogo de bancos

- Falha reproduzida em homologação: pesquisar 325 na primeira página mostrava Nenhum banco encontrado, com rodapé ainda indicando 513 registros, embora o banco Órama esteja na última página. A busca filtrava apenas os dez bancos já carregados.
- Reutilizada readBankCatalog para consultar integralmente as três páginas existentes da API. Busca normaliza acentos/maiúsculas e filtra o conjunto completo antes de aplicar a paginação existente. Pesquisar/trocar tamanho volta à página 1; rodapé conta somente o resultado filtrado. Somente ativos continua usando o filtro existente da API.
- Falha intermediária não publica catálogo parcial; loading/erro não exibem rodapé ou vazio enganoso. A retentativa e os erros por país permanecem independentes. Nenhum campo, coluna, ação ou endpoint foi criado.
- Em 8080: código 325 encontrou Órama e país Brasil, rodapé 1 a 1 de 1; pesquisa sem acento encontrou o mesmo banco; busca inexistente mostrou 0 a 0 de 0; limpar restaurou 513; página 52 mostrou 511 a 513 e nova pesquisa retornou à página 1. Nenhum banco cadastrado.
- 99 testes aprovados, incluindo quatro novos testes funcionais do componente para busca completa, contagens/paginação, falha/retry e filtro de ativos. Lint/build e revisão visual aprovados. Publicação funcional 3ea3c43 e complemento de contraste 62babcf confirmados nas pipelines 39503676010/39503972684. Em homologação, todos os cenários locais foram repetidos com sucesso, incluindo Somente ativos e o botão Limpar. Evidência: `admin-bancos-busca-catalogo-completo.png`.
- Não há solicitação de alteração da API para esta correção.

Complemento visual desta rodada: no primeiro deploy 3ea3c43, busca por 325 e contagem filtrada passaram, mas o texto global branco do input estava sobre superfície clara. Aplicado o contexto dark já usado nas tabelas integradas do Admin à tabela, busca e filtro existentes. Sem nova paleta, coluna ou ação. Reteste final de 62babcf confirmado: texto branco sobre superfície escura, com busca visível. Em 390 px, documento com 390 px e campo com 310 px, sem overflow horizontal da página. Formulários de cadastro não utilizados.


## QA 8 — contatos do perfil após o retorno do backend, 20/10

- [x] Retirar a restrição local que permitia Editar somente uma lista de exatamente um contato.
- [x] Reutilizar nome/telefone e Editar/Salvar/Descartar; lista vazia cadastra o primeiro contato e lista múltipla edita os registros recebidos. Sem adicionar/remover linhas ou expor relationship/e-mail.
- [x] Preservar IDs e metadados ocultos, validar a seção antes de escrever e retentar somente atualizações pendentes após falha parcial.
- [x] Portal: 207 testes, lint e build aprovados. Teste integrado do mesmo adaptador com Cláudio criou/editou contato fictício, confirmou leitura e removeu o registro descartável; lista original preservada.
- [x] Publicação 2591a8b / pipeline 39526079478 aprovada no portal. Na conta do usuário, lista vazia abriu a edição; nome/telefone inválidos recusados, descarte/reabertura limpos, sem criar contato.
- [x] Desktop 1366 px e mobile 390 px conferidos; largura útil/rolagem 378/378 px no mobile. Viewport restaurado; evidências cliente-contatos-primeiro-editor-hml.png e cliente-contatos-primeiro-editor-mobile-hml.png.
- [ ] Reteste manual de lista múltipla em conta aprovada pelo QA; cobertura automática de múltiplos contatos e falha parcial concluída.

Esta é uma correção do frontend e não entra na tabela de bugs do backend. A declaração persistida de ausência de contato e as demais pendências cadastrais continuam separadas.


## QA 8 — ocupação do perfil sem catálogo, 20/10

- [x] Reproduzido no portal publicado: Editar abria a seção, mas a ocupação permanecia um seletor desabilitado. A API profissional já aceita texto livre.
- [x] Reutilizado o QInput existente, mantendo campo, rótulo, posição e ações. Gênero/estado civil/nacionalidades continuam nos catálogos reais.
- [x] 207 testes existentes, lint, build e diff-check do lote aprovados. Preservação de empregador/vigências e não envio do financeiro em mudança só profissional já possuem cobertura funcional.
- [x] Publicação a5104f2 / pipeline 39527846327 aprovada. Na conta do usuário em homologação: ocupação vazia recusada; ocupação fictícia salva e retomada após recarga; valor original restaurado pelo formulário.
- [x] Consulta independente do Admin confirmou restauração, empregador/vigência/isCurrent preservados e histórico financeiro integralmente igual ao baseline.
- [x] Desktop 1366 px/mobile 390 px revisados, largura útil/rolagem 378/378 px no mobile. Viewport restaurado; reabertura sem mudanças manteve Salvar desabilitado, e edição encerrada por Descartar.
- [x] Evidências cliente-ocupacao-editavel-hml.png e cliente-ocupacao-editavel-mobile-hml.png.

Não solicitar catálogo de ocupações como bloqueio da edição. A revalidação independente do QA e as pendências reais de moeda, documentos e revisão continuam separadas.


## QA 8 — concorrência de Contratos e Termos, 20/10

- [x] Cinco falhas de concorrência reproduzidas pelo script real do componente antes da correção.
- [x] Apenas a consulta atual publica arquivos/erro/loading de cada seção; paginação antiga interrompida, saída/troca de sessão invalida resultados.
- [x] Arquivos disponíveis preservados em falha parcial; erro de termos não bloqueia Contratos nem vira vazio falso.
- [x] Nenhum campo, ação ou composição visual alterados. Baixar/Tentar novamente e os estados existentes preservados.
- [x] 215 testes do portal aprovados, com oito cenários novos; lint/build/diff-check do lote aprovados.
- [x] Publicação 2b07793 / pipeline 39528553525 aprovada. Na conta do usuário, Contratos vazio após consulta bem-sucedida, Termos indisponível com retentativa independente; saída/retorno à aba conferidos.
- [x] Desktop 1366 px e mobile 390 px revisados; largura útil/rolagem 378/378 px, viewport restaurado. Sem gravação cadastral/aceite; conta sem documentos contratuais, portanto sem download real nesta rodada.
- [x] Evidências cliente-contratos-termos-estados-hml.png e cliente-contratos-termos-estados-mobile-hml.png.

Concorrência/falhas provocadas somente nos testes automatizados. O contexto dos consentimentos permanece dependência real do backend; não foi inventado nem o erro tratado como ausência de termos.


## QA 8 — operações das contas bancárias do portal, 20/10

- [x] Sete cenários de falha reproduzidos no componente/template reais antes da correção.
- [x] Salvar, Principal e Arquivar não disparam chamadas duplicadas; campos/cancelamento bloqueados durante envio. Falha preserva o rascunho; sucesso limpa dados integrais antes de recarregar.
- [x] Consulta atual prevalece, lista anterior é limpa ao carregar; erro não vira vazio e Adicionar não usa catálogo indisponível.
- [x] Saída da aba/troca de sessão impedem formulário, lista ou notificação tardios.
- [x] 224 testes do portal, lint, build e diff-check do lote aprovados; nenhum campo ou ação novo.
- [x] Publicação 154080a / pipeline 39529228159 aprovada. Conta do usuário: carregamento bloqueou Adicionar até concluir, vazio confirmado, Salvar sem dados recusado, Cancelar/Fechar e reabertura limpa conferidos.
- [x] Desktop 1366 px e mobile 390 px conferidos; documento/diálogo com largura útil/rolagem 378/378 px no mobile. Viewport restaurado; formulário encerrado e lista permaneceu vazia.
- [x] Evidências cliente-conta-bancaria-formulario-hml.png e cliente-conta-bancaria-formulario-mobile-hml.png. Nenhuma conta criada/priorizada/arquivada.

Escritas e respostas fora de ordem controladas nos testes automatizados. Reteste visual sem cadastrar, priorizar ou arquivar conta; não representa homologação integral das escritas financeiras.


## QA 8/10 — envio/substituição documental e orientações, 20/10

- [x] Seis falhas reproduzidas no script real antes da correção: envios repetidos, orientações antigas e respostas/notificações tardias.
- [x] Enviar/Substituir bloqueiam repetição antes de validar; campos e fechamento ficam bloqueados durante envio. Erro conserva arquivo/rascunho e sucesso limpa antes da recarga.
- [x] Orientações vinculadas ao tipo/país/abertura atuais; fechar/sair/trocar sessão invalida respostas antigas.
- [x] Consulta documental atual prevalece; guard e erro reais continuam impedindo upload.
- [x] 231 testes do portal, lint/build/diff-check do lote aprovados. Campos, ações, limites e payload existentes preservados.
- [x] Publicação 60c799d / pipeline 39530256286 aprovada. Conta do usuário preservou cinco documentos, 100% e três aprovados/um enviado/um rejeitado, com motivo visível.
- [x] Tipo/arquivo obrigatórios recusados antes de enviar; troca RG/CNH, cancelamento e reabertura limpa. Substituição retomou emissão existente e recusou arquivo vazio; cancelada sem substituir.
- [x] Desktop 1366 px/mobile 390 px, documento/diálogo com largura útil/rolagem 378/378 px. Viewport restaurado e diálogos fechados; nenhum novo upload/revisão/link temporário.
- [x] Evidências cliente-envio-documentos-formulario-hml.png e cliente-envio-documentos-formulario-mobile-hml.png.

Envios/erros/concorrência validados com respostas controladas nos testes, sem novos uploads no servidor. Regra CNH e vínculo/metadados do replace continuam no documento do backend e não foram simulados pelo front.


## QA 8 — nacionalidade e descrições indisponíveis, 20/10

- [x] Três falhas de apresentação reproduzidas: ID de nacionalidade salvo sem descrição aparecia como Não informado; catálogo parcial omitindo nacionalidades; PreferNotToSay sem tradução de fallback.
- [x] Países resolvidos preservados e descrição indisponível explícita para o restante, sem mostrar UUIDs ou gravar dados. Recuperação do catálogo restaura os nomes.
- [x] Ausência cadastral real, nacionalidade legada e labels oficiais do catálogo preservados.
- [x] 236 testes do portal, lint/build/diff-check do lote aprovados; nenhum campo ou ação novo.
- [x] Publicação 0e0de79 / pipeline 39531180021 aprovada. Conta do usuário manteve a ausência legítima de gênero/nacionalidade; catálogo abriu quatro labels reais em português, edição descartada sem gravar.
- [x] Desktop 1366 px/mobile 390 px conferidos, largura útil/rolagem 378/378 px, viewport restaurado.
- [x] Evidências cliente-perfil-descricoes-hml.png e cliente-perfil-descricoes-mobile-hml.png.

Falha/parcialidade do catálogo cobertas automaticamente, sem modificar o catálogo ou induzir erro na API. A conta usada na revisão tem nacionalidade realmente vazia; deve manter Não informado.


## Envio final com consentimentos — 22/10/2026

- [x] Aceite dos Termos de Uso e da Política de Privacidade reutilizado na etapa 7 com autorização do usuário, mantendo o padrão visual aprovado. Textos reais/versões disponíveis por links existentes; sem aceite automático de marketing/cookies.
- [x] Implementação publicada no portal (fdd90d2; pipeline 39889717046: testes, lint, build, upload e ativação aprovados). 283 testes aprovados; desktop e 390 px conferidos.
- [x] Consulta versionada precede o envio. Versão alterada exige novo aceite. Tela de sucesso só aparece com submissão confirmada e suporta recarga; link direto sem envio volta à revisão.
- [x] Usuário autorizou o aceite dos dois termos 1.0. Envio real concluído pela etapa 7 da conta fictícia client@example.com; cookies/marketing permaneceram Pending.
- [x] Integrado: UnderReview/lock=true e PUT profissional 409; reprovação no Admin → UpdateRequired/lock=false e PUT 200; motivo visível no cliente; reenvio fictício via API → novo bloqueio; aprovação única dos dois lados no Admin → Approved/lock=false e PUT 200. Edição real pela tela salva/retomada/restaurada. Logout e novo login mantiveram status e confirmação de envio. Ver relatório para separar preparo via API das ações efetivamente testadas na tela.

Detalhes e evidências: [QA-2026-10-22-ENVIO-CONSENTIMENTOS.md](QA-2026-10-22-ENVIO-CONSENTIMENTOS.md). Pendência backend confirmada: requiredConsentsCompleted=true diverge de isSatisfied=false/termos Pending na consulta versionada. O front não usa a flag legada como comprovante de aceite.

- [x] RG aprovado sozinho elevou o progresso documental a 100%; CNH existente não foi aprovada e nenhum passaporte foi enviado. API confirma grupo alternativo IDENTITY, 1/1 requisito. Corrigida no front a indicação individual de obrigatório para os documentos alternativos; obrigações independentes continuam identificadas. 284 testes, lint/build e revisão local aprovados. Commit do ajuste: 76d2b06; confirmação do deploy registrada no relatório da rodada.

Confirmação final em 23/10: ajuste 76d2b06, pipeline 39892601211 aprovada, indicação de passaporte obrigatório removida em homologação e progresso 100% mantido. Envio/bloqueio/análise concluídos neste roteiro; pendências de arquivos e reenvio pela tela permanecem separadas.


## Upload de reenvio pela Área do Cliente — 23/10/2026

- [x] Versões históricas da identificação não oferecem reenvio; arquivos antigos não reaparecem como anexos soltos. Frente/verso mantidos sob a identificação atual, nas mesmas colunas e ações.
- [x] Estado atual reconsultado antes de substituir: identificação alterada ou arquivo já aprovado bloqueia a escrita e mantém o arquivo selecionado. Testes cobrem os dois cenários e sessão.
- [x] Publicado 65fc601; pipeline 39894409091 aprovada. 288 testes, lint, build e diff aprovados.
- [x] Frente e verso fictícios reenviados pelo seletor real do navegador em homologação. Enviar sem arquivo validado; novos IDs/Front/Back/vínculo atual conferidos. Metadados da identificação preservados por comparação antes/depois.
- [x] Aprovação única pela tela do Admin aprovou os dois lados; progresso 100%, onboarding Approved e edição liberada. Recarga manteve os nomes novos e os status aprovados. O controle de reenvio do perfil deixa de ser pendência não testada.

Relatório: QA-2026-10-23-REENVIO-PERFIL.md. Pendência real do backend: substituição de identificação histórica pode afetar progresso/onboarding atual; caminho removido do front e detalhado no documento consolidado. Não cobrar perda de metadados ou vínculo no reenvio atual, pois foram preservados no teste.


## QA de seleção e ficha — 23/10

Checklist visual, binds, cenários e dependências: [Seleção e ficha do cliente](QA-2026-10-23-SELECAO-FICHA.md). Os bloqueios de API estão separados dos ajustes do front; esta rodada não encerra as demais pendências históricas do Marco 3.


## Complemento C04 e compliance — 23/10

- [x] Todos no filtro Status e estados de seleção conforme C04.
- [x] Alerta no filtro/badge, prefixo Compliance na lista e badges consistentes no cabeçalho da ficha.
- [x] 115 testes, lint/build e verificação do diff do lote aprovados.
- [x] Publicado 525dfe2 / pipeline 39953877234 aprovada. Menu, Inativo → Todos, prefixo de compliance na lista e badges da ficha de Carlos conferidos no Admin publicado, sem gravação. Alerta com massa controlada nos testes e vazio legítimo local; não houve cliente real nesse estado nesta rodada.

Detalhes e limites no [relatório da seleção/ficha](QA-2026-10-23-SELECAO-FICHA.md#complemento--filtros-c04-e-indicadores-de-compliance). Mantidas as pendências reais do backend. Atualização posterior de 23/10: imagens no Admin integradas e testadas; ver relatório abaixo, sem encerrar o fluxo da Área do Cliente.


## Imagens do patrimônio no Admin — 23/10

Integração C11/C12 e testes fictícios: [relatório de imagens patrimoniais](QA-2026-10-23-IMAGENS-PATRIMONIO.md). Upload, vínculo, posições da vistoria e visualização passaram localmente na porta 8080 e no Admin publicado (6eab47c / pipeline 39959274171 aprovada, 124 testes, lint/build/diff). Arquivos fictícios persistiram após recarga, prévias carregaram e o contador lateral excluiu as fotos do patrimônio. Endpoints existentes utilizados, sem novos campos ou ações.


## Moeda do patrimônio no Admin — 23/10

- [x] Exibir os valores pela moeda persistida do bem, independente do carregamento da carteira, preservando o Figma.
- [x] 126 testes, lint/build e diff do lote aprovados; leitura local em BRL/EUR/USD e descarte do editor sem gravação.
- [x] Publicado 9909326 + complemento responsivo 3dbdb4c; pipelines 39968080972 e 39968642647 aprovadas. Valores dos 12 bens em BRL/EUR/USD e nomes legíveis em 390px conferidos no Admin, sem gravações. [Relatório da moeda patrimonial](QA-2026-10-23-MOEDA-PATRIMONIO.md).


## Ciclo do editor de patrimônio — QA 15/17, 23/10

- [x] Respostas pendentes invalidadas ao fechar, trocar de cliente ou sair; salvamento/fotos vinculados ao contexto original. Mesmos editores do Figma.
- [x] 132 testes, lint/build e diff do lote aprovados; descarte/reabertura sem gravação conferidos na porta 8080.
- [x] Publicado 073253d; pipeline 39970596392 aprovada na tentativa 2 (a primeira falhou por timeout SSH). Descarte/reabertura e troca Jorge → Cláudio → Jorge conferidos no Admin publicado, sem gravação e mantendo os editores do Figma. Atrasos/falhas de salvamento cobertos em testes controlados. [Ciclo de edição do patrimônio](QA-2026-10-23-EDITOR-PATRIMONIO.md).


## Ciclo das ações documentais — QA 10/17, 23/10

- [x] Loading/arquivo/diálogos isolados por cliente/documento; retorno de upload antigo não afeta o card atual. Controles do Figma mantidos.
- [x] 137 testes, lint/build/diff aprovados; consulta do PNG fictício e liberação dos controles conferidas em 8080.
- [x] Publicado eb53be3; pipeline 39973080495 aprovada. PNG fictício abriu, controles liberaram ao concluir, reprovação cancelada e troca Jorge/Cláudio conferida sem alterações documentais. Concorrência/upload/download cobertos de forma controlada. [Ciclo das ações documentais](QA-2026-10-23-CICLO-DOCUMENTOS.md).

## Reteste visual do admin — QA 93–105 (27/10/2026)

Publicado no admin em 27/10/2026: runtime `c3b1edd`, [deploy 40557196455](https://github.com/Statregy-Analytics/strategy-control/actions/runs/40557196455) concluído com sucesso. Revisão com os componentes reais em página
isolada temporária, dados de demonstração e adaptador que bloqueia todas as escritas.
A página e o adaptador foram removidos após a conferência. Após renovação da sessão,
a revisão autenticada descrita abaixo foi concluída. Gravações integradas não foram
executadas neste lote.

| Item | Entrega / verificação local |
| --- | --- |
| 93 | Salvar 120×32, check 16×16 e intervalo de 8 px medidos no DOM; tooltip glass de 32 px. |
| 94 | Removido o accordion que escondia os contratos; preservados título, ícone e contagem do componente existente. |
| 95 | Estado inicial sem seleção e composição total em tabela; clicar novamente desmarca; zeros somente quando os três totais são confirmados. Cinco linhas de composição multimoeda conferidas com dados de teste. |
| 96 | Barras dos quatro tipos com altura de 92 px e ícones em caixas de 40 px; badges e contagem documental. |
| 97 | Valor, toggle e saldo devedor alinhados na mesma linha no estado não quitado; conferido em imóvel e veículo. |
| 98 | Grade, rótulos, controles e mensagens de validação padronizados. Salvar vazio destaca todos os obrigatórios. Alturas das cinco seções do imóvel permaneceram iguais antes/depois dos erros. |
| 99 | Seletor de moeda interno com caixa 53×25, fonte 12 e seta 10. |
| 100 | Toggle em card de apoio, pista 40×22 e indicador branco de 16 px; estados Sim/Não conferidos. |
| 101 | Áreas em duas colunas e contadores de quartos/banheiros; decremento bloqueado no zero. Link de característica adicional mantido, sem persistência por falta de suporte no contrato atual. |
| 102 | Documento recebido sem aprovação usa PENDENTE amarelo; aprovado usa VALIDADO verde; ausência permanece Não enviado em card tracejado. Conferidos os três estados na edição. |
| 103 | Total de parcelas acima; pagas/restantes lado a lado; barra de 10 px. 120 totais e 30 pagas resultaram em 90 restantes e 25%. |
| 104 | Status e forma de contemplação em duas colunas iguais com ajuda contextual. |
| 105 | Informações financeiras e prazo em cards adjacentes no desktop; toggle habilita os campos; prazo livre exibe a indicação correspondente. |

Revisão responsiva em 390 px sem transbordamento da página; tabela de composição
mantém rolagem horizontal própria. Botão de salvar investimento sem quebra do rótulo.

Dependências: o item 95 ainda precisa do contrato/adapter das novas carteiras de
Jaquiel para homologação com dados reais (moeda principal, totais convertidos,
contratos/saldo parado, contagem de bens, origem e atualização). Dados ausentes
não são convertidos em saldos zero. O link de características adicionais do item
101 depende de definição de persistência no backend. Nenhum endpoint foi inventado.

Verificações automatizadas: 198 testes aprovados, lint e build aprovados.
`git diff --check` das alterações deste lote sem erros; o check global aponta
whitespace no Swagger já modificado antes deste lote, preservado sem alteração.


### Complemento — revisão autenticada dos itens 93–105

Sessão renovada pelo usuário. Conferência na ficha de Homologação Pessoa Física,
sem salvar registros e com todos os rascunhos descartados ao final:

- Botão Salvar por seção: 120×32, ícone 16×16 e intervalo de 8 px confirmados.
- Carteira Total seleciona/desmarca; Strategy exibiu dois contratos abertos, com
  título e contagem, sem accordion. A nova composição mantém os dados indisponíveis
  enquanto não existe adapter para o contrato novo, sem produzir zeros fictícios.
- Imóvel: obrigatórios destacados ao tentar salvar o formulário vazio; as cinco
  seções mantiveram exatamente as alturas anteriores. Nenhum cadastro foi enviado.
- Imóvel e veículo não quitados: valor, toggle e saldo devedor com a mesma posição
  vertical e larguras iguais. Documentação carregou o catálogo existente.
- Consórcio: 120 parcelas / 30 pagas produziram 90 restantes e 25%; status e forma
  de contemplação com a mesma largura e posição vertical.
- Investimento: prazo livre apresenta a indicação; ativar prazo determinado
  habilita vencimento e remove a indicação de prazo livre.
- A ficha não possui bens cadastrados: barras e badges de documentos existentes
  continuam conferidos com os dados locais de teste, sem homologação de gravação.

A conferência não exigiu alteração adicional de código. Publicação concluída: auditoria, 190 testes versionados, lint, build, upload e ativação aprovados. Os 198 testes locais incluem oito testes do estudo futuro, não incluídos nesta entrega. Admin e rota /dataManagement responderam HTTP 200; hashes dos arquivos de entrada JS/CSS publicados conferem com o build local.
