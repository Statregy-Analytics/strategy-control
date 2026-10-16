# Marco 3 — checklist manual

Última rodada administrativa: 12/10/2026. Complemento do portal: 13/10/2026. Admin localhost:8080; Portal localhost:9010 (origens CORS autorizadas).

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
