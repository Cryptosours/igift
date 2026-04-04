#!/usr/bin/env bash
# iGift — Automated Ingestion Cron
# Runs the ingestion pipeline and logs results.
# Install on VPS: (crontab -l; echo '0 */6 * * * /bin/bash /opt/realdeal/scripts/ingest-cron.sh >> /opt/realdeal/logs/ingest.log 2>&1') | crontab -

set -euo pipefail

LOG_FILE="/opt/realdeal/logs/ingest.log"
API_URL="http://127.0.0.1:3200/api/ingest"

# Load env vars from project
if [ -f /opt/realdeal/.env ]; then
  set -a
  source /opt/realdeal/.env
  set +a
fi

INGEST_KEY="${INGEST_API_KEY:-}"

if [ -z "$INGEST_KEY" ]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: INGEST_API_KEY not set" >> "$LOG_FILE"
  exit 1
fi

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Starting ingest..." >> "$LOG_FILE"

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $INGEST_KEY" \
  -H "Content-Type: application/json" \
  --max-time 130 \
  "$API_URL" 2>&1)

if echo "$RESPONSE" | grep -q '"success":true'; then
  UPSERTED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['summary']['totalOffersUpserted'])" 2>/dev/null || echo "?")
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) OK — upserted: $UPSERTED" >> "$LOG_FILE"
else
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) FAILED: $(echo "$RESPONSE" | head -c 200)" >> "$LOG_FILE"
fi
