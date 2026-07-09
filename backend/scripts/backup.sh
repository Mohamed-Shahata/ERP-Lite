#!/usr/bin/env bash
set -euo pipefail

# ERP Lite — automated backup script
# Backs up: PostgreSQL database (pg_dump, custom format) + the uploads/ folder
# (product images, company logos, etc).
#
# Usage:
#   ./scripts/backup.sh
#
# Meant to run unattended via cron. All output also goes to backups/backup.log.

# --- config ------------------------------------------------------------
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
BACKUP_ROOT="${BACKUP_ROOT:-$APP_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
DEST_DIR="$BACKUP_ROOT/$TIMESTAMP"
LOG_FILE="$BACKUP_ROOT/backup.log"

mkdir -p "$DEST_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# --- read DATABASE_URL from .env ----------------------------------------
if [[ ! -f "$ENV_FILE" ]]; then
  log "ERROR: .env not found at $ENV_FILE"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | tail -n1 | cut -d '=' -f2- | tr -d '"' | tr -d '\r')"

if [[ -z "$DATABASE_URL" ]]; then
  log "ERROR: DATABASE_URL not set in $ENV_FILE"
  exit 1
fi

# --- 1. dump the database (custom format: compressed + selectively restorable) ---
DB_DUMP_FILE="$DEST_DIR/database.dump"
log "Dumping database..."
if pg_dump --format=custom --no-owner --no-privileges --file="$DB_DUMP_FILE" "$DATABASE_URL"; then
  log "Database dump saved: $DB_DUMP_FILE ($(du -h "$DB_DUMP_FILE" | cut -f1))"
else
  log "ERROR: pg_dump failed"
  rm -rf "$DEST_DIR"
  exit 1
fi

# --- 2. archive the uploads/ folder (logos, product images, ...) -----------
if [[ -d "$APP_DIR/uploads" ]]; then
  UPLOADS_ARCHIVE="$DEST_DIR/uploads.tar.gz"
  log "Archiving uploads/..."
  tar -czf "$UPLOADS_ARCHIVE" -C "$APP_DIR" uploads
  log "Uploads archived: $UPLOADS_ARCHIVE ($(du -h "$UPLOADS_ARCHIVE" | cut -f1))"
else
  log "No uploads/ folder found, skipping."
fi

# --- 3. prune backups older than RETENTION_DAYS -----------------------------
log "Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_ROOT" -maxdepth 1 -mindepth 1 -type d -mtime "+$RETENTION_DAYS" -print -exec rm -rf {} \; | while read -r removed; do
  log "Removed old backup: $removed"
done

log "Backup complete: $DEST_DIR"

# --- optional: copy off this server -----------------------------------------
# Local backups don't survive a lost/corrupted server. Once this script works,
# add an off-site copy step here, e.g. with rclone (supports S3, Google Drive,
# Backblaze B2, etc):
#
#   rclone copy "$DEST_DIR" remote:erp-lite-backups/"$TIMESTAMP"
#
# or plain rsync to another machine:
#
#   rsync -az "$DEST_DIR" user@backup-host:/backups/erp-lite/
