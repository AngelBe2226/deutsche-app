#!/usr/bin/env bash
#
# sync.sh — trae los cambios del repo (deutsche-app) y deja la app siempre-on
# actualizada en esta máquina. Hace solo lo necesario según lo que haya cambiado:
#
#   - contenido (backend/app/content/*.json) ......... nada: el server lo recarga solo
#   - código backend (*.py) o requirements.txt ....... pip install (si toca) + reinicio
#   - frontend (src/, index.html, public/, config) ... npm build + reinicio
#
# Uso:  ./scripts/sync.sh
#
set -euo pipefail

LABEL="com.angelbe.german-index"
# Raíz del repo = carpeta padre de este script (funciona desde cualquier cwd).
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

say() { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }

say "Sincronizando $REPO"
OLD="$(git rev-parse HEAD)"
git pull --ff-only
NEW="$(git rev-parse HEAD)"

if [ "$OLD" = "$NEW" ]; then
  say "Ya estaba al día — nada que hacer."
  exit 0
fi

CHANGED="$(git diff --name-only "$OLD" "$NEW")"
say "Archivos cambiados:"; echo "$CHANGED" | sed 's/^/    /'

need_pip=0; need_build=0; need_restart=0
while IFS= read -r f; do
  case "$f" in
    backend/requirements.txt)                 need_pip=1;   need_restart=1 ;;
    backend/*.py|backend/**/*.py)             need_restart=1 ;;
    frontend/src/*|frontend/src/**|\
    frontend/index.html|frontend/public/*|frontend/public/**|\
    frontend/package.json|frontend/package-lock.json|frontend/vite.config.js)
                                              need_build=1; need_restart=1 ;;
  esac
done <<< "$CHANGED"

if [ "$need_pip" = 1 ]; then
  say "Actualizando dependencias de Python…"
  backend/.venv/bin/pip install -q -r backend/requirements.txt
fi

if [ "$need_build" = 1 ]; then
  say "Recompilando el frontend…"
  ( cd frontend && npm install --no-audit --no-fund --silent && npm run build )
fi

if [ "$need_restart" = 1 ]; then
  say "Reiniciando el servidor siempre-on…"
  launchctl kickstart -k "gui/$(id -u)/$LABEL"
  # Pequeña espera y verificación de salud.
  sleep 2
  if curl -fsS -o /dev/null "http://localhost:8002/api/health"; then
    say "OK — http://localhost:8002 respondiendo."
  else
    printf '\033[1;31m✗ El servidor no responde en :8002. Revisa ~/Library/Logs/german-index/\033[0m\n'
    exit 1
  fi
else
  say "Solo cambió contenido — el servidor lo recarga solo. Nada que reiniciar."
fi

say "Listo."
