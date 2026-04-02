import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from dist/public
const publicDir = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicDir)) {
  // Serve static files with proper content types
  app.use((req, res, next) => {
    const filePath = path.join(publicDir, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      const fileContent = fs.readFileSync(filePath);
      res.send(fileContent);
      return;
    }
    next();
  });

  // SPA fallback - serve index.html for all unmatched routes
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      res.send(indexContent);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
} else {
  app.use('*', (req, res) => {
    res.status(503).json({ error: 'Server not ready', message: 'Static files not built' });
  });
}

// Export handler for Vercel
export default (req, res) => {
  return app(req, res);
};





