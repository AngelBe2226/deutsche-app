#!/usr/bin/env bash
#
# install-sync.sh — instala el auto-sync desatendido de german-index en ESTA
# máquina, sea cual sea el usuario o la ruta.
#
# Crea (o reinstala) ~/Library/LaunchAgents/com.angelbe.german-index-sync.plist
# apuntando a este mismo repo y lo carga. A partir de ahí, cada N segundos
# (5 min por defecto) corre scripts/auto-sync.sh: pull + push + build/restart.
#
# Idempotente: puedes correrlo las veces que quieras.
# Uso:   bash scripts/install-sync.sh [segundos]
#        bash scripts/install-sync.sh 600     # cada 10 min en vez de 5
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.angelbe.german-index-sync"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_DIR="$HOME/Library/Logs/german-index"
INTERVAL="${1:-300}"

if [ ! -x "$REPO_DIR/scripts/auto-sync.sh" ]; then
    chmod +x "$REPO_DIR/scripts/auto-sync.sh" 2>/dev/null || true
fi

mkdir -p "$LOG_DIR" "$(dirname "$PLIST")"

cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${REPO_DIR}/scripts/auto-sync.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${REPO_DIR}</string>
    <key>StartInterval</key>
    <integer>${INTERVAL}</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${LOG_DIR}/auto-sync.log</string>
    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/auto-sync.err.log</string>
</dict>
</plist>
PLISTEOF

# (Re)cargar el agente.
launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Instalado: ${LABEL}"
echo "  repo:     ${REPO_DIR}"
echo "  cada:     ${INTERVAL}s"
echo "  logs:     ${LOG_DIR}/auto-sync.log"
launchctl list | grep "${LABEL}" || true
