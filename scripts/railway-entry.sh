#!/usr/bin/env bash
# Single entrypoint for both Railway services (railway.json points here).
# The web service runs with no SERVICE_ROLE; the cron worker service sets
# SERVICE_ROLE=cron-worker as an env var — no per-service start-command
# configuration needed.
set -euo pipefail

if [ "${SERVICE_ROLE:-web}" = "cron-worker" ]; then
  exec npm run cron:worker
else
  exec npm run start:railway
fi
