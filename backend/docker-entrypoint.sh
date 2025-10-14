#!/usr/bin/env bash
set -euo pipefail

# entrypoint: ensure node_modules are installed when the container starts
# Useful when the project directory is bind-mounted from the host and
# node_modules may be missing in the mounted volume.

ROOT_DIR=/app
NODE_MODULES_DIR="$ROOT_DIR/node_modules"

need_install=0
if [ ! -d "$NODE_MODULES_DIR" ] || [ -z "$(ls -A "$NODE_MODULES_DIR" 2>/dev/null || true)" ]; then
  need_install=1
else
  # Check for presence of a known dependency (joi). If missing, trigger install.
  if [ ! -d "$NODE_MODULES_DIR/joi" ]; then
    need_install=1
  fi
fi

if [ "$need_install" -eq 1 ]; then
  echo "[entrypoint] node_modules missing or incomplete — running npm install"
  # Ensure package.json is present
  if [ -f "$ROOT_DIR/package.json" ]; then
    cd "$ROOT_DIR"
    npm install --no-audit --no-fund
  else
    echo "[entrypoint] warning: package.json not found in $ROOT_DIR — skipping npm install"
  fi
else
  echo "[entrypoint] node_modules present and looks complete — skipping npm install"
fi

exec "$@"
