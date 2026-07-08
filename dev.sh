#!/usr/bin/env bash
# dev.sh — Launch Backend API, Celery Worker, and Frontend in Konsole tabs
# Usage: ./dev.sh
# Prerequisites: Postgres + Redis must already be running

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TABFILE="/tmp/cv-analyzer-tabs.konsole"

cat > "$TABFILE" << EOF
title: Backend API;; command: ${ROOT}/scripts/run-backend.sh
title: Celery Worker;; command: ${ROOT}/scripts/run-celery.sh
title: Frontend;; command: ${ROOT}/scripts/run-frontend.sh
EOF

konsole --hold --tabs-from-file "$TABFILE"
