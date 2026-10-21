// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { createServer, type Server } from 'node:net';
import type { AddressInfo } from 'node:net';
// @ts-expect-error — plain JS script, no types
import { tlsHandshake, summarizeProbes, verdict } from '../../scripts/probe-staging.mjs';

// The probe answers one question: is the site down, or is this network blocking it? Google's
// uptime probes decide "down"; this machine's view only decides "blocked here".

const point = (passed: boolean) => ({ points: [{ value: { boolValue: passed } }] });
const here = (ok: boolean) => ({ ok, says: ok ? '200' : 'TLS reset during the handshake' });
const google = (passing: number, regions = 3) => ({ known: true, passing, regions, says: '' });

describe('summarizeProbes', () => {
  it('counts the latest result in each region', () => {
    expect(summarizeProbes({ timeSeries: [point(true), point(true), point(false)] })).toMatchObject(
      {
        known: true,
        passing: 2,
        regions: 3,
        says: 'passing in 2 of 3 regions',
      },
    );
  });

  it('says it does not know when there are no results yet', () => {
    expect(summarizeProbes({})).toMatchObject({ known: false });
  });
});

describe('verdict', () => {
  it('calls a site blocked here when Google reaches it and this network cannot', () => {
    expect(verdict(here(false), google(3))).toBe('blocked here');
  });

  it('calls a site down when Google cannot reach it from two or more regions', () => {
    expect(verdict(here(false), google(1))).toBe('down');
    expect(verdict(here(true), google(0))).toBe('down');
  });

  it('does not call one failing region an outage', () => {
    expect(verdict(here(true), google(2))).toBe('up');
  });

  it('does not guess when Google’s side cannot be read', () => {
    expect(verdict(here(false), { known: false, says: '' })).toBe('unknown');
  });
});

describe('tlsHandshake', () => {
  let server: Server | undefined;
  afterEach(() => server?.close());

  it('reports a reset during the handshake, as a name-matching filter does', async () => {
    // A server that drops every connection as it arrives, without a word of TLS.
    server = createServer((socket) => socket.resetAndDestroy());
    await new Promise<void>((done) => server!.listen(0, '127.0.0.1', done));
    const { port } = server.address() as AddressInfo;
    expect(await tlsHandshake({ host: '127.0.0.1', port, servername: 'snackbyte.dev' })).toBe(
      'reset',
    );
  });

  it('reports a refused connection when nothing listens', async () => {
    server = createServer();
    await new Promise<void>((done) => server!.listen(0, '127.0.0.1', done));
    const { port } = server.address() as AddressInfo;
    await new Promise<void>((done) => server!.close(() => done()));
    server = undefined;
    expect(await tlsHandshake({ host: '127.0.0.1', port, servername: 'snackbyte.dev' })).toBe(
      'refused',
    );
  });
});
