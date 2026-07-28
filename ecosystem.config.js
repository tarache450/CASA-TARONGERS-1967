// =============================================================
// ecosystem.config.js — PM2 Configuration
// Manages both the main app and the webhook server
// =============================================================

module.exports = {
  apps: [
    {
      name: 'casa-tarongers',
      script: './server.prod.js',
      cwd: '/var/www/CASA-TARONGERS-1967',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/casa-tarongers-error.log',
      out_file: '/var/log/casa-tarongers-out.log',
      merge_logs: true
    },
    {
      name: 'casa-tarongers-webhook',
      script: './webhook-server.js',
      cwd: '/var/www/CASA-TARONGERS-1967',
      env: {
        WEBHOOK_SECRET: 'CHANGE_ME_TO_A_SECURE_SECRET'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/casa-webhook-error.log',
      out_file: '/var/log/casa-webhook-out.log',
      merge_logs: true
    }
  ]
};
