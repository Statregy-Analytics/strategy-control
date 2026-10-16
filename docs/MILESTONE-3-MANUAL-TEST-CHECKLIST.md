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
