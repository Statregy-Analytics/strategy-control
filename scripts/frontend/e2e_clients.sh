#!/usr/bin/env bash
set -euo pipefail

API=${API:-http://localhost:3333/api}

echo "E2E clients test against $API"

# Wait for backend health
MAX_WAIT=30
SLEEP=1
elapsed=0
until curl -sSf --max-time 2 "$API/clients" >/dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    echo "Timeout waiting for backend at $API/clients"
    exit 1
  fi
  printf "."
  sleep $SLEEP
  elapsed=$((elapsed + SLEEP))
done
echo "\nBackend is healthy, starting E2E steps"

# generate a pseudo-unique 11-digit numeric string for cpf_cnpj
TS=$(date +%s)
CPF_BASE=$(printf "%011d" $((TS % 100000000000)))

# Create with full payload (heredoc without single quotes so variables expand)
read -r -d '' FULL_PAYLOAD <<JSON || true
{
  "cliente": {
    "name": "E2E Full User",
    "email": "e2e.full+${TS}@example.com",
    "avatar": "",
    "cpf_cnpj": "${CPF_BASE}",
    "cpf": "${CPF_BASE}",
    "rg": "12345678",
    "telefone": "11999990000",
    "cnh": "",
    "birth": "1990-01-01",
    "profissao": "Engenheiro",
    "rendaAnual": 75000
  },
  "bank": {
    "name": "Banco Teste",
    "agency": "1234",
    "account": "00012345-6",
    "type": "pf",
    "cpf_cnpj": "${CPF_BASE}",
    "chave_pix": "e2e.full+${TS}@example.com"
  },
  "bankRegister": [],
  "residential": {
    "register": "CPF",
    "property": "alugada",
    "number_redisential": "100",
    "real_state_registration": "",
    "address": "Rua E2E",
    "address_number": "100",
    "address_neighborhood": "Centro",
    "address_city": "São Paulo",
    "address_state": "SP",
    "dividendo": null
  },
  "investment": {
    "register_classification": "Conservador",
    "assessor": null,
    "data_dividendo": null,
    "data_value_welend": null
  },
  "password": "",
  "contrato": { "total": 0, "quantity": 0 },
  "level": "E2E",
  "weLend": [],
  "newWeLend": { "status": null, "value": null, "value_dividendo": null, "value_before": null, "value_finish": null, "date_payment": null },
  "uploads": []
}
JSON

CREATE_RES=$(curl -sS -X POST "$API/clients" -H "Content-Type: application/json" -d "$FULL_PAYLOAD")
if [ -z "$CREATE_RES" ]; then
  echo "Create failed or empty response"
  exit 1
fi

ID=$(echo "$CREATE_RES" | node -e "const fs=require('fs'); const s=fs.readFileSync(0,'utf8'); const o=JSON.parse(s); console.log(o && o.id ? o.id : '')")

if [ -z "$ID" ] || [ "$ID" = "undefined" ]; then
  echo "Could not parse ID from create response: $CREATE_RES"
  exit 1
fi

echo "Created client id=$ID"

# Get
GET_RES=$(curl -sS "$API/clients/$ID")
echo "Get response: $GET_RES"

# Update
UPDATE_RES=$(curl -sS -X PUT "$API/clients/$ID" -H "Content-Type: application/json" -d '{"cliente":{"cpf_cnpj":"000.000.000-00","name":"E2E User Updated","email":"e2e2@example.com"},"level":"E2E"}')
echo "Update response: $UPDATE_RES"

# Delete
curl -sS -X DELETE "$API/clients/$ID" -o /dev/null -w "%{http_code}\n"

echo "E2E done"
