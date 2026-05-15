#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/ai-price-watch}"
APP_NAME="${APP_NAME:-ai-price-watch}"
APP_PORT="${APP_PORT:-3014}"
APP_BRANCH="${APP_BRANCH:-main}"
RUNTIME_MUTABLE_FILES="${RUNTIME_MUTABLE_FILES:-data/admin/operation-logs.json data/admin/deal-articles.json}"
RUNTIME_RESTORE_AFTER_PULL="${RUNTIME_RESTORE_AFTER_PULL:-1}"

snapshot_timestamp="$(date +%Y%m%d-%H%M%S)"
runtime_snapshot_root="data/admin/_runtime-backups/runtime-${snapshot_timestamp}"
backed_up_runtime_files=()

echo "[1/10] Enter app dir: ${APP_DIR}"
cd "${APP_DIR}"

if [[ ! -d .git ]]; then
  echo "ERROR: ${APP_DIR} is not a git repository"
  exit 1
fi

echo "[2/10] Backup + reset runtime mutable files before pull"
for file in ${RUNTIME_MUTABLE_FILES}; do
  if [[ -f "${file}" ]] && (! git diff --quiet -- "${file}" || ! git diff --cached --quiet -- "${file}"); then
    backup_path="${runtime_snapshot_root}/${file}"
    mkdir -p "$(dirname "${backup_path}")"
    cp "${file}" "${backup_path}"
    git restore --staged --worktree -- "${file}" || true
    backed_up_runtime_files+=("${file}")
    echo "backup+reset ${file} (backup: ${backup_path})"
  fi
done

echo "[3/10] Pull latest code from branch: ${APP_BRANCH}"
git fetch --all --prune
git checkout "${APP_BRANCH}"
git pull --ff-only origin "${APP_BRANCH}"

if [[ "${RUNTIME_RESTORE_AFTER_PULL}" == "1" && ${#backed_up_runtime_files[@]} -gt 0 ]]; then
  echo "[4/10] Restore runtime mutable files after pull"
  for file in "${backed_up_runtime_files[@]}"; do
    backup_path="${runtime_snapshot_root}/${file}"
    if [[ -f "${backup_path}" ]]; then
      mkdir -p "$(dirname "${file}")"
      cp "${backup_path}" "${file}"
      git restore --staged -- "${file}" || true
      echo "restore ${file} (from: ${backup_path})"
    fi
  done
else
  echo "[4/10] Skip runtime restore after pull"
fi

echo "[5/10] Install dependencies"
if command -v cnpm >/dev/null 2>&1; then
  cnpm i
else
  npm ci || npm i
fi

if [[ -f .env ]]; then
  echo "[6/10] Load .env"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "WARN: .env not found, continue with current environment"
fi

echo "[7/10] Build"
rm -rf .next
NODE_ENV=production npm run build

echo "[8/10] Restart pm2 process: ${APP_NAME}"
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  PORT="${APP_PORT}" NODE_ENV=production pm2 restart "${APP_NAME}" --update-env
else
  PORT="${APP_PORT}" NODE_ENV=production pm2 start "npm run start -- -p ${APP_PORT}" --name "${APP_NAME}" --update-env
fi
pm2 save

echo "[9/10] Health check"
sleep 2
curl -fsS "http://127.0.0.1:${APP_PORT}/" >/dev/null

echo "[10/10] Done"
pm2 status "${APP_NAME}"
echo "OK: http://127.0.0.1:${APP_PORT} is healthy"
