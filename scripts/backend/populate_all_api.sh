#!/usr/bin/env bash
# populate_all_api.sh - gera dados e insere via API (opcional: pelo container)
# Saia no primeiro erro
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COUNT=10
CLEAR=false
CONTAINER=""
USE_CONTAINER=false
HOST="http://localhost:3333"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--count N] [--clear] [--container NAME] [--host URL] [--port PORT]

Options:
  --count, -c   Number of items per resource (advisors, clients, leads). Default: 10
  --clear, -x   Remove existing advisors/clients/leads by calling DELETE on each item
  --container   If provided, run curl inside the given docker container (via docker exec -i)
  --host        API base url (default: http://localhost:3333)
  --port        Shorthand to set host to http://localhost:PORT
  --help        Show this help

Notes:
  - Requires: curl, node, jq (jq used only when --clear is supplied). If you supply --container
    the script will still generate payloads locally with node and then pipe them to curl inside the container.
  - The backend API mounts routes under /api. This script will call /api/advisors, /api/clients and /api/leads.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count|-c)
      COUNT="$2"; shift 2;;
    --clear|-x)
      CLEAR=true; shift;;
    --container)
      CONTAINER="$2"; USE_CONTAINER=true; shift 2;;
    --host)
      HOST="$2"; shift 2;;
    --port)
      HOST="http://localhost:$2"; shift 2;;
    --help)
      usage; exit 0;;
    *)
      echo "Unknown arg: $1"; usage; exit 1;;
  esac
done

if $CLEAR && ! command -v jq >/dev/null 2>&1; then
  echo "Error: 'jq' is required for --clear. Install jq or omit --clear." >&2
  exit 1
fi

# detect jq (used to manipulate JSON payloads when assigning advisor ids)
JQ_AVAILABLE=true
if ! command -v jq >/dev/null 2>&1; then
  JQ_AVAILABLE=false
fi

if $USE_CONTAINER && ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is required when using --container" >&2
  exit 1
fi

# detect available HTTP client (curl preferred, wget fallback)
HOST_HTTP_CLIENT=""
if command -v curl >/dev/null 2>&1; then
  HOST_HTTP_CLIENT=curl
elif command -v wget >/dev/null 2>&1; then
  HOST_HTTP_CLIENT=wget
fi

# if running inside a container, probe the container for an HTTP client
CONTAINER_HTTP_CLIENT=""
if $USE_CONTAINER; then
  # prefer curl inside container, fallback to wget
  if docker exec -i "$CONTAINER" sh -c 'command -v curl >/dev/null 2>&1'; then
    CONTAINER_HTTP_CLIENT=curl
  elif docker exec -i "$CONTAINER" sh -c 'command -v wget >/dev/null 2>&1'; then
    CONTAINER_HTTP_CLIENT=wget
  fi
fi

# decide effective client depending on whether we're running inside a container
EFFECTIVE_HTTP_CLIENT=""
if $USE_CONTAINER; then
  EFFECTIVE_HTTP_CLIENT="$CONTAINER_HTTP_CLIENT"
else
  EFFECTIVE_HTTP_CLIENT="$HOST_HTTP_CLIENT"
fi

if [[ -z "$EFFECTIVE_HTTP_CLIENT" ]]; then
  echo "Error: neither 'curl' nor 'wget' is available${USE_CONTAINER:+ inside container $CONTAINER} ." >&2
  echo "This script requires a command-line HTTP client to post/get/delete via the API." >&2
  echo "Install curl (recommended) or wget. Examples:" >&2
  echo "  Debian/Ubuntu (inside container): apt-get update && apt-get install -y curl" >&2
  echo "  Alpine: apk add --no-cache curl" >&2
  echo "  CentOS/RHEL: yum install -y curl" >&2
  echo "Or run the script on the host where curl/wget is available, or supply --container with a container that has curl/wget installed." >&2
  exit 1
fi

http_get() {
  local url="$1"
  if $USE_CONTAINER; then
    if [[ "$CONTAINER_HTTP_CLIENT" == "curl" ]]; then
      docker exec -i "$CONTAINER" curl -s "$url"
    else
      # wget -q -O- URL
      docker exec -i "$CONTAINER" sh -c 'wget -q -O- "$1"' sh "$url"
    fi
  else
    if [[ "$HOST_HTTP_CLIENT" == "curl" ]]; then
      curl -s "$url"
    else
      wget -q -O- "$url"
    fi
  fi
}

http_delete() {
  local url="$1"
  if $USE_CONTAINER; then
    # use -i so docker exec reads stdin properly when piping
    if [[ "$CONTAINER_HTTP_CLIENT" == "curl" ]]; then
      docker exec -i "$CONTAINER" curl -s -X DELETE -H "X-Admin: true" "$url"
    else
      docker exec -i "$CONTAINER" sh -c 'wget -q --method=DELETE --header="X-Admin: true" -O- "$1"' sh "$url"
    fi
  else
    if [[ "$HOST_HTTP_CLIENT" == "curl" ]]; then
      curl -s -X DELETE -H "X-Admin: true" "$url"
    else
      wget -q --method=DELETE --header="X-Admin: true" -O- "$url"
    fi
  fi
}

http_post_stdin() {
  local url="$1"
  if $USE_CONTAINER; then
    if [[ "$CONTAINER_HTTP_CLIENT" == "curl" ]]; then
      docker exec -i "$CONTAINER" curl -s -X POST -H "Content-Type: application/json" -H "X-Admin: true" -d @- "$url"
    else
      # wget inside container: write stdin to a temp file inside container and post it
      docker exec -i "$CONTAINER" sh -c 'cat >/tmp/populate_payload && wget -q --method=POST --header="Content-Type: application/json" --header="X-Admin: true" --body-file=/tmp/populate_payload -O- "$1" && rm -f /tmp/populate_payload' sh "$url"
    fi
  else
    if [[ "$HOST_HTTP_CLIENT" == "curl" ]]; then
      curl -s -X POST -H "Content-Type: application/json" -H "X-Admin: true" -d @- "$url"
    else
      # wget on host: read stdin to a temp file then post
      tmpf=$(mktemp)
      cat >"$tmpf"
      wget -q --method=POST --header="Content-Type: application/json" --header="X-Admin: true" --body-file="$tmpf" -O- "$url"
      rm -f "$tmpf"
    fi
  fi
}

echo "Using API base: $HOST"
if $USE_CONTAINER; then
  echo "Running curl inside container: $CONTAINER"
fi

if $CLEAR; then
  echo "Clearing existing advisors, clients and leads via API..."
  for res in advisors clients leads; do
    echo "Listing /api/$res..."
    raw="$(http_get "$HOST/api/$res")"
    ids=$(echo "$raw" | jq -r '.[]?.id' || true)
    if [[ -z "$ids" ]]; then
      echo "  no items found for $res"
      continue
    fi
    echo "$ids" | while read -r id; do
      if [[ -n "$id" && "$id" != "null" ]]; then
        echo "  deleting $res/$id"
        http_delete "$HOST/api/$res/$id" >/dev/null || true
      fi
    done
  done
  echo "Clear finished."
fi

echo "Generating and inserting $COUNT advisors..."

# store created advisor ids in a temp file (avoid subshell array visibility)
ADVISOR_IDS_FILE=$(mktemp)
trap 'rm -f "$ADVISOR_IDS_FILE"' EXIT

# Generate advisors: use a small inline Node script that prints one JSON per line
COUNT_ENV="$COUNT" node - <<'NODE' | while IFS= read -r payload; do
const randInt = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const firstNames = ["João","Maria","Pedro","Ana","Carlos","Mariana","Lucas","Fernanda","Rafael","Beatriz"];
const lastNames = ["Silva","Santos","Oliveira","Pereira","Costa","Rodrigues","Almeida","Gomes"];
function randomFullName(){const fn=firstNames[randInt(0,firstNames.length-1)];const ln=lastNames[randInt(0,lastNames.length-1)];return `${fn} ${ln}`}
function randomEmail(name){const clean=String(name).toLowerCase().replace(/[^a-z0-9]+/g,'.');const domain=['example.com','mail.com','test.com'][randInt(0,2)];return `${clean}${randInt(1,99)}@${domain}`}
function makeAdvisor(){
  const name=randomFullName();
  const email=randomEmail(name);
  const avatar = Math.random()<0.5 ? '' : 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png';
  const assessor = { name, email, avatar };
  const customers = {
    balance_contract: parseFloat((Math.random()*100000).toFixed(2)),
    balance_customers: parseFloat((Math.random()*50000).toFixed(2)),
    captured_customers: randInt(0,50),
    linked_customers: randInt(0,200),
  };
  const gastos = {
    value: parseFloat((Math.random()*10000).toFixed(2)),
    limite: parseFloat((Math.random()*20000).toFixed(2)),
    data: [],
  };
  const commission = {
    received: parseFloat((Math.random()*10000).toFixed(2)),
    future: parseFloat((Math.random()*5000).toFixed(2)),
    value: parseFloat((Math.random()*15000).toFixed(2)),
  };
  return {
    id: null,
    assessor,
    clients_count: randInt(0,200),
    customers,
    gastos,
    commission,
    comissao_recebida: commission.received,
    comissao_futura: commission.future,
    actions: 'Ações',
  };
}
const COUNT = Number(process.env.COUNT_ENV || process.env.COUNT || 10);
for(let i=0;i<COUNT;i++){console.log(JSON.stringify(makeAdvisor()));}
NODE
  # each line is a JSON payload for advisor as { assessor: {...}, ... }
  echo "Posting advisor..."
  resp=$(printf '%s' "$payload" | http_post_stdin "$HOST/api/advisors" || true)
  # try to capture created id
  if $JQ_AVAILABLE; then
    id=$(printf '%s' "$resp" | jq -r '.id // empty' 2>/dev/null || true)
  else
    id=""
  fi
  if [[ -n "$id" ]]; then
    echo "$id" >> "$ADVISOR_IDS_FILE"
  fi
done

echo "Generating and inserting $COUNT clients..."

COUNT_ENV="$COUNT" node - <<'NODE' | while IFS= read -r payload; do
const randInt = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const firstNames=["Ana","Bruno","Carlos","Daniela","Eduardo","Felipe","Gabriela","Helena","Igor","Julia","Karla","Lucas","Mariana","Nicolas","Olivia","Paulo","Quenia","Rafael","Sofia","Thiago"];
const lastNames=["Alves","Barbosa","Cardoso","Dias","Esteves","Fernandes","Gomes","Henrique","Ibrahim","Jardim","Klein","Lima","Melo","Nascimento","Oliveira","Pereira","Queiroz","Ribeiro","Silva","Teixeira"];
function randomFullName(){const fn=firstNames[randInt(0,firstNames.length-1)];const ln=lastNames[randInt(0,lastNames.length-1)];if(Math.random()<0.4){const mn=lastNames[randInt(0,lastNames.length-1)];return `${fn} ${mn} ${ln}`}return `${fn} ${ln}`}
function randomEmail(name){const clean=String(name).toLowerCase().replace(/[^a-z0-9]+/g,'.');const domain=['example.com','mail.com','test.com','demo.org'][randInt(0,3)];return `${clean}${randInt(1,99)}@${domain}`}
function generateCpf(){const n=[];for(let i=0;i<9;i++)n.push(randInt(0,9));const calc=(arr)=>{let sum=0;for(let i=0;i<arr.length;i++)sum+=arr[i]*(arr.length+1-i);let r=11-(sum%11);if(r===10||r===11)r=0;return r};n.push(calc(n));n.push(calc(n));return n.join('')}
function randomBirth(){const year=randInt(1950,2005);const month=String(randInt(1,12)).padStart(2,'0');const day=String(randInt(1,28)).padStart(2,'0');return `${year}-${month}-${day}`}function makeClientSample(){const name=randomFullName();const email=randomEmail(name);const cpf=generateCpf();const cliente={cpf_cnpj:cpf,rg:'',telefone:'',renda:randInt(1000,200000),profissao:['Engenheiro','Analista','Gerente','Médico','Professor'][randInt(0,4)],birth:randomBirth(),name,avatar:'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',email};const investment={classification:['Ações','Renda Fixa','Fundos Imobiliários','Criptomoedas'][randInt(0,3)],saldo:parseFloat((Math.random()*500000).toFixed(2)),assessor:null,data_dividendo:randomBirth(),valor_dividendo:parseFloat((Math.random()*1000).toFixed(2))};return {cliente,investment,assessor:null}}const COUNT = Number(process.env.COUNT_ENV || process.env.COUNT || 10);for(let i=0;i<COUNT;i++){console.log(JSON.stringify(makeClientSample()));}
NODE
  echo "Posting client..."
  modified_payload="$payload"
  if $JQ_AVAILABLE && [[ -f "$ADVISOR_IDS_FILE" && -s "$ADVISOR_IDS_FILE" ]]; then
    # pick a random advisor id (shuf if available, fallback to awk)
    if command -v shuf >/dev/null 2>&1; then
      advisor_id=$(shuf -n1 "$ADVISOR_IDS_FILE")
    else
      advisor_id=$(awk 'BEGIN{srand(); while(getline) a[NR]=$0} END{ if(NR>0) print a[int(rand()*NR)+1] }' "$ADVISOR_IDS_FILE")
    fi
    if [[ -n "$advisor_id" ]]; then
      # inject advisor id into investment.assessor and cliente.assessor if present
      modified_payload=$(printf '%s' "$payload" | jq --argjson id "$advisor_id" '.investment.assessor = $id | (.cliente // .).assessor = $id' 2>/dev/null) || modified_payload="$payload"
    fi
  fi
  printf '%s' "$modified_payload" | http_post_stdin "$HOST/api/clients" >/dev/null || true
done

echo "Generating and inserting $COUNT leads..."

COUNT_ENV="$COUNT" node - <<'NODE' | while IFS= read -r payload; do
const randInt=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
function randomPhone(){const ddd=String(randInt(11,99));const part1=String(randInt(9000,9999));const part2=String(randInt(1000,9999));return `+55 ${ddd} ${part1}-${part2}`}
function randomBirth(){const year=randInt(1955,2002);const month=String(randInt(1,12)).padStart(2,'0');const day=String(randInt(1,28)).padStart(2,'0');return `${year}-${month}-${day}`}
function randomCNH(){let s=''; for(let i=0;i<11;i++) s+=String(randInt(0,9)); return s}
function makeLead(){
  const helpers = require('path').join(__dirname, '_data_helpers.js');
  // replicate the richer lead shape from populate_leads_db.js
  const name = ['Ana','Bruno','Carlos','Daniela','Eduardo','Felipe','Gabriela','Helena'][randInt(0,7)] + ' ' + ['Silva','Santos','Oliveira','Pereira'][randInt(0,3)];
  const email = String(name).toLowerCase().replace(/[^a-z0-9]+/g,'.') + randInt(1,99) + '@example.com';
  const avatar = Math.random()<0.2 ? '' : 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png';
  const utm = { campaign: `camp${randInt(1,5)}`, source: ['google','facebook','email','organic'][randInt(0,3)] };
  const notes = ['Interessado em demo','Solicitar contato','Alta prioridade','Follow-up em 7 dias'][randInt(0,3)];
  const cpf = String(randInt(100,999)) + String(randInt(100,999)) + String(randInt(100,999)) + String(randInt(10,99));
  const rg = `${randInt(10,99)}.${randInt(100,999)}.${randInt(100,999)}-${randInt(0,9)}`;
  const profission = ['Engenheiro','Médica','Professor','Advogada','Designer','Analista'][randInt(0,5)];
  const situacao_rf = ['Regular','Pendente','Irregular'][randInt(0,2)];
  const estagio_lead = ['Novo','Contato Feito','Em Negociação','Fechado'][randInt(0,3)];
  const address = [{ logradouro: `${randInt(1,9999)} Avenida Central`, city: 'São Paulo/SP', zipcode: `${randInt(10000,99999)}-${randInt(100,999)}` }];
  const partner = [{ razao_social: 'Empresa LTDA', cnpj: `${randInt(10,99)}.${randInt(100,999)}.${randInt(100,999)}/${randInt(1000,9999)}-${randInt(10,99)}`, position: 'Sócio Administrador', member_since: '04/03/2025' }];
  const related_person = [{ name: 'Pessoa Exemplo', relate: 'Sócio', phone: randomPhone(), mail: 'exemplo@test.com' }];
  const bankRegister = [{ chave_pix: String(randInt(100000000,999999999)), cpf_cnpj: cpf, name: 'Banco Exemplo', agency: String(randInt(1000,9999)), account: `${randInt(10000,99999)}-${randInt(0,9)}`, type: 'Conta Corrente', status: 'Ativo' }];
  const emprestimo = `${randInt(1,5)}x`;
  const dividendo = { total: randInt(1000,20000), data: new Date().toISOString().split('T')[0] };
  const contrato = { total: randInt(1,5)*1000, quantity: `${randInt(1,5)}` };
  const saldo = randInt(0,50000);
  return { lead: { name, email, rg, cpf, phone: randomPhone(), birth: randomBirth(), cnh: randomCNH(), profission, situacao_rf, estagio_lead, address, partner, related_person, bankRegister, emprestimo, dividendo, contrato, saldo, source: ['Landing Page','Evento','Campanha','Indicação'][randInt(0,3)], avatar, utm, notes, created_at: new Date().toISOString() } };
}
const COUNT = Number(process.env.COUNT_ENV || process.env.COUNT || 10);
for(let i=0;i<COUNT;i++) console.log(JSON.stringify(makeLead()));
NODE
  echo "Posting lead..."
  printf '%s' "$payload" | http_post_stdin "$HOST/api/leads" >/dev/null || true
done

echo "Done. Inserted $COUNT advisors, $COUNT clients and $COUNT leads (requests sent)."

exit 0
