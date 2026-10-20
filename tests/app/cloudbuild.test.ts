// @vitest-environment node
//
// Locks the runtime-identity contract of the deploy:
//
//   - cloudbuild.yaml declares _RUN_SA with no usable default, and its deploy step refuses to
//     run gcloud when it is empty. A defaulted or missing runtime account would not fail — Cloud
//     Run would quietly run the service as the project's default compute service account, the
//     one identity every app in the project shares.
//   - every deploy names --service-account and keeps --ingress locked to the load balancer.
//   - CI picks the runtime account from the branch and passes it on; DEPLOY.md's commands do too.
//
// The deploy step's script is run as Cloud Build would run it — each `${NAME}` substituted, `$$`
// unescaped to `$`, /workspace pointed at a scratch directory — under bash, with `gcloud`
// replaced by a stub on PATH. snackbyte-base's tests/machinery/cloudbuild.test.ts is the model.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const cloudbuild = readFileSync(join(repoRoot, 'cloudbuild.yaml'), 'utf8');
const workflow = readFileSync(join(repoRoot, '.github/workflows/ci-cd.yml'), 'utf8');
const deployDoc = readFileSync(join(repoRoot, 'DEPLOY.md'), 'utf8');

const STAGING_SA = 'site-stg-runtime@snackbyte-apps.iam.gserviceaccount.com';
const PRODUCTION_SA = 'site-prod-runtime@snackbyte-apps.iam.gserviceaccount.com';
const GUARD_MESSAGE = '_RUN_SA is required: the runtime service account this service runs as';

const SUBSTITUTIONS: Record<string, string> = {
  PROJECT_ID: 'project',
  TAG_NAME: 'v0.0.0',
  SHORT_SHA: 'abc1234',
  _REGION: 'region',
  _REPO: 'repo',
  _AR_HOST: 'region-docker.pkg.dev',
  _SERVICE: 'service',
  _APP_ENV: '',
  _MIN_INSTANCES: '1',
  _RUN_SA: PRODUCTION_SA,
};

// `gcloud` records its arguments, one per line, so a test can tell whether it ran and with what.
const GCLOUD = `#!/bin/bash
printf '%s\\n' "$@" > "$STUB_GCLOUD_ARGS"
`;

// A step is `- id: <id>`; its script is the `- |` block under `args:`, dedented. Only a
// non-blank, less-indented line ends the block.
function stepBody(id: string): string {
  const lines = cloudbuild.split('\n');
  const step = lines.findIndex((line) => new RegExp(`^\\s*- id: ${id}\\s*$`).test(line));
  expect(step, `no step with id ${id}`).toBeGreaterThan(-1);
  const next = lines.findIndex((line, i) => i > step && /^\s*- id: /.test(line));
  const end = next === -1 ? lines.length : next;
  const block = lines.findIndex((line, i) => i > step && i < end && /^\s*- \|\s*$/.test(line));
  expect(block, `step ${id} has no \`- |\` script block`).toBeGreaterThan(step);
  const indent = /^\s*/.exec(lines[block + 1])?.[0] ?? '';
  const body: string[] = [];
  for (let i = block + 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      body.push('');
      continue;
    }
    if (!lines[i].startsWith(indent)) break;
    body.push(lines[i].slice(indent.length));
  }
  return body.join('\n').trimEnd();
}

function substitute(script: string, values: Record<string, string>, workspace: string): string {
  return script
    .replace(/(?<!\$)\$\{([A-Z_][A-Z0-9_]*)\}/g, (_, name: string) => values[name] ?? '')
    .replaceAll('$$', '$')
    .replaceAll('/workspace/', `${workspace}/`);
}

let dir: string;
let gcloudArgs: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cloudbuild-'));
  gcloudArgs = join(dir, 'gcloud-args.txt');
  mkdirSync(join(dir, 'bin'));
  writeFileSync(join(dir, 'bin', 'gcloud'), GCLOUD);
  chmodSync(join(dir, 'bin', 'gcloud'), 0o755);
  writeFileSync(join(dir, 'build_date.txt'), '2026-01-01T00:00:00Z\n');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function deploy(values: Record<string, string>) {
  const result = spawnSync('bash', ['-c', substitute(stepBody('deploy'), values, dir)], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${join(dir, 'bin')}:${process.env.PATH ?? ''}`,
      STUB_GCLOUD_ARGS: gcloudArgs,
    },
  });
  const ran = existsSync(gcloudArgs);
  const args = ran ? readFileSync(gcloudArgs, 'utf8').split('\n') : [];
  return { status: result.status, stderr: result.stderr, ran, args };
}

describe('cloudbuild.yaml runtime identity', () => {
  it('declares _RUN_SA with an empty default, so nothing usable is inherited', () => {
    expect(cloudbuild).toMatch(/^\s*_RUN_SA:\s*''\s*$/m);
  });

  it('refuses to deploy, without calling gcloud, when _RUN_SA is empty', () => {
    const r = deploy({ ...SUBSTITUTIONS, _RUN_SA: '' });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(GUARD_MESSAGE);
    expect(r.ran).toBe(false);
  });

  it('runs the service as the named account, with ingress locked to the load balancer', () => {
    const r = deploy(SUBSTITUTIONS);
    expect(r.status, r.stderr).toBe(0);
    expect(r.args).toContain(`--service-account=${PRODUCTION_SA}`);
    expect(r.args).toContain('--ingress=internal-and-cloud-load-balancing');
  });

  it('names the account on a staging deploy too', () => {
    const r = deploy({
      ...SUBSTITUTIONS,
      _SERVICE: 'service-staging',
      _APP_ENV: 'staging',
      _RUN_SA: STAGING_SA,
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.args).toContain(`--service-account=${STAGING_SA}`);
    expect(r.args).toContain('--ingress=internal-and-cloud-load-balancing');
  });
});

describe('ci-cd.yml runtime identity', () => {
  const select = (() => {
    const start = workflow.indexOf('Select environment from branch');
    const end = workflow.indexOf('- uses:', start);
    expect(start).toBeGreaterThan(-1);
    return workflow.slice(start, end);
  })();

  it('picks the staging account on dev and the production account otherwise', () => {
    const [devBranch, otherwise] = select.split(/^\s*else\s*$/m);
    expect(devBranch).toContain(`echo "run_sa=${STAGING_SA}" >> "$GITHUB_OUTPUT"`);
    expect(otherwise).toContain(`echo "run_sa=${PRODUCTION_SA}" >> "$GITHUB_OUTPUT"`);
  });

  it('passes the chosen account to the build', () => {
    expect(workflow).toContain('_RUN_SA=${{ steps.target.outputs.run_sa }}');
  });
});

describe('DEPLOY.md', () => {
  it('passes _RUN_SA in every gcloud builds submit it documents', () => {
    // Only fenced code counts: prose that names the command is not a command.
    const blocks = [...deployDoc.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1]);
    const submits = blocks.filter((block) => block.includes('gcloud builds submit'));
    expect(submits.length).toBeGreaterThan(0);
    for (const block of submits) expect(block).toContain('_RUN_SA=');
  });
});

describe('deploy paths', () => {
  it('ships no manual deploy script', () => {
    expect(existsSync(join(repoRoot, 'scripts/deploy.sh'))).toBe(false);
  });
});
