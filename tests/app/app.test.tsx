import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/web/App';
import { Mark } from '../../src/web/Logo';
import { page } from '../../src/web/copy';

const html = renderToString(<App />);

/** Every sentence the page says, as written rather than as escaped markup. */
const prose = [
  page.headline,
  page.claim,
  page.place,
  page.contact.lead,
  ...page.work.flatMap((item) => [item.title, item.line]),
];

describe('the homepage', () => {
  it('carries the name lowercase, the headline and the claim', () => {
    expect(html).toContain('>snackbyte<');
    expect(html).not.toContain('Snackbyte');
    expect(html).toContain(page.headline);
    expect(html).toContain('Bishop, California');
  });

  it('says nothing that goes stale on its own', () => {
    // Read the copy rather than the markup: the mark's path data is full of digits and
    // would make a year check meaningless.
    for (const sentence of prose) {
      expect(sentence).not.toMatch(/coming soon/i);
      expect(sentence).not.toMatch(/\b(19|20)\d\d\b/);
      expect(sentence).not.toMatch(/\b(now|currently|recently|soon|this year)\b/i);
    }
  });

  it('shows three pieces of work, none of them a link', () => {
    expect(page.work).toHaveLength(3);
    // Compare against the copy: React escapes apostrophes in the rendered markup.
    for (const item of page.work) {
      expect(prose).toContain(item.title);
      expect(item.line.length).toBeGreaterThan(0);
    }
    // the contact address is the only link on the page
    expect([...html.matchAll(/<a\b/g)]).toHaveLength(1);
  });

  it('spans more than one kind of client', () => {
    const kinds = [/school|program/i, /wedding|videographer|film/i, /theatre|community/i];
    for (const kind of kinds) {
      expect(page.work.some((item) => kind.test(item.title))).toBe(true);
    }
  });

  it('names no client', () => {
    for (const client of ['Playhouse', '395', 'MCDS', 'forte', 'Tonic', 'StoryEngine']) {
      expect(prose.join(' ')).not.toContain(client);
    }
  });

  it('offers exactly one way to make contact, and collects nothing', () => {
    expect([...html.matchAll(/mailto:/g)]).toHaveLength(1);
    expect(html).toContain(`mailto:${page.contact.address}`);
    expect(html).not.toContain('<form');
    expect(html).not.toContain('<input');
  });
});

describe('the mark', () => {
  it('is eight cells, four ink then four sky, filled from the theme', () => {
    const svg = renderToString(<Mark />);
    const fills = [...svg.matchAll(/fill:var\(--(ink|sky)\)/g)].map((m) => m[1]);
    expect(fills).toEqual(['ink', 'ink', 'ink', 'ink', 'sky', 'sky', 'sky', 'sky']);
  });
});
