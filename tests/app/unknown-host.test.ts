// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../../src/server.js';
import { isNotFoundAsset, servesHost } from '../../src/hosts.js';

// The site is the load balancer's default service, so with a wildcard DNS record every unused
// name on snackbyte.io and snackbyte.dev reaches it. Those names get the not-found page.
const dist404 = fileURLToPath(new URL('../../dist/404.html', import.meta.url));
const distPrivacy = fileURLToPath(new URL('../../dist/privacy/index.html', import.meta.url));

beforeAll(() => {
  if (!existsSync(dist404) || !existsSync(distPrivacy)) {
    execFileSync('node', ['scripts/build.mjs'], { stdio: 'ignore' });
  }
});

const NOT_FOUND = 'There is nothing at this address.';

describe('a host the site does not serve', () => {
  const unknown = ['nosuch.snackbyte.io', 'auth.snackbyte.dev', 'example.com'];

  for (const host of unknown) {
    it(`answers ${host} at / with 404 and the not-found page`, async () => {
      const res = await request(createApp()).get('/').set('Host', host);
      expect(res.status).toBe(404);
      expect(res.text).toContain(NOT_FOUND);
      expect(res.text).toContain('<title>snackbyte — not found</title>');
    });
  }

  it('answers every page the site has with the not-found page, not the page', async () => {
    const app = createApp();
    for (const path of ['/privacy', '/terms', '/work/playhouse-395/', '/style/', '/api/version']) {
      const res = await request(app).get(path).set('Host', 'nosuch.snackbyte.io');
      expect(res.status, path).toBe(404);
      expect(res.text, path).toContain(NOT_FOUND);
    }
  });

  it('does not redirect a mistyped section name to the real one', async () => {
    const res = await request(createApp())
      .get('/work/playhouse395/')
      .set('Host', 'nosuch.snackbyte.io');
    expect(res.status).toBe(404);
  });

  it('still serves the files the not-found page loads, so it renders styled', async () => {
    const app = createApp();
    const page = readFileSync(dist404, 'utf8');
    const loads = [...page.matchAll(/(?:href|src)="(\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((path): path is string => path !== undefined && path !== '/');
    expect(loads.length).toBeGreaterThan(0);
    for (const path of loads) {
      expect(isNotFoundAsset(path), path).toBe(true);
      const res = await request(app).get(path).set('Host', 'nosuch.snackbyte.io');
      expect(res.status, path).toBe(200);
    }
  });

  it('answers a missing asset with 404, not the homepage', async () => {
    const res = await request(createApp())
      .get('/assets/no-such-file.js')
      .set('Host', 'nosuch.snackbyte.io');
    expect(res.status).toBe(404);
  });
});

describe('a host the site serves', () => {
  for (const host of ['snackbyte.io', 'www.snackbyte.io', 'snackbyte.dev', 'www.snackbyte.dev']) {
    it(`serves the homepage on ${host}`, async () => {
      const res = await request(createApp()).get('/').set('Host', host);
      expect(res.status).toBe(200);
      expect(res.text).not.toContain(NOT_FOUND);
    });
  }

  it('reads the name in any case, and with a port', async () => {
    const app = createApp();
    for (const host of ['SnackByte.IO', 'snackbyte.io:443', 'localhost:8080']) {
      const res = await request(app).get('/').set('Host', host);
      expect(res.status, host).toBe(200);
    }
  });

  it('still gives an unknown path the 404', async () => {
    const res = await request(createApp()).get('/nothing-is-here').set('Host', 'snackbyte.io');
    expect(res.status).toBe(404);
    expect(res.text).toContain(NOT_FOUND);
  });
});

describe('servesHost', () => {
  it('serves no name at all as unknown', () => {
    expect(servesHost(undefined)).toBe(false);
    expect(servesHost('')).toBe(false);
  });

  it('serves a name only whole, not a name that ends in one of its own', () => {
    expect(servesHost('nosnackbyte.io')).toBe(false);
    expect(servesHost('snackbyte.io.example.com')).toBe(false);
  });
});
