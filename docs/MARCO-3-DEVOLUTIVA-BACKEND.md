# Marco 3 — retorno de homologação para o backend

Data: 13/10/2026. Resultado: **homologação parcial; não aprovar a entrega integralmente**.

Ambientes: Admin em http://localhost:8080; Área do Cliente em http://localhost:9010.
Manter essas origens no CORS. API consultada: https://strategyanalytics.codebiz.com.br
(e também o endereço de homologação Render fornecido).

## 1. Bloqueio reproduzido: Documentação de Cláudio

Conta de teste: claudio.manhaes.teste@example.com.
O responsável pelo produto informa que o cliente está no nível 2. Na consulta
real de 13/10, as respostas foram:

| Consulta GET | Resultado |
| --- | --- |
| /api/v1/client/profile/summary | 200; documentLevel = 1 |
| /api/v1/client/profile/documents/overview | 200 |
| /api/v1/client/profile/documents/progress | 200 |
| /api/v1/client/profile/document-types | 200 |
| /api/v1/client/profile/documents | 403; DocumentLevelInsufficient |

Trecho sanitizado da resposta 403:

```json
{
  "data": {
    "featureCode": "Communication",
    "blockingCode": "DocumentLevelInsufficient",
    "current": {
      "preferencesCompleted": true,
      "requiredConsentsCompleted": true,
      "profileCompleted": true,
      "documentLevel": 1
    },
    "required": {
      "preferencesCompleted": false,
      "requiredConsentsCompleted": false,
      "profileCompleted": true,
      "documentLevel": 2
    }
  },
  "success": false,
  "errors": [{
    "code": "DocumentLevelInsufficient",
    "message": "Client onboarding requirements are not satisfied.",
    "field": "Communication"
  }]
}
```

Solicitamos:
1. Conferir por que a aprovação de nível 2 informada não aparece no resumo e no guard.
2. Confirmar se a consulta de documentos deve usar a feature Communication.
3. Explicar a regra para consultar/enviar documentos quando o próprio envio é necessário
   para atingir o próximo nível. Não foi testado upload para contornar o bloqueio.
4. Retornar os critérios de liberação por operação (consulta, envio e substituição).

Reteste: resumo e guard devem refletir o nível correto; cliente autorizado deve listar
os documentos; cliente não autorizado deve receber o motivo estruturado correspondente.
A divergência de nível está confirmada entre a informação do produto e a API; a causa
interna e a associação da feature ainda precisam ser investigadas pelo backend.

## 2. Saque no portal: falta o identificador de moeda

GET /api/v1/client/wallets retorna id, type, currencyIsoCode, balance, reserved e available.
O envio do saque exige currencyId (UUID), não o código ISO. O catálogo de preferências
não resolve esse UUID. Enviar currencyId na carteira ou indicar endpoint acessível ao
cliente que forneça o mapeamento. Não derivaremos UUID nem utilizaremos credencial admin.

Reteste: selecionar a carteira, obter o UUID correto e enviar uma solicitação válida
em homologação, com autorização para a movimentação. Criação/aprovação/execução de novo
saque ainda não está aprovada por esta rodada.

## 3. Campos e catálogos que precisam de definição

Os itens abaixo são lacunas do contrato/documentação consultado, não falhas de execução
comprovadas. Confirmar se já existem definições atualizadas e fornecer exemplos válidos.

| Item | Definição solicitada |
| --- | --- |
| Transferência: destinationType | Valores aceitos e payload completo por destino. |
| Prazo de contrato: ContractTermRequest.unit | Enum/catálogo e regras de validação. Valores vistos em contratos existentes não substituem o contrato documentado. |
| Patrimônio: tipo e situação | Catálogos aceitos para criação e transições válidas. |
| AttachTransactionDocumentRequest.role | Papéis aceitos e exemplo de vínculo. |
| Universo de ativos elegíveis | Catálogo retornou vazio nas rodadas de 10 e 12/10; disponibilizar ativos de teste ou confirmar condição esperada. |

## 4. Dados financeiros e correspondência com o layout

Consulta real de 13/10:

| Cliente | Carteira Livre BRL | Reservado BRL | Disponível BRL | Capital contratado |
| --- | ---: | ---: | ---: | --- |
| Éric Vicente | 50.000,00 | 2.500,00 | 47.500,00 | BRL 0,00 e USD 250.000,00 |
| Cláudio Manhães | 25.000,00 | 0,00 | 25.000,00 | BRL 261.500,00 |

currentPosition, result e chart estão NotAvailable. Não são zero e não foram homologados
como cálculo pronto. Confirmar previsão de disponibilidade do motor e contrato de dados.

Confirmar a semântica para os espaços existentes:
- Carteira Total: qual campo representa o total? O frontend usa currentPosition e não
  soma capital contratado com dinheiro em carteira sem regra que exclua duplicidade.
- Investimentos: foi usado contractedCapital (capital alocado, não rendimento).
- Banking: foi usado balance da carteira Free, conforme a descrição original de carteira
  que recebe depósitos; confirmar essa equivalência e a exposição da reserva.
- Saldo Investível: não existe equivalência confirmada entre os tipos retornados.
- Conversão de moedas: fornecer taxa, data e regra se o valor convertido deve aparecer.
- Próxima distribuição, variação percentual e empréstimos: informar campos/endpoints.

Dados extras de extrato, movimentações, ledger e composição por classe/origem não geram
novas seções na Home. A inclusão visual depende de definição de produto. Não é um pedido
para remover esses dados da API. Moedas diferentes nunca são somadas diretamente.

## 5. O que foi efetivamente validado

- Admin: login; criar/editar/reabrir rascunho; consulta de contratos e participantes.
- Transações: lista, detalhe, observação, histórico, ledger e comprovante existente.
- Depósito de teste de R$ 1,00 criado em AwaitingReceipt e cancelado; sem execução.
- Carteira/composição, reservas e exportação do extrato CSV.
- Patrimônio: consulta e regravação de bem existente sem alteração de valores.
- Portal: consulta de Home/carteira/participações de Éric e Cláudio. Extrato e composição
  foram consultados em rodada anterior; as tabelas extras foram retiradas da Home para
  preservar o layout aprovado, sem caracterizar regressão da API.

## 6. O que ainda não está homologado integralmente

- Aprovação e execução de novas movimentações financeiras.
- Criação de novos saques e operações de contrato.
- Finalização, alteração de status e vínculos de contrato por escrita.
- Upload/substituição e acesso integral à documentação de Cláudio.
- Vínculos de documentos de contrato/patrimônio e arquivamento.
- Fluxos dependentes dos catálogos e definições do item 3.

Esses cenários precisam de uma rodada própria após resolver os bloqueios. Histórico
já existente, resposta 200 de leitura e build frontend não comprovam sucesso das escritas.

## 7. Correções do frontend nesta devolutiva

O frontend reconhecia qualquer mensagem genérica de onboarding como exigência de depósito.
Foi corrigido para interpretar blockingCode e níveis current/required, sem alterar a
permissão do servidor. Foi removida a instrução incorreta para realizar depósito nesse caso.
A Home também passa a traduzir PreferencesRequired e DocumentLevelInsufficient corretamente.
Demais negativas de permissão mantêm tratamento genérico, sem expor dados sensíveis.

Observação: client@example.com é outra conta. Em 13/10 retornou PreferencesRequired na
Home e lista de carteiras vazia. Esse diagnóstico não deve ser atribuído a Cláudio.

## Critério para fechar a entrega

Responder aos itens 1–4 com regras/payloads e dados de teste, executar os cenários pendentes,
registrar resultado por operação e só então revisar o status de aprovação do Marco 3.
Este relatório não autoriza alterar níveis, aprovar documentos ou movimentar fundos para
contornar bloqueios.
