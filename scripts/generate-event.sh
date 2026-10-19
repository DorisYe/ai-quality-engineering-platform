#!/usr/bin/env bash
set -euo pipefail
TYPE="${1:-StorageCapacityWarning}"
SEVERITY="${2:-Warning}"
SOURCE="${3:-TestStorage01}"
BASE_URL="${4:-http://127.0.0.1:3100}"

# Use Node.js for safe JSON encoding (all supported project environments include Node).
PAYLOAD="$(node -e 'const [type,severity,source]=process.argv.slice(1);process.stdout.write(JSON.stringify({type,severity,source}))' "$TYPE" "$SEVERITY" "$SOURCE")"
curl --fail-with-body --silent --show-error \
  -H 'Content-Type: application/json' \
  -X POST -d "$PAYLOAD" "$BASE_URL/api/events"
printf '\n'
