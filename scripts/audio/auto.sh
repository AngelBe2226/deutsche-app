#!/usr/bin/env bash
# Generación automática de audios (LaunchAgent com.angelbe.german-index-audio,
# cada 15 min en el Mac que tiene .env.local). Solo actúa si AUDIO_AUTO=1 y
# hay claves de R2; sin cambios en el contenido sale al instante
# (--if-changed) y si ya hay una generación en marcha también (generate.lock).
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_DIR/.env.local"
[ -f "$ENV_FILE" ] || exit 0
grep -qE '^\s*AUDIO_AUTO\s*=\s*1' "$ENV_FILE" || exit 0
# Sin R2 no se genera en automático (los audios se acumularían en el disco).
grep -qE '^\s*R2_SECRET_ACCESS_KEY\s*=\s*\S' "$ENV_FILE" || exit 0

PHASE="$(grep -E '^\s*AUDIO_PHASE\s*=' "$ENV_FILE" | tail -1 | sed 's/.*=[[:space:]]*//')"
VERBS="$(grep -E '^\s*AUDIO_VERBS\s*=' "$ENV_FILE" | tail -1 | sed 's/.*=[[:space:]]*//')"
MAXC="$(grep -E '^\s*AUDIO_MAX_CHARS_PER_RUN\s*=' "$ENV_FILE" | tail -1 | sed 's/.*=[[:space:]]*//')"
exec node "$REPO_DIR/scripts/audio/generate.mjs" --if-changed --quiet \
    --phase "${PHASE:-5}" --max-chars "${MAXC:-300000}" ${VERBS:+--verbs "$VERBS"}
