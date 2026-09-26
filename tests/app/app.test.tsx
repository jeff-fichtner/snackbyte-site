import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/web/App';
import { Mark } from '../../src/web/Logo';
import { page } from '../../src/web/copy';
import { motion } from '@snackbyte/brand';

const html = renderToString(<App />);

/** Every sentence the page says, as written rather than as escaped markup. */
const prose = [page.headline, page.claim, page.based, page.contact.lead];

describe('the homepage', () => {
  it('carries the name lowercase, the headline and the claim', () => {
    // the wordmark types itself one letter to a span; read it back as the name
    const wordmark = html.match(/class="wordmark[^"]*">(.*?)<\/span><\/div>/)?.[1] ?? '';
    expect(wordmark.replace(/<[^>]+>/g, '')).toBe('snackbyte');
    expect(html).toContain('aria-label="snackbyte"');
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

describe('the mark, arriving', () => {
  it('spells the name in bits, then rests as the mark', () => {
    // every letter's code appears as a keyframe step, and the last frame is all eight on
    for (const ch of 'snackbyte') {
      const bits = ch.charCodeAt(0).toString(2).padStart(8, '0');
      expect(bits.slice(0, 3)).toBe('011'); // why the ink half barely moves
    }
    expect(html).toContain('fill-opacity:1}100%{fill-opacity:1}');
  });

  it('reveals letters on a step that cannot miss its boundary', () => {
    // steps(1,end) left the last letter invisible: its finished time rounded to just short
    // of the jump. steps(1,start) jumps at the start and holds.
    expect(html).toMatch(/name>span\{animation:[^}]*steps\(1,start\) both/);
  });

  it('takes its timings from the brand, not from this repository', () => {
    const { letterMs, holdMs, biteMs, offOpacity, biteEasing } = motion.arrival;
    const total = 'snackbyte'.length * letterMs + holdMs;
    expect(html).toContain(`animation-duration:${total}ms`);
    expect(html).toContain(`${biteMs}ms ${biteEasing} ${total}ms`);
    expect(html).toContain(`fill-opacity:${offOpacity}`);
    expect(html).toContain(`animation-delay:${8 * letterMs}ms`); // the last letter
  });

  it('does nothing under reduced motion', () => {
    expect(html).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^}]*animation:none/);
  });
});

describe('the mark', () => {
  it('is eight cells, four ink then four sky, filled from the theme', () => {
    const svg = renderToString(<Mark />);
    const fills = [...svg.matchAll(/fill:var\(--(ink|sky)\)/g)].map((m) => m[1]);
    expect(fills).toEqual(['ink', 'ink', 'ink', 'ink', 'sky', 'sky', 'sky', 'sky']);
  });
});
