#!/usr/bin/env bash
# Generación automática de audios en alemán (LaunchAgent
# com.angelbe.german-index-audio, cada 15 min).
#
# Horario (decidido el 2026-11-18): el Mac se reparte con english-app, que
# genera de 0:00 a 8:00. El alemán solo genera de 8:00 a 24:00: fuera de esa
# franja no empieza, y si está generando, para sola a las 0:00 (--window 8-24)
# y sigue en la primera pasada desde las 8:00.
#
# Se activa con AUDIO_AUTO=1 en .env.local o con el archivo
# scripts/audio/.state/auto-enabled (generación completa pedida aunque aún no
# haya claves de R2: entonces los audios esperan en scripts/audio/.cache y el
# generador se detiene si el disco baja de 3 GB libres).
# Sin cambios en el contenido sale al instante (--if-changed) y si ya hay una
# generación en marcha también (generate.lock).
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_DIR/.env.local"
MARK="$REPO_DIR/scripts/audio/.state/auto-enabled"

envval() { [ -f "$ENV_FILE" ] && grep -E "^\s*$1\s*=" "$ENV_FILE" | tail -1 | sed 's/.*=[[:space:]]*//'; }

if [ "$(envval AUDIO_AUTO)" != "1" ] && [ ! -f "$MARK" ]; then exit 0; fi

HOUR=$((10#$(date +%H)))
[ "$HOUR" -ge 8 ] || exit 0   # de 0:00 a 8:00 el Mac es de english-app

PHASE="$(envval AUDIO_PHASE)"
VERBS="$(envval AUDIO_VERBS)"
MAXC="$(envval AUDIO_MAX_CHARS_PER_RUN)"
ARGS=(--if-changed --window 8-24 --phase "${PHASE:-5}")
[ -n "$VERBS" ] && ARGS+=(--verbs "$VERBS")
[ -n "$MAXC" ] && ARGS+=(--max-chars "$MAXC")

cd "$REPO_DIR"
exec caffeinate -i nice -n 10 node "$REPO_DIR/scripts/audio/generate.mjs" "${ARGS[@]}" \
    >> "$HOME/Library/Logs/german-index-audio-full.log" 2>&1
