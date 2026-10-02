# Relatório de QA — Falhas de backend — Cliente Carlos Miguel

Data: 01/10/2026  
Horário de registro: 17:29 (America/Sao_Paulo)  
Ambiente observado: painel administrativo local  
Cliente: Carlos Miguel  
Status exibido: Suspenso

> O horário exato do clique que originou as requisições não aparece nas capturas. O horário acima é o momento em que a ocorrência foi registrada neste relatório.

> Escopo: este relatório registra somente falhas que exigem verificação ou correção no backend. Problemas já corrigidos no frontend não fazem parte deste documento.

## Retorno do backend em 01/10/2026

Status dos três casos: **reteste funcional autenticado aprovado em 01/10/2026, aproximadamente 21:21–21:22 (America/Sao_Paulo)**.

Segundo a equipe de backend, a coluna `RelatedPepDescription` estava ausente no PostgreSQL. A migration que cria a coluna foi aplicada. Criação e leitura de flags, alertas, card e resumo dependiam dessa tabela; o histórico usa outra tabela. A equipe informou testes com criação retornando `201` e leituras retornando `200`. Esses resultados são do backend, ainda não confirmados neste reteste do frontend.

O contrato de `evidence` foi esclarecido: aceita uma string contendo objeto JSON serializado ou `null`. Objeto enviado diretamente é inválido. A documentação de arquitetura anterior estava incorreta; o Swagger estava correto.

Os novos erros informados são `request.body_invalid` (400), `request.parameter_invalid` (400) e `request.unsupported_media_type` (415), acompanhados de `requestId` e `correlationId`.

### Reteste realizado no painel administrativo

Cliente: `4ff8ec17-e9ea-416a-828c-b393d9b0119a` (Carlos Miguel, Suspenso).

- Perfil e resumo carregaram sem o aviso de indisponibilidade.
- Compliance carregou sem a mensagem de falha em card, flags ou alertas.
- Criação com `evidence: null`: concluída; registro exibido na listagem e no histórico.
- Criação com `evidence` contendo JSON serializado como string: concluída; registro exibido na listagem e no histórico.
- O resumo voltou a carregar após cada criação e apresentou a observação recém-criada.

Registros de homologação criados e mantidos no cliente:

1. `QA 01/10/2026 — reteste sem evidence`.
2. `QA 01/10/2026 — reteste evidence string`.

Evidência preenchida no segundo teste: `"evidence": "{\"source\":\"manual\",\"purpose\":\"qa-reteste-2026-10-01\"}"`.

Confirmação baseada no fluxo real do navegador e na listagem/histórico recarregados. Status HTTP exatos, requestId, correlationId e Idempotency-Key não foram capturados nesta verificação; os códigos 201/200 acima continuam sendo resultados informados pelo backend. As ocorrências abaixo permanecem como histórico dos erros originais.

## 1. Criação de flag de compliance

### Requisição

- Método: `POST`
- Endpoint: `/api/v1/admin/customers/{customerId}/compliance/flags`
- Resultado apresentado: `An unexpected error occurred.`
- Status HTTP: não capturado na evidência disponível
- `requestId`: não capturado
- `correlationId`: não capturado
- `Idempotency-Key`: enviado automaticamente pelo interceptor como UUID, mas o valor da tentativa não foi persistido nem aparece na captura

Payload enviado para uma nova observação manual com os valores padrão:

```json
{
  "flagType": "ManualObservation",
  "severity": "Medium",
  "status": "Active",
  "title": "<valor informado no formulário>",
  "description": null,
  "monitoringFrequency": null,
  "detectedBy": "User",
  "detectedAtUtc": null,
  "relatedPepDescription": null,
  "relatedPepRelationship": null,
  "evidence": null
}
```

Contrato confirmado pelo backend para evidência preenchida: `"evidence": "{\"source\":\"manual\"}"`. O payload acima é ilustrativo; os valores efetivamente preenchidos na tentativa original não foram capturados.

### Divergência de contrato

- O Swagger em `docs/Api/swagger.json` declara `evidence` como `string | null`.
- A arquitetura em `tmp/data-intake-contracts/architecture/customer-admin-api.md` declara `evidence` como objeto JSON.
- A coleção de referência envia `evidence: null` no exemplo de criação.

Esclarecimento recebido: `evidence` é `string | null`; a divergência documental foi corrigida pelo backend. A causa do erro interno foi atribuída à coluna ausente, conforme retorno registrado acima.

## 2. Falha ao carregar Compliance

Mensagem observada:

`Não foi possível carregar: card, flags, alertas.`

A tela executa quatro consultas independentes:

1. `GET /api/v1/admin/customers/{customerId}/compliance/card` — falhou.
2. `GET /api/v1/admin/customers/{customerId}/compliance/flags?page=1&pageSize=100` — falhou.
3. `GET /api/v1/admin/customers/{customerId}/compliance/alerts` — falhou.
4. `GET /api/v1/admin/customers/{customerId}/compliance/history?page=1&pageSize=100` — não foi incluído na mensagem de falha.

Os caminhos utilizados pelo frontend correspondem ao Swagger. Como o histórico respondeu enquanto card, flags e alertas falharam para o mesmo cliente e sessão, a autenticação e o identificador do cliente não explicam isoladamente o problema. É necessário verificar o status e o corpo de cada resposta no backend.

### Dados necessários para investigação do backend

Para cada uma das três chamadas com falha, registrar:

- status HTTP;
- corpo de erro;
- `requestId`;
- `correlationId`;
- horário do servidor;
- workspace resolvido;
- exceção interna e consulta que falhou.

## 3. Resumo operacional temporariamente indisponível

Horário do registro: 01/10/2026 18:05:39 (America/Sao_Paulo)

Mensagem observada:

`Parte do resumo operacional está temporariamente indisponível.`

### Requisição associada

- Método: `GET`
- Endpoint: `/api/v1/admin/customers/{customerId}/summary`
- Resultado observado: falha na composição do resumo operacional
- Status HTTP: não capturado na evidência disponível
- `requestId`: não capturado
- `correlationId`: não capturado
- `Idempotency-Key`: não se aplica a esta consulta `GET`

### Solicitação ao backend

Consultar os logs do endpoint `/summary` para o cliente e horário indicados, registrando:

- status HTTP e corpo de resposta;
- `requestId` e `correlationId`;
- workspace resolvido;
- exceção interna;
- consulta ou projeção que impediu a composição do resumo.

Há histórico anterior deste endpoint retornando `500` com mensagem genérica `An unexpected error occurred`; confirmar se a nova ocorrência possui a mesma causa.

## Evidências

- Captura do painel de Compliance mostrando falha em `card`, `flags` e `alertas`.
- Captura do aviso de indisponibilidade parcial do resumo operacional.
- Contrato local: `docs/Api/swagger.json`.
- Arquitetura de referência: `tmp/data-intake-contracts/architecture/customer-admin-api.md`.

