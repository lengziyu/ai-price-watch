#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/ai-price-watch}"
APP_NAME="${APP_NAME:-ai-price-watch}"
APP_PORT="${APP_PORT:-3014}"
APP_BRANCH="${APP_BRANCH:-main}"
ADMIN_DATA_DIR="${ADMIN_DATA_DIR:-${APP_DIR}/.runtime/admin-data}"
ADMIN_DATA_BOOTSTRAP_FROM_REPO="${ADMIN_DATA_BOOTSTRAP_FROM_REPO:-1}"
RUNTIME_MUTABLE_FILES="${RUNTIME_MUTABLE_FILES:-data/admin/operation-logs.json data/admin/deal-articles.json data/admin/manual-deals.json data/admin/membership-rate-reviews.json data/admin/source-reviews.json}"
RUNTIME_RESTORE_AFTER_PULL="${RUNTIME_RESTORE_AFTER_PULL:-1}"

snapshot_timestamp="$(date +%Y%m%d-%H%M%S)"
runtime_snapshot_root="data/admin/_runtime-backups/runtime-${snapshot_timestamp}"
backed_up_runtime_files=()

echo "[1/12] Enter app dir: ${APP_DIR}"
cd "${APP_DIR}"

if [[ ! -d .git ]]; then
  echo "ERROR: ${APP_DIR} is not a git repository"
  exit 1
fi

echo "[2/12] Load .env"
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "WARN: .env not found, continue with current environment"
fi

echo "[3/12] Ensure admin runtime data dir: ${ADMIN_DATA_DIR}"
mkdir -p "${ADMIN_DATA_DIR}"

if [[ "${ADMIN_DATA_BOOTSTRAP_FROM_REPO}" == "1" ]]; then
  echo "[4/12] Bootstrap admin runtime data from repo snapshot (if needed)"
  for seed_file in deal-articles.json manual-deals.json operation-logs.json membership-rate-reviews.json source-reviews.json; do
    source_path="data/admin/${seed_file}"
    target_path="${ADMIN_DATA_DIR}/${seed_file}"
    if [[ -f "${source_path}" && ! -f "${target_path}" ]]; then
      cp "${source_path}" "${target_path}"
      echo "bootstrap ${target_path} <= ${source_path}"
    fi
  done
else
  echo "[4/12] Skip bootstrap from repo snapshot"
fi

echo "[5/12] Backup + reset runtime mutable files before pull"
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

echo "[6/12] Pull latest code from branch: ${APP_BRANCH}"
git fetch --all --prune
git checkout "${APP_BRANCH}"
git pull --ff-only origin "${APP_BRANCH}"

if [[ "${RUNTIME_RESTORE_AFTER_PULL}" == "1" && ${#backed_up_runtime_files[@]} -gt 0 ]]; then
  echo "[7/12] Restore runtime mutable files after pull"
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
  echo "[7/12] Skip runtime restore after pull"
fi

echo "[8/12] Install dependencies"
if command -v cnpm >/dev/null 2>&1; then
  cnpm i
else
  npm ci || npm i
fi

echo "[9/12] Build"
rm -rf .next
NODE_ENV=production npm run build

echo "[10/12] Restart pm2 process: ${APP_NAME}"
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  PORT="${APP_PORT}" NODE_ENV=production ADMIN_DATA_DIR="${ADMIN_DATA_DIR}" pm2 restart "${APP_NAME}" --update-env
else
  PORT="${APP_PORT}" NODE_ENV=production ADMIN_DATA_DIR="${ADMIN_DATA_DIR}" pm2 start "npm run start -- -p ${APP_PORT}" --name "${APP_NAME}" --update-env
fi
pm2 save

echo "[11/12] Health check"
sleep 2
curl -fsS "http://127.0.0.1:${APP_PORT}/" >/dev/null

echo "[12/12] Done"
pm2 status "${APP_NAME}"
echo "OK: http://127.0.0.1:${APP_PORT} is healthy"
