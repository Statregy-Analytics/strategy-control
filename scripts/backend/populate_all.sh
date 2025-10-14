#!/usr/bin/env bash
# populate_all.sh - executa scripts de populacao sequencialmente
# Uso: ./scripts/backend/populate_all.sh [--db /caminho/arquivo.sqlite] [--confirm]
#
# Opções:
#   --db PATH    : usar o arquivo sqlite PATH como alvo (se existir). Se não
#                  informado, o script tentará detectar arquivos *.sqlite
#                  no projeto (até profundidade 3) e irá listá-los antes de
#                  executar os scripts Node.
#   --confirm    : realmente executar os scripts Node que populam os bancos.
#                  Se não fornecido, o script apenas lista os DBs detectados
#                  e sai (segurança para evitar escrever no DB errado).
#
# O script ainda mantém o comportamento anterior (executa os scripts de
# populacao em scripts/ ou scripts/backend/). Ele apenas mostra os caminhos
# dos bancos de dados detectados e aceita a opção --db para foco manual.
# Saia no primeiro erro
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# Se este script estiver dentro de 'admin/', ajustar ROOT_DIR para o diretório pai do admin
if [[ "$(basename "$ROOT_DIR")" == "admin" ]]; then
	ROOT_DIR="$(dirname "$ROOT_DIR")"
fi

echo "Usando diretório do projeto: $ROOT_DIR"

# Suporte a parametro opcional --db /caminho/para/db.sqlite
DB_OVERRIDE=""
DRY_RUN="false"
CONFIRM="false"
while [[ $# -gt 0 ]]; do
	case "$1" in
		--db)
			shift
			if [[ $# -eq 0 ]]; then
				echo "Erro: --db requer um caminho de arquivo" >&2
				exit 1
			fi
			DB_OVERRIDE="$1"
			shift
			;;
		--help|-h)
			echo "Uso: $(basename "$0") [--db /caminho/arquivo.sqlite]" 
			exit 0
			;;
		--confirm)
			CONFIRM="true"
			shift
			;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
		*)
			# repassar outros argumentos (não usados aqui)
			shift
			;;
	esac
done

# Detectar arquivos .sqlite relevantes no projeto backend
declare -a DETECTED_DBS=()

# Candidate known locations (prioridade)
PROJECT_ROOT="$ROOT_DIR"
if [[ -d "$PROJECT_ROOT/backend" ]]; then
	CAND1="$PROJECT_ROOT/backend/dev.sqlite"
else
	CAND1=""
fi
if [[ -d "$PROJECT_ROOT/admin/backend" ]]; then
	CAND2="$PROJECT_ROOT/admin/backend/dev.sqlite"
else
	CAND2=""
fi
if [[ -n "$DB_OVERRIDE" ]]; then
	if [[ -f "$DB_OVERRIDE" ]]; then
		DETECTED_DBS=("$DB_OVERRIDE")
	else
		echo "Aviso: arquivo especificado em --db não existe: $DB_OVERRIDE" >&2
		# Continuar para detectar automaticamente
	fi
fi

# Verificar candidatas conhecidas primeiro
if [[ ${#DETECTED_DBS[@]} -eq 0 ]]; then
	if [[ -n "$CAND1" && -f "$CAND1" ]]; then
		DETECTED_DBS+=("$CAND1")
	elif [[ -n "$CAND2" && -f "$CAND2" ]]; then
		DETECTED_DBS+=("$CAND2")
	fi
fi

if [[ ${#DETECTED_DBS[@]} -eq 0 ]]; then
	# Priorizar $ROOT_DIR/backend (local onde o DB correto costuma ficar)
	if [[ -d "$ROOT_DIR/backend" ]]; then
		while IFS= read -r -d $'\0' f; do
			DETECTED_DBS+=("$f")
		done < <(find "$ROOT_DIR/backend" -maxdepth 2 -type f -name "*.sqlite" -print0 2>/dev/null || true)
	fi
fi

if [[ ${#DETECTED_DBS[@]} -eq 0 ]]; then
	# fallback: procurar em raiz do projeto (profundidade menor para rapidez)
	while IFS= read -r -d $'\0' f; do
		DETECTED_DBS+=("$f")
	done < <(find "$ROOT_DIR" -maxdepth 3 -type f -name "*.sqlite" -print0 2>/dev/null || true)
fi

if [[ ${#DETECTED_DBS[@]} -gt 0 ]]; then
	echo "Database(s) detectado(s):"
	for db in "${DETECTED_DBS[@]}"; do
		echo "  - $db"
	done
else
	echo "Nenhum arquivo .sqlite detectado no projeto." >&2
fi

# Se não for confirmada a execução, apenas listar e sair (segurança)
if [[ "$CONFIRM" != "true" ]]; then
    echo "Nenhuma execução realizada. Use --confirm para realmente executar os scripts de populacao." >&2
    exit 0
fi

# Os scripts de populacao ficam em scripts/ ou scripts/backend/ dependendo da organizacao.
# Garantir caminhos absolutos para evitar "scripts/scripts/..." quando o script for chamado a partir da raiz `admin/`.

echo "1/2: Populando clients com assessors (clear, avatar random)"
# Procurar o script em vários caminhos comuns (prioridade)
if [ -f "$ROOT_DIR/scripts/backend/populate_clients_with_assessors_db.js" ]; then
	CLIENT_SCRIPT="$ROOT_DIR/scripts/backend/populate_clients_with_assessors_db.js"
elif [ -f "$ROOT_DIR/scripts/populate_clients_with_assessors_db.js" ]; then
	CLIENT_SCRIPT="$ROOT_DIR/scripts/populate_clients_with_assessors_db.js"
elif [ -f "$ROOT_DIR/admin/scripts/backend/populate_clients_with_assessors_db.js" ]; then
	CLIENT_SCRIPT="$ROOT_DIR/admin/scripts/backend/populate_clients_with_assessors_db.js"
elif [ -f "$ROOT_DIR/admin/scripts/populate_clients_with_assessors_db.js" ]; then
	CLIENT_SCRIPT="$ROOT_DIR/admin/scripts/populate_clients_with_assessors_db.js"
else
	# fallback: procurar por qualquer arquivo com nome similar
	CLIENT_SCRIPT="$(find "$ROOT_DIR" -type f -name 'populate_clients_with_assessors_db.*' -print -quit 2>/dev/null || true)"
	if [[ -z "$CLIENT_SCRIPT" ]]; then
		echo "Erro: arquivo de script para popular clients com assessors nao encontrado." >&2
		exit 1
	fi
fi
if [[ "$DRY_RUN" == "true" && "$CONFIRM" != "true" ]]; then
	echo "(dry-run) found client script: $CLIENT_SCRIPT"
else
	# prefer admin/backend/node_modules if present, fallback to backend/node_modules
	if [[ -d "$ROOT_DIR/admin/backend/node_modules" ]]; then
		NODE_PATH="$ROOT_DIR/admin/backend/node_modules" node "$CLIENT_SCRIPT" --clear --avatar random
	else
		NODE_PATH="$ROOT_DIR/backend/node_modules" node "$CLIENT_SCRIPT" --clear --avatar random
	fi
fi

echo "2/2: Populando leads (clear, avatar random)"
if [ -f "$ROOT_DIR/scripts/backend/populate_leads_db.js" ]; then
	LEADS_SCRIPT="$ROOT_DIR/scripts/backend/populate_leads_db.js"
elif [ -f "$ROOT_DIR/scripts/populate_leads_db.js" ]; then
	LEADS_SCRIPT="$ROOT_DIR/scripts/populate_leads_db.js"
elif [ -f "$ROOT_DIR/admin/scripts/backend/populate_leads_db.js" ]; then
	LEADS_SCRIPT="$ROOT_DIR/admin/scripts/backend/populate_leads_db.js"
elif [ -f "$ROOT_DIR/admin/scripts/populate_leads_db.js" ]; then
	LEADS_SCRIPT="$ROOT_DIR/admin/scripts/populate_leads_db.js"
else
	LEADS_SCRIPT="$(find "$ROOT_DIR" -type f -name 'populate_leads_db.*' -print -quit 2>/dev/null || true)"
	if [[ -z "$LEADS_SCRIPT" ]]; then
		echo "Erro: arquivo de script para popular leads nao encontrado." >&2
		exit 1
	fi
fi
if [[ "$DRY_RUN" == "true" && "$CONFIRM" != "true" ]]; then
	echo "(dry-run) found leads script: $LEADS_SCRIPT"
else
	if [[ -d "$ROOT_DIR/admin/backend/node_modules" ]]; then
		NODE_PATH="$ROOT_DIR/admin/backend/node_modules" node "$LEADS_SCRIPT" --clear --avatar random
	else
		NODE_PATH="$ROOT_DIR/backend/node_modules" node "$LEADS_SCRIPT" --clear --avatar random
	fi
fi

echo "Todos os scripts foram executados com sucesso."
