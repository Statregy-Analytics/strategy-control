#!/usr/bin/env bash
set -euo pipefail

# Script de desenvolvimento: sobe backend e, quando saudável, sobe frontend
# Uso: ./scripts/dev_up

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_COMPOSE="$ROOT_DIR/docker/backend/dev/docker-compose.yml"
FRONTEND_COMPOSE="$ROOT_DIR/docker/frontend/dev/docker-compose.yml"

echo "[dev_up] Subindo backend via compose: $BACKEND_COMPOSE"
docker compose -f "$BACKEND_COMPOSE" up -d --build

echo "[dev_up] Aguardando backend ficar saudável (http://localhost:3333/api/clients)"
MAX_WAIT=60
SLEEP=2
elapsed=0
until curl -sSf --max-time 2 http://localhost:3333/api/clients >/dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    echo "[dev_up] Timeout esperando backend. Veja os logs: docker compose -f $BACKEND_COMPOSE logs strategy-backend-dev"
    exit 1
  fi
  printf "."
  sleep $SLEEP
  elapsed=$((elapsed + SLEEP))
done
echo "\n[dev_up] Backend pronto. Subindo frontend"

docker compose -f "$FRONTEND_COMPOSE" up -d --build

echo "[dev_up] Frontend solicitado. Aguardando healthcheck do frontend (http://localhost:9000)"
MAX_WAIT_F=60
elapsed=0
until curl -sSf --max-time 2 http://localhost:9000/ >/dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT_F ]; then
    echo "[dev_up] Timeout esperando frontend. Veja os logs: docker compose -f $FRONTEND_COMPOSE logs strategy-frontend-dev"
    exit 1
  fi
  printf "."
  sleep $SLEEP
  elapsed=$((elapsed + SLEEP))
done

echo "\n[dev_up] Frontend pronto. Ambientes em execução."
docker compose -f "$BACKEND_COMPOSE" ps
docker compose -f "$FRONTEND_COMPOSE" ps

echo "[dev_up] Para ver logs: docker compose -f $BACKEND_COMPOSE logs -f strategy-backend-dev"
echo "[dev_up] Para ver logs frontend: docker compose -f $FRONTEND_COMPOSE logs -f strategy-frontend-dev"
