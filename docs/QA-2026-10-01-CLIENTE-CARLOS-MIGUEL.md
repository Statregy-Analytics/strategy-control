# Relatório de QA — Falhas de backend — Cliente Carlos Miguel

Data: 01/10/2026  
Horário de registro: 17:29 (America/Sao_Paulo)  
Ambiente observado: painel administrativo local  
Cliente: Carlos Miguel  
Status exibido: Suspenso

> O horário exato do clique que originou as requisições não aparece nas capturas. O horário acima é o momento em que a ocorrência foi registrada neste relatório.

> Escopo: este relatório registra somente falhas que exigem verificação ou correção no backend. Problemas já corrigidos no frontend não fazem parte deste documento.

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

Quando preenchida, a implementação atual converte `evidence` de JSON textual para objeto antes do envio.

### Divergência de contrato

- O Swagger em `docs/Api/swagger.json` declara `evidence` como `string | null`.
- A arquitetura em `tmp/data-intake-contracts/architecture/customer-admin-api.md` declara `evidence` como objeto JSON.
- A coleção de referência envia `evidence: null` no exemplo de criação.

Solicitação ao backend: confirmar o tipo efetivamente aceito para `evidence`, consultar os logs usando o horário aproximado e devolver `requestId`, `correlationId`, `Idempotency-Key` e a exceção interna associada ao erro 500.

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

