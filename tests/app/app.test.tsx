import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/web/App';
import { Mark } from '../../src/web/Logo';
import { page } from '../../src/web/copy';

const html = renderToString(<App />);

/** Every sentence the page says, as written rather than as escaped markup. */
const prose = [page.headline, page.claim, page.based, page.contact.lead];

describe('the homepage', () => {
  it('carries the name lowercase, the headline and the claim', () => {
    expect(html).toContain('>snackbyte<');
    expect(html).not.toContain('Snackbyte');
    expect(html).toContain(page.headline);
    expect(html).toContain('Based in Bishop, California');
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

  it('states the address as the second sentence of the claim, at the same weight', () => {
    expect(html).toContain(`<p class="claim">${page.claim} ${page.based}</p>`);
    expect(html).not.toContain('class="based"');
  });

  it('places snackbyte without limiting it to that place', () => {
    // Bishop is the address, not the market: the work goes wherever it is wanted.
    expect(page.based).toMatch(/based in/i);
    expect(page.claim).not.toMatch(/bishop/i);
    expect(page.claim).not.toMatch(/\b(local|nearby|in the area|around)\b/i);
  });

  it('claims nothing that is not a real client', () => {
    // "a theatre, a crew, a shop" once ended this sentence; there is no shop. Anything
    // that sounds like an example has to be one.
    expect(page.claim).not.toMatch(/\ba shop\b/);
    expect(page.claim).not.toMatch(/—[^—]*,[^—]*,[^—]*—/); // a rule-of-three aside
  });

  it('ends on the one thing it asks for', () => {
    // No footer: the address is in the opening, and a legal-name line was neither the
    // brand nor the legal name. The last thing on the page is the contact.
    expect(html).not.toContain('<footer');
    expect(html.trimEnd().endsWith('</a></p></section></main>')).toBe(true);
  });

  it('names no client', () => {
    for (const client of ['Playhouse', '395', 'MCDS', 'forte', 'Tonic', 'StoryEngine']) {
      expect(prose.join(' ')).not.toContain(client);
    }
  });

  it('offers exactly one way to make contact, and collects nothing', () => {
    expect([...html.matchAll(/mailto:/g)]).toHaveLength(1);
    expect(html).toContain(`mailto:${page.contact.address}`);
    // the contact address is the only link on the page
    expect([...html.matchAll(/<a\b/g)]).toHaveLength(1);
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
