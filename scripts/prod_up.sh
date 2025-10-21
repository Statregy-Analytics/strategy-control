#!/usr/bin/env bash
set -euo pipefail

# Script de produção: sobe backend e frontend de produção via docker compose
# Uso: ./scripts/prod_up.sh

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_COMPOSE="$ROOT_DIR/docker/backend/prod/docker-compose.yml"
FRONTEND_COMPOSE="$ROOT_DIR/docker/frontend/prod/docker-compose.yml"

echo "[prod_up] Subindo backend via compose: $BACKEND_COMPOSE"
docker compose -f "$BACKEND_COMPOSE" up -d --build

echo "[prod_up] Aguardando backend ficar saudável"
# Descobre a porta host mapeada para a porta 3333/tcp do serviço `strategy-backend`.
# Exemplo de saída: "0.0.0.0:3334" ou ":::3334"
host_port=$(docker compose -f "$BACKEND_COMPOSE" port strategy-backend 3333/tcp 2>/dev/null | sed -E 's/.*:([0-9]+)$/\1/') || true
# Se não obteve porta (por exemplo em algumas versões/configs), usar fallback 3333
if [ -z "$host_port" ]; then
  # Tentar descobrir pela inspeção do container (nome definido em compose)
  if docker inspect --format '{{json .}}' strategy-backend-prod >/dev/null 2>&1; then
    host_port=$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3333/tcp") 0).HostPort}}' strategy-backend-prod 2>/dev/null) || true
  fi
fi
if [ -z "$host_port" ]; then
  host_port=3333
fi
echo "[prod_up] Usando healthcheck em http://localhost:${host_port}/api/clients"
MAX_WAIT=60
SLEEP=2
elapsed=0
until curl -sSf --max-time 2 "http://localhost:${host_port}/api/clients" >/dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    echo "[prod_up] Timeout esperando backend. Veja os logs: docker compose -f $BACKEND_COMPOSE logs strategy-backend"
    exit 1
  fi
  printf "."
  sleep $SLEEP
  elapsed=$((elapsed + SLEEP))
done
echo "\n[prod_up] Backend pronto."

echo "[prod_up] Subindo frontend"
docker compose -f "$FRONTEND_COMPOSE" up -d --build

echo "[prod_up] Aguardando healthcheck do frontend (http://localhost)"
MAX_WAIT_F=60
elapsed=0
until curl -sSf --max-time 2 http://localhost/ >/dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT_F ]; then
    echo "[prod_up] Timeout esperando frontend. Veja os logs: docker compose -f $FRONTEND_COMPOSE logs strategy-frontend-prod"
    exit 1
  fi
  printf "."
  sleep $SLEEP
  elapsed=$((elapsed + SLEEP))
done

echo "\n[prod_up] Frontend pronto. Serviços em execução."
docker compose -f "$BACKEND_COMPOSE" ps
docker compose -f "$FRONTEND_COMPOSE" ps

echo "[prod_up] Para ver logs backend: docker compose -f $BACKEND_COMPOSE logs -f strategy-backend-prod"
echo "[prod_up] Para ver logs frontend: docker compose -f $FRONTEND_COMPOSE logs -f strategy-frontend-prod"
