import express, { type Express } from 'express';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PORT } from './config.js';
import { registerRoutes } from './routes/index.js';

// The built frontend always lives in dist/ at the app root, regardless of whether
// this file runs from source (dev) or compiled (prod), so resolve it from the
// working directory rather than this file's location.
const distDir = resolve(process.cwd(), 'dist');

/** Builds the Express app that serves the built frontend from dist/. */
export function createApp(): Express {
  const app = express();

  // Staging is publicly reachable (it serves exactly like production) but must not be indexed
  // by search engines — otherwise the staging host competes with production as duplicate
  // content. Keyed on APP_ENV, which is set only on the staging deploy, so production emits no
  // header and stays indexable. Registered before any route/static so it covers every response.
  app.use((_req, res, next) => {
    if (process.env.APP_ENV === 'staging') res.set('X-Robots-Tag', 'noindex');
    next();
  });

  registerRoutes(app);

  app.use(express.static(distDir));

  // Anything not served above does not exist. This site has no client-side routing, so
  // answering a miss with the homepage would tell a visitor nothing and would let a
  // search engine index unlimited duplicates of it. Express 5 requires a named wildcard
  // rather than a bare "*".
  app.get('/*splat', (_req, res) => {
    res.status(404).sendFile('404.html', { root: distDir });
  });

  return app;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  createApp().listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}
