// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { color } from '@snackbyte/brand';
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

  it('links the privacy policy and the terms from the built homepage', async () => {
    const res = await request(createApp()).get('/');
    expect(res.text).toContain('href="/privacy"');
    expect(res.text).toContain('href="/terms"');
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

  it('serves a /for/ page with its script and the page kit it links', async () => {
    const app = createApp();
    const page = await request(app).get('/for/jan/jet-lag/');
    expect(page.status).toBe(200);
    expect(page.headers['content-type']).toContain('text/html');
    expect(page.text).toContain('href="/kit/page.css"');

    const script = await request(app).get('/for/jan/jet-lag/plan.js');
    expect(script.status).toBe(200);
    expect(script.headers['content-type']).toMatch(/javascript/);

    const css = await request(app).get('/kit/page.css');
    expect(css.status).toBe(200);
    expect(css.headers['content-type']).toContain('text/css');
    expect(css.text).toContain(`--ground: ${color.ground.day}`);
    expect(css.text).toContain('snackbyte page kit');
  });

  it('answers a miss anywhere, inside sections and /for/ too, with the one not-found page', async () => {
    const app = createApp();
    for (const path of [
      '/work/playhouse-395/nothing-here/',
      '/for/jan/nothing-here/',
      '/brand/brand.css',
    ]) {
      const res = await request(app).get(path);
      expect(res.status, path).toBe(404);
      expect(res.text, path).toContain('There is nothing at this address.');
    }
  });

  it('serves /style, generated from the brand package', async () => {
    const res = await request(createApp()).get('/style/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain(`--ground: ${color.ground.day};`);
    expect(res.text).not.toContain('%brand:');
  });

  // These two addresses are given to Google and never move; each answers itself, with or
  // without the slash, never with a redirect.
  for (const [path, heading] of [
    ['/privacy', 'Privacy policy'],
    ['/privacy/', 'Privacy policy'],
    ['/terms', 'Terms of service'],
    ['/terms/', 'Terms of service'],
  ]) {
    it(`serves ${path} directly, with no redirect`, async () => {
      const res = await request(createApp()).get(path);
      expect(res.status).toBe(200);
      expect(res.headers.location).toBeUndefined();
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain(`<h1>${heading}</h1>`);
    });
  }

  it('lists nothing at /for/ — each page is reached by its own link', async () => {
    const app = createApp();
    for (const path of ['/for/', '/for/jan/']) {
      expect((await request(app).get(path)).status, path).toBe(404);
    }
  });

  it('redirects the unhyphenated playhouse395 address to the real section, keeping the rest', async () => {
    const app = createApp();
    for (const [from, to] of [
      ['/work/playhouse395', '/work/playhouse-395/'],
      ['/work/playhouse395/', '/work/playhouse-395/'],
      ['/work/playhouse395/sound-system/', '/work/playhouse-395/sound-system/'],
      ['/work/playhouse395/sound-system/?x=1', '/work/playhouse-395/sound-system/?x=1'],
    ]) {
      const res = await request(app).get(from);
      expect(res.status, from).toBe(301);
      expect(res.headers.location, from).toBe(to);
    }
  });

  it('serves the link-preview card the head points at', async () => {
    const app = createApp();
    const home = await request(app).get('/');
    expect(home.text).toContain('property="og:image" content="https://snackbyte.io/social.png"');
    const card = await request(app).get('/social.png');
    expect(card.status).toBe(200);
    expect(card.headers['content-type']).toBe('image/png');
  });

  it('fills the head from the brand at build, leaving nothing unfilled', async () => {
    const app = createApp();
    for (const path of ['/', '/nothing-is-here']) {
      const res = await request(app).get(path);
      expect(res.text, path).not.toContain('%head:');
      expect(res.text, path).toContain(`content="${color.ground.day}"`);
    }
  });

  it('responds on an API route (replace with your own)', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });
});
