#!/usr/bin/env bash
set -euo pipefail

# ERP Lite — restore from a backup produced by backup.sh
#
# Usage:
#   ./scripts/restore.sh backups/2026-07-09_02-00-00

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
BACKUP_DIR="${1:?Usage: restore.sh <backup-folder>}"

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "ERROR: backup folder not found: $BACKUP_DIR"
  exit 1
fi

if [[ ! -f "$BACKUP_DIR/database.dump" ]]; then
  echo "ERROR: $BACKUP_DIR/database.dump not found"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | tail -n1 | cut -d '=' -f2- | tr -d '"' | tr -d '\r')"

echo "This will OVERWRITE the current database at:"
echo "  $DATABASE_URL"
echo "with the contents of:"
echo "  $BACKUP_DIR/database.dump"
read -rp "Type 'yes' to continue: " CONFIRM
[[ "$CONFIRM" == "yes" ]] || { echo "Aborted."; exit 1; }

pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" "$BACKUP_DIR/database.dump"
echo "Database restored."

if [[ -f "$BACKUP_DIR/uploads.tar.gz" ]]; then
  read -rp "Also restore uploads/ (logos, product images)? This overwrites current files. (y/N): " RESTORE_UPLOADS
  if [[ "$RESTORE_UPLOADS" =~ ^[Yy]$ ]]; then
    tar -xzf "$BACKUP_DIR/uploads.tar.gz" -C "$APP_DIR"
    echo "uploads/ restored."
  fi
fi

echo "Done."
