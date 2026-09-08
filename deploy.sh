#!/bin/bash
# =============================================================
# deploy.sh — Auto-deploy script for Casa Tarongers 1967
# Called by webhook-server.js on GitHub push events
# =============================================================

set -e

APP_DIR="/var/www/CASA-TARONGERS-1967"
LOG_FILE="/var/log/casa-tarongers-deploy.log"

echo "================================================" >> "$LOG_FILE"
echo "🚀 Deploy started at $(date)" >> "$LOG_FILE"
echo "================================================" >> "$LOG_FILE"

cd "$APP_DIR"

# Pull latest changes from GitHub
echo "📥 Pulling latest changes..." >> "$LOG_FILE"
git pull origin main >> "$LOG_FILE" 2>&1

# Install dependencies (only if package.json changed)
echo "📦 Installing dependencies..." >> "$LOG_FILE"
npm install --production=false >> "$LOG_FILE" 2>&1

# Build the project
echo "🔨 Building project..." >> "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1

# Restart the app via PM2
echo "♻️  Restarting application..." >> "$LOG_FILE"
pm2 restart casa-tarongers >> "$LOG_FILE" 2>&1

echo "✅ Deploy completed at $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
