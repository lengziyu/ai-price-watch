#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/ai-price-watch}"
APP_NAME="${APP_NAME:-ai-price-watch}"
APP_PORT="${APP_PORT:-3014}"
APP_BRANCH="${APP_BRANCH:-main}"
RUNTIME_MUTABLE_FILES="${RUNTIME_MUTABLE_FILES:-data/admin/operation-logs.json data/admin/deal-articles.json}"

echo "[1/8] Enter app dir: ${APP_DIR}"
cd "${APP_DIR}"

if [[ ! -d .git ]]; then
  echo "ERROR: ${APP_DIR} is not a git repository"
  exit 1
fi

echo "[2/8] Reset runtime mutable files before pull"
for file in ${RUNTIME_MUTABLE_FILES}; do
  if [[ -f "${file}" ]] && (! git diff --quiet -- "${file}" || ! git diff --cached --quiet -- "${file}"); then
    mkdir -p data/admin/_runtime-backups
    backup_path="data/admin/_runtime-backups/$(basename "${file}").$(date +%Y%m%d-%H%M%S).bak"
    cp "${file}" "${backup_path}"
    git restore --staged --worktree -- "${file}" || true
    echo "reset ${file} (backup: ${backup_path})"
  fi
done

echo "[3/8] Pull latest code from branch: ${APP_BRANCH}"
git fetch --all --prune
git checkout "${APP_BRANCH}"
git pull --ff-only origin "${APP_BRANCH}"

echo "[4/8] Install dependencies"
if command -v cnpm >/dev/null 2>&1; then
  cnpm i
else
  npm ci || npm i
fi

if [[ -f .env ]]; then
  echo "[5/8] Load .env"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "WARN: .env not found, continue with current environment"
fi

echo "[6/8] Build"
rm -rf .next
NODE_ENV=production npm run build

echo "[7/8] Restart pm2 process: ${APP_NAME}"
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  PORT="${APP_PORT}" NODE_ENV=production pm2 restart "${APP_NAME}" --update-env
else
  PORT="${APP_PORT}" NODE_ENV=production pm2 start "npm run start -- -p ${APP_PORT}" --name "${APP_NAME}" --update-env
fi
pm2 save

echo "[8/8] Health check"
sleep 2
curl -fsS "http://127.0.0.1:${APP_PORT}/" >/dev/null

echo "[9/9] Done"
pm2 status "${APP_NAME}"
echo "OK: http://127.0.0.1:${APP_PORT} is healthy"
