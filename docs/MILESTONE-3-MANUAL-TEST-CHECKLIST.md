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
