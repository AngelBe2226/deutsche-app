#!/usr/bin/env bash
#
# auto-sync.sh — sincroniza german-index entre máquinas SIN intervención.
#
# Lo lanza el LaunchAgent com.angelbe.german-index-sync (cada 5 min por
# defecto). En cada ciclo:
#   1. Si hay cambios locales sin commitear, los commitea.
#   2. Integra lo que haya subido la otra máquina con rebase (--autostash).
#   3. Si hay commits por delante del remoto, hace push.
#   4. Si el ciclo trajo cambios: recompila el frontend y/o reinicia el
#      servicio según lo que haya cambiado (el contenido JSON el backend
#      lo recarga solo, sin reinicio).
#
# Pensado para correr desatendido: nunca deja el repo a medio resolver.
# Si el rebase choca, aborta y solo deja un aviso en el log — la resolución
# de conflictos la hace una persona, no este script.
#
set -uo pipefail

LABEL="com.angelbe.german-index"          # el servicio que sirve la app (:8002)
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR" || exit 1

# launchd arranca con un PATH mínimo que NO incluye Homebrew, donde viven
# node/npm. Sin esto, el build del frontend falla con "npm: command not found".
# Cubre Apple Silicon (/opt/homebrew) e Intel (/usr/local).
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

log() { echo "$(date '+%F %T') [auto-sync] $1"; }

# No tocar nada si hay un rebase/merge a medio resolver de un ciclo anterior.
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] || [ -f .git/MERGE_HEAD ]; then
    log "Repo con un rebase/merge sin resolver — no se toca hasta arreglarlo a mano."
    exit 1
fi

HOST="$(scutil --get ComputerName 2>/dev/null | sed 's/^ *//;s/ *$//')"
[ -z "$HOST" ] && HOST="$(hostname)"

BEFORE="$(git rev-parse HEAD)"

# 1. Commit local si hay algo sin guardar.
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -q -m "Auto-sync desde ${HOST} — $(date '+%Y-%m-%d %H:%M:%S')

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
    log "Commit local creado."
fi

# 2. Integrar lo remoto. Primero el fetch por separado: si falla es la red
#    (el Mac despertando de reposo, wifi caída…), no un conflicto, y basta
#    con reintentar en el siguiente ciclo.
if ! git fetch -q origin main >/tmp/german-index-sync-fetch.log 2>&1; then
    log "Sin conexión con GitHub — se reintenta en el siguiente ciclo. Detalle: /tmp/german-index-sync-fetch.log"
    exit 0
fi
if ! git rebase --autostash origin/main >/tmp/german-index-sync-pull.log 2>&1; then
    cp /tmp/german-index-sync-pull.log /tmp/german-index-sync-conflict.log
    log "Conflicto al integrar cambios remotos — se aborta el rebase, requiere resolución manual. Detalle: /tmp/german-index-sync-conflict.log"
    git rebase --abort 2>/dev/null
    exit 1
fi

# 3. Push si tenemos commits por delante del remoto.
if [ -n "$(git log origin/main..HEAD --oneline 2>/dev/null)" ]; then
    if ! git push origin main >/tmp/german-index-sync-push.log 2>&1; then
        log "Push falló — se reintentará en el siguiente ciclo. Detalle: /tmp/german-index-sync-push.log"
        exit 1
    fi
    log "Push OK."
fi

AFTER="$(git rev-parse HEAD)"

# 4. Si el árbol no cambió en todo el ciclo, no hay nada que reconstruir.
if [ "$BEFORE" = "$AFTER" ]; then
    exit 0
fi

CHANGED="$(git diff --name-only "$BEFORE" "$AFTER")"
need_pip=0; need_build=0; need_restart=0
while IFS= read -r f; do
    case "$f" in
        backend/requirements.txt)     need_pip=1; need_restart=1 ;;
        backend/*.py|backend/**/*.py) need_restart=1 ;;
        frontend/src/*|frontend/src/**|\
        frontend/index.html|frontend/public/*|frontend/public/**|\
        frontend/package.json|frontend/package-lock.json|frontend/vite.config.js)
                                      need_build=1; need_restart=1 ;;
    esac
done <<< "$CHANGED"

if [ "$need_pip" = 1 ]; then
    log "requirements.txt cambió — pip install."
    backend/.venv/bin/pip install -q -r backend/requirements.txt
fi

if [ "$need_build" = 1 ]; then
    log "Frontend cambió — npm run build."
    if ! ( cd frontend && npm install --no-audit --no-fund --silent && npm run build >/tmp/german-index-sync-build.log 2>&1 ); then
        log "Build falló — no se reinicia para no servir un build roto. Detalle: /tmp/german-index-sync-build.log"
        exit 1
    fi
fi

if [ "$need_restart" = 1 ]; then
    log "Reiniciando el servidor…"
    launchctl kickstart -k "gui/$(id -u)/$LABEL"
    sleep 2
    if curl -fsS -o /dev/null http://localhost:8002/api/health; then
        log "OK — :8002 responde tras el cambio."
    else
        log "El servidor no responde en :8002 tras el reinicio — revisar ~/Library/Logs/german-index/."
        exit 1
    fi
else
    log "Solo cambió contenido — el backend lo recarga solo, sin reinicio."
fi

log "OK."
