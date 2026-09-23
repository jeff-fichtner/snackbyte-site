// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../../src/server.js';

// Smoke test for a server app: the built frontend is served and the API responds.
// Use this as a pattern for testing your own routes.
const distIndex = fileURLToPath(new URL('../../dist/index.html', import.meta.url));

beforeAll(() => {
  if (!existsSync(distIndex)) {
    execFileSync('node', ['scripts/build.mjs'], { stdio: 'ignore' });
  }
});

describe('app serves', () => {
  it('serves the built frontend', async () => {
    const res = await request(createApp()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<div id="root"');
  });

  it('answers a path that does not exist with 404 and the not-found page', async () => {
    const res = await request(createApp()).get('/nothing-is-here');
    expect(res.status).toBe(404);
    expect(res.text).toContain('There is nothing at this address.');
  });

  it('still serves a real client section', async () => {
    const res = await request(createApp()).get('/work/playhouse-395/');
    expect(res.status).toBe(200);
  });

  it('serves the link-preview card the head points at', async () => {
    const app = createApp();
    const home = await request(app).get('/');
    expect(home.text).toContain('property="og:image" content="https://snackbyte.io/social.png"');
    const card = await request(app).get('/social.png');
    expect(card.status).toBe(200);
    expect(card.headers['content-type']).toBe('image/png');
  });

  it('responds on an API route (replace with your own)', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });
});
