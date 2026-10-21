/**
 * Is the site down, or is this network blocking it?
 *
 * Staging on snackbyte.dev has "gone down" several times when it was up for everyone else: a
 * filter on Jeff's network blocks the .dev names, on and off (inbox #3e4c6c). This asks both
 * sides at once: can this machine reach each host, and can Google's uptime probes, from three
 * regions, in the last fifteen minutes. Read-only.
 *
 *   node scripts/probe-staging.mjs
 *
 * Exit status: 0 every host is up; 1 a host is down for everyone; 2 a host is up but blocked
 * on this network; 3 Google's side could not be read, so it cannot tell.
 */
import { execFileSync } from 'node:child_process';
import { resolve4 } from 'node:dns/promises';
import { connect } from 'node:tls';
import { fileURLToPath } from 'node:url';

// The project and the uptime checks that watch each host; see DEPLOY.md § Uptime checks.
const PROJECT = 'snackbyte-apps';
const HOSTS = [
  { host: 'snackbyte.dev', env: 'staging', check: 'snackbyte-dev-staging-awLGnDVh0oM' },
  { host: 'snackbyte.io', env: 'production', check: 'snackbyte-io-production-OqyPN64PpKE' },
];
const WINDOW_MINUTES = 15;

/**
 * A TLS handshake with the name the browser would send, which is what a name-matching filter
 * acts on. Resolves to 'ok' or to what went wrong: 'reset', 'refused', 'timeout', or the code.
 */
export function tlsHandshake({ host, port = 443, servername, timeoutMs = 8000 }) {
  return new Promise((done) => {
    const socket = connect({ host, port, servername, rejectUnauthorized: false });
    const finish = (result) => {
      socket.destroy();
      done(result);
    };
    socket.setTimeout(timeoutMs, () => finish('timeout'));
    socket.once('secureConnect', () => finish('ok'));
    socket.once('error', (err) => {
      if (err.code === 'ECONNRESET' || err.code === 'EPIPE') finish('reset');
      else if (err.code === 'ECONNREFUSED') finish('refused');
      else finish(err.code ?? err.message);
    });
  });
}

/** What this machine sees for a host: its address, the handshake, and /api/version. */
async function fromHere({ host, env }) {
  let addresses = [];
  try {
    addresses = await resolve4(host);
  } catch (err) {
    return { ok: false, says: `no address: ${err.code}` };
  }
  const handshake = await tlsHandshake({ host: addresses[0], servername: host });
  if (handshake !== 'ok') {
    return {
      ok: false,
      says: handshake === 'reset' ? 'TLS reset during the handshake' : `TLS ${handshake}`,
    };
  }
  try {
    const res = await fetch(`https://${host}/api/version`, { signal: AbortSignal.timeout(10000) });
    const body = await res.json().catch(() => ({}));
    const ok = res.ok && body.environment === env;
    return {
      ok,
      says: ok
        ? `${res.status}, ${body.number}`
        : `${res.status}, environment ${body.environment ?? 'unknown'}`,
    };
  } catch (err) {
    return { ok: false, says: `request failed: ${err.cause?.code ?? err.message}` };
  }
}

/**
 * Google's probes for one check, from the Monitoring API's answer: the latest result in each
 * region over the window. Unknown when there is no data yet.
 */
export function summarizeProbes(answer) {
  const series = answer?.timeSeries ?? [];
  if (!series.length) return { known: false, says: 'no results in the window yet' };
  const latest = series.map((s) => s.points?.[0]?.value?.boolValue === true);
  const passing = latest.filter(Boolean).length;
  return {
    known: true,
    passing,
    regions: latest.length,
    says: `passing in ${passing} of ${latest.length} regions`,
  };
}

/** Google's probes for a check, read from the Monitoring API with this machine's gcloud login. */
async function fromGoogle({ check }) {
  let token;
  try {
    token = execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return { known: false, says: 'gcloud is not signed in, so Google’s side cannot be read' };
  }
  const end = new Date();
  const start = new Date(end.getTime() - WINDOW_MINUTES * 60000);
  const url = new URL(`https://monitoring.googleapis.com/v3/projects/${PROJECT}/timeSeries`);
  url.searchParams.set(
    'filter',
    `metric.type="monitoring.googleapis.com/uptime_check/check_passed" AND metric.label.check_id="${check}"`,
  );
  url.searchParams.set('interval.startTime', start.toISOString());
  url.searchParams.set('interval.endTime', end.toISOString());
  try {
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { known: false, says: `the Monitoring API answered ${res.status}` };
    return summarizeProbes(await res.json());
  } catch (err) {
    return {
      known: false,
      says: `the Monitoring API could not be reached: ${err.cause?.code ?? err.message}`,
    };
  }
}

/**
 * The verdict for one host. Google's probes decide whether it is down: failing from two or more
 * regions means down for everyone. This machine's view only says whether it is blocked here.
 */
export function verdict(here, google) {
  if (!google.known) return here.ok ? 'up from here; Google’s side unknown' : 'unknown';
  const down = google.regions - google.passing >= 2;
  if (down) return 'down';
  return here.ok ? 'up' : 'blocked here';
}

const EXIT = { up: 0, down: 1, 'blocked here': 2 };

async function main() {
  let status = 0;
  for (const target of HOSTS) {
    const [here, google] = await Promise.all([fromHere(target), fromGoogle(target)]);
    const v = verdict(here, google);
    console.log(`${target.host} (${target.env}): ${v}`);
    console.log(`  from this network:  ${here.says}`);
    console.log(`  Google's probes:    ${google.says}`);
    if (v === 'blocked here') {
      console.log('  The site is up for the internet; this network is blocking the name.');
      console.log('  Check it from a phone on cellular. Background: inbox #3e4c6c.');
    }
    status = Math.max(status, EXIT[v] ?? 3);
  }
  process.exitCode = status;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
