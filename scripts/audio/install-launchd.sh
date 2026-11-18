#!/usr/bin/env bash
# Instala (o reinstala) el LaunchAgent que genera los audios nuevos cada 15 min.
# No hace nada mientras .env.local no tenga AUDIO_AUTO=1 y las claves de R2.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LABEL=com.angelbe.german-index-audio
DEST="$HOME/Library/LaunchAgents/$LABEL.plist"
sed -e "s#__REPO__#$REPO_DIR#g" -e "s#__HOME__#$HOME#g" "$REPO_DIR/scripts/launchd/$LABEL.plist" > "$DEST"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"
echo "LaunchAgent $LABEL instalado."
