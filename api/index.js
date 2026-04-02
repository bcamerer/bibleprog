import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// Helper to serve index.html for SPA
const serveIndex = (res, publicDir) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from dist/public
const publicDir = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  
  // SPA fallback - serve index.html for all unmatched routes
  app.get('*', (req, res) => {
    serveIndex(res, publicDir);
  });
} else {
  app.use('*', (req, res) => {
    res.status(503).json({ error: 'Server not ready', message: 'Static files not built', publicDir });
  });
}

export default app;


