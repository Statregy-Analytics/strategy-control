#!/usr/bin/env bash
set -euo pipefail

# entrypoint: ensure node_modules are installed when the container starts
# Useful when the project directory is bind-mounted from the host and
# node_modules may be missing in the mounted volume.

ROOT_DIR=/app
NODE_MODULES_DIR="$ROOT_DIR/node_modules"

if [ ! -d "$NODE_MODULES_DIR" ] || [ -z "$(ls -A "$NODE_MODULES_DIR" 2>/dev/null || true)" ]; then
  echo "[entrypoint] node_modules not found or empty — running npm install"
  # Ensure package.json is present
  if [ -f "$ROOT_DIR/package.json" ]; then
    cd "$ROOT_DIR"
    npm install --no-audit --no-fund
  else
    echo "[entrypoint] warning: package.json not found in $ROOT_DIR — skipping npm install"
  fi
else
  echo "[entrypoint] node_modules present — skipping npm install"
fi

exec "$@"
