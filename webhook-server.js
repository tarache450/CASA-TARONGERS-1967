const http = require('http');
const crypto = require('crypto');
const { execFile } = require('child_process');
const path = require('path');

// =============================================================
// webhook-server.js — Listens for GitHub push webhooks
// Runs deploy.sh when a push to main is detected
// =============================================================

const WEBHOOK_PORT = 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy.sh');

function verifySignature(payload, signature) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const signature = req.headers['x-hub-signature-256'];

      // Verify GitHub signature
      if (!verifySignature(body, signature)) {
        console.log('❌ Invalid webhook signature');
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      try {
        const payload = JSON.parse(body);
        const branch = payload.ref;

        // Only deploy on pushes to main branch
        if (branch === 'refs/heads/main') {
          console.log(`📦 Push to main detected. Starting deploy...`);

          execFile('bash', [DEPLOY_SCRIPT], (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Deploy error:', error.message);
              console.error('stderr:', stderr);
              return;
            }
            console.log('✅ Deploy completed successfully');
            console.log(stdout);
          });

          res.writeHead(200);
          res.end('Deploy triggered');
        } else {
          console.log(`ℹ️  Push to ${branch} ignored (not main)`);
          res.writeHead(200);
          res.end('Ignored: not main branch');
        }
      } catch (e) {
        console.error('❌ Error parsing webhook:', e.message);
        res.writeHead(400);
        res.end('Bad request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(WEBHOOK_PORT, () => {
  console.log(`🔔 Webhook server listening on port ${WEBHOOK_PORT}`);
});
