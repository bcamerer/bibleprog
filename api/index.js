import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

let appReady = false;
let appInstance = null;

export default async (req, res) => {
  try {
    // Initialize app on first request
    if (!appReady) {
      const serverModule = require(path.join(process.cwd(), 'dist', 'index.cjs'));
      appInstance = serverModule.app;
      
      // Set up server routes and middleware
      if (serverModule.setupServer && typeof serverModule.setupServer === 'function') {
        await serverModule.setupServer();
      }
      
      appReady = true;
    }
    
    // Delegate to Express
    return appInstance(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error', message: err.message }));
  }
};

