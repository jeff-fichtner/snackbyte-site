// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { copy } from '@snackbyte/brand';
// @ts-expect-error — plain JS build script, no types
import { renderLegal } from '../../scripts/build-legal.mjs';

// The privacy policy and the terms are given to Google by their URLs, so the pages must be
// there, readable and on the brand; the words are the owner's, approved as written.

const SAMPLE = [
  '# Privacy policy',
  '',
  'Last changed October 21, 2026.',
  '',
  'An opening paragraph.',
  '',
  '## A section',
  '',
  'What it says.',
  '',
  '## Another',
  '',
  '- one',
  '- two',
  '',
].join('\n');

describe('the legal page generator', () => {
  const page: string = renderLegal('privacy', SAMPLE);

  it('links the page kit and the favicon, and nothing else of its own', () => {
    expect(page).toContain('<link rel="stylesheet" href="/kit/page.css">');
    expect(page).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
    expect(page).not.toMatch(/<script/i);
    expect(page).not.toMatch(/<style/i);
    expect(page).not.toMatch(/\sstyle=/i);
  });

  it('names the page with the name lowercase, and points at its one address', () => {
    expect(page).toContain(`<title>${copy.name} privacy policy</title>`);
    expect(page).toContain('<link rel="canonical" href="https://snackbyte.io/privacy">');
    expect(page).toContain('<meta property="og:url" content="https://snackbyte.io/privacy">');
    expect(renderLegal('terms', SAMPLE.replace('Privacy policy', 'Terms of service'))).toContain(
      `<title>${copy.name} terms of service</title>`,
    );
  });

  it('is published, so nothing asks search engines to stay away', () => {
    expect(page).not.toMatch(/name="robots"/i);
  });

  it('makes the source title the one heading, with the date under it', () => {
    expect([...page.matchAll(/<h1>/g)]).toHaveLength(1);
    expect(page).toContain('<h1>Privacy policy</h1>');
    expect(page).toContain('<p class="lede">Last changed October 21, 2026.</p>');
  });

  it('puts the opening and each section in a block of its own', () => {
    expect([...page.matchAll(/<section class="card">/g)]).toHaveLength(3);
    expect(page).toContain('<h2>A section</h2>');
    expect(page).toContain('<li>two</li>');
  });

  it('signs the page with the wordmark, linked home', () => {
    expect(page).toContain(`<a class="wordmark" href="/">${copy.name}</a>`);
  });

  it('fills every placeholder', () => {
    expect(page).not.toContain('%legal:');
  });

  it('refuses a source with no date line under its title, naming the file', () => {
    const undated = SAMPLE.replace('Last changed October 21, 2026.\n\n', '');
    expect(() => renderLegal('privacy', undated)).toThrow(/privacy\.md.*Last changed/);
    const vague = SAMPLE.replace('October 21, 2026', 'recently');
    expect(() => renderLegal('privacy', vague)).toThrow(/privacy\.md.*Last changed/);
  });

  it('refuses a page it does not know', () => {
    expect(() => renderLegal('cookies', SAMPLE)).toThrow(/cookies/);
  });
});

// The words themselves. Whether each statement is true is checked against the fact register
// (specs/002-privacy-terms/facts.md) by a person; these guards hold what a rushed edit breaks
// quietly: the name, the voice, the addresses, and the promises the spec forbids.

const source = (name: string) =>
  readFileSync(join(process.cwd(), `src/web/legal/${name}.md`), 'utf8');

/** The words a reader sees: link targets and code spans left out. */
const prose = (md: string) => md.replace(/\]\([^)]*\)/g, ']').replace(/`[^`]*`/g, '');

/** Acronyms the policy and the terms need; any other word in capitals breaks the voice. */
const ACRONYMS = ['IP', 'ID', 'KMS', 'PKCE', 'SQL', 'LLC'];

function holdsTheVoice(name: string) {
  const text = prose(source(name));
  it('names the company once by its legal name, and is lowercase everywhere else', () => {
    expect([...text.matchAll(/Snackbyte LLC/g)]).toHaveLength(1);
    expect([...text.matchAll(/Snackbyte/g)]).toHaveLength(1);
  });
  it('writes no word in capitals but the acronyms it needs', () => {
    const shouting = [...text.matchAll(/\b[A-Z]{2,}\b/g)].map((m) => m[0]);
    expect(shouting.filter((w) => !ACRONYMS.includes(w))).toEqual([]);
  });
  it('raises its voice nowhere', () => {
    expect(text).not.toContain('!');
  });
}

describe('the privacy policy', () => {
  const text = prose(source('privacy'));
  holdsTheVoice('privacy');

  it('gives the privacy address and the security address', () => {
    expect(source('privacy')).toContain('privacy@snackbyte.io');
    expect(source('privacy')).toContain('security@snackbyte.io');
  });

  it('makes the three promises the owner approved', () => {
    expect(text).toMatch(/don['’]t sell/i);
    expect(text).toMatch(/advertising/i);
    expect(text).toMatch(/ask us to delete it, and we will/i);
    expect(text).toMatch(/this page changes first/i);
  });

  it('promises nothing that is not true yet, and says nothing it has no fact for', () => {
    expect(text).not.toMatch(/deleted? after (a|one) year/i);
    expect(text).not.toMatch(/\bchild(ren)?\b|\bminors?\b|\bunder 1[0-9]\b/i);
    expect(text).not.toMatch(/\bby hand\b|\bmanually\b/i);
  });

  it('says what is asked of Google, and that no password is kept', () => {
    expect(text).toMatch(/nothing else in your Google account/);
    expect(text).toMatch(/stores no passwords, ever/);
    expect(text).toMatch(/never your Google id/);
  });

  it('says the deleting of old sign-in records is not built', () => {
    expect(text).toMatch(/not built yet/);
  });
});

describe('the terms of service', () => {
  const text = prose(source('terms'));
  holdsTheVoice('terms');

  it('states the owner’s legal choices: California law, Inyo County, and the cap', () => {
    expect(text).toMatch(/California law/);
    expect(text).toMatch(/Inyo County/);
    expect(text).toMatch(/twelve months/);
    expect(text).toContain('$100');
  });

  it('gives the warranty and the liability limit each a heading of its own', () => {
    expect(source('terms')).toMatch(/^## No warranty$/m);
    expect(source('terms')).toMatch(/^## Limit of liability$/m);
  });

  it('promises no uptime, no refunds and no notice in advance', () => {
    expect(text).not.toMatch(/uptime|refund|advance notice|in advance|guarantee/i);
  });

  it('says where to report a security problem', () => {
    expect(source('terms')).toContain('security@snackbyte.io');
  });
});

describe('the privacy policy, about this site', () => {
  const site = /^## This site$([\s\S]*?)(?=^## )/m.exec(source('privacy'))?.[1] ?? '';

  it('comes before signing in, and says what the site keeps and for how long', () => {
    expect(source('privacy').indexOf('## This site')).toBeLessThan(
      source('privacy').indexOf('## Signing in with Google'),
    );
    expect(site).toMatch(/no cookies/);
    expect(site).toMatch(/no analytics/);
    expect(site).toMatch(/Google Fonts/);
    expect(site).toMatch(/30 days/);
  });
});
