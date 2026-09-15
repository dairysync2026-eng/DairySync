import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (mounted first)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      server: 'DairySync Local Express Server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: PORT,
    });
  });

  app.get('/api/status', (req, res) => {
    res.json({
      online: true,
      system: 'PCC-MMSU DairySync Enterprise Local Server',
      version: 'v2026.8.9',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Serve static assets from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DairySync local server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
