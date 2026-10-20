// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { type } from '@snackbyte/brand';
// @ts-expect-error — plain JS build script, no types
import { kitStylesheet } from '../../scripts/copy-brand-assets.mjs';
// @ts-expect-error — plain JS build script, no types
import { renderSection } from '../../scripts/build-sections.mjs';

// Every page this site hosts looks like snackbyte because it links the page kit and writes no
// colour, font or size of its own (constitution, Principle IV). These guards hold every hosted
// page to that, pages added later included.

// From the repository root, vitest's root.
const PUBLIC = join(process.cwd(), 'src/web/public');
const KIT = join(process.cwd(), 'src/web/kit/page.css');

/** Sections still on their own styles, each with what moves it. The list only shrinks. */
const NOT_YET = new Map([
  [
    'work/grimoire',
    'written by snackbyte-chat-automations’ publish script; moves in the next unit',
  ],
]);

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const rel = (file: string) => relative(PUBLIC, file);
/** A section's landing page is generated at build; it is checked from the generator below. */
const isLanding = (file: string) => /^work\/[^/]+\/index\.html$/.test(rel(file));
const notYet = (file: string) => [...NOT_YET.keys()].some((dir) => rel(file).startsWith(`${dir}/`));

const hosted = ['for', 'work']
  .flatMap((dir) => filesUnder(join(PUBLIC, dir)))
  .filter((f) => /\.(html|js|css)$/.test(f) && !isLanding(f) && !notYet(f));
const pages = hosted.filter((f) => f.endsWith('.html'));

/**
 * The page without its exhibits: every element whose class includes exhibit, with all it holds,
 * and every <style> or <link> marked data-exhibit. What is left is what must be on the kit.
 */
function withoutExhibits(html: string): string {
  let out = html
    .replace(/<style data-exhibit>[\s\S]*?<\/style>/g, '')
    .replace(/<link [^>]*\bdata-exhibit\b[^>]*>/g, '');
  const open = /<([a-z][a-z0-9]*)\b[^>]*\bclass="[^"]*\bexhibit\b[^"]*"[^>]*>/i;
  for (let m = open.exec(out); m; m = open.exec(out)) {
    const tag = m[1];
    const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    tags.lastIndex = m.index + m[0].length;
    let depth = 1;
    let end = -1;
    for (let t = tags.exec(out); t; t = tags.exec(out)) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) {
        end = t.index + t[0].length;
        break;
      }
    }
    if (end < 0) throw new Error(`an exhibit <${tag}> is never closed`);
    out = out.slice(0, m.index) + out.slice(end);
  }
  return out;
}

/**
 * Fails on anything a page should take from the kit instead: a colour written as hex, rgb() or
 * hsl(); a font, by name, by link or by its own font-family; a size off the brand's type scale;
 * or the all-caps labels the guide rules out.
 */
function expectOnTheKit(text: string, where: string, { sizes = /^var\(--type-\d\)$/ } = {}) {
  expect(text, where).not.toMatch(/#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/i);
  expect(text, where).not.toMatch(/\b(?:rgba?|hsla?)\(/i);
  expect(text, where).not.toContain(type.family);
  expect(text, where).not.toContain('fonts.googleapis.com');
  for (const [, value] of text.matchAll(/font-family:\s*([^;}"]+)/g)) {
    expect(value.trim(), `${where}: font-family`).toMatch(/^(?:var\(--font\)|inherit)$/);
  }
  for (const [, value] of text.matchAll(/font-size:\s*([^;}"]+)/g)) {
    expect(value.trim(), `${where}: font-size`).toMatch(sizes);
  }
  expect(text, where).not.toMatch(/text-transform:\s*uppercase/);
}

describe('every hosted page', () => {
  it('is found: the guards below are checking real pages', () => {
    expect(pages.map(rel)).toEqual(
      expect.arrayContaining([
        'for/jan/jet-lag/index.html',
        'work/playhouse-395/roadmap/index.html',
        'work/playhouse-395/sound-system/index.html',
      ]),
    );
  });

  it('links the page kit, once', () => {
    for (const page of pages) {
      const html = withoutExhibits(readFileSync(page, 'utf8'));
      const links = html.match(/<link rel="stylesheet"[^>]*>/g) ?? [];
      expect(links, rel(page)).toEqual(['<link rel="stylesheet" href="/kit/page.css">']);
    }
  });

  it('writes no colour, font or size of its own, outside its exhibits', () => {
    for (const file of hosted) {
      const text = readFileSync(file, 'utf8');
      expectOnTheKit(file.endsWith('.html') ? withoutExhibits(text) : text, rel(file));
    }
  });

  it('is shared by link, not listed', () => {
    for (const page of pages) {
      expect(readFileSync(page, 'utf8'), rel(page)).toContain(
        '<meta name="robots" content="noindex',
      );
    }
  });
});

describe('exhibits', () => {
  const page = `<link rel="stylesheet" href="/kit/page.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spectral" data-exhibit>
<style data-exhibit>.shot { color: #2E3192; font-family: Spectral; }</style>
<main class="page"><p>Ours.</p>
<div class="exhibit"><div class="shot" style="font-size: 13px"><div>Theirs, nested.</div></div></div>
<p>Ours again.</p></main>`;

  it('are the one place a page may carry its own colours and fonts', () => {
    expect(() => expectOnTheKit(page, 'raw')).toThrow();
    const rest = withoutExhibits(page);
    expectOnTheKit(rest, 'without exhibits');
    expect(rest).toContain('Ours again.');
    expect(rest).not.toContain('Theirs');
  });

  it('end where their element ends, nested elements included', () => {
    expect(() => withoutExhibits('<div class="exhibit"><div>open')).toThrow(/never closed/);
  });
});

describe('every section landing page', () => {
  const manifests = filesUnder(join(PUBLIC, 'work')).filter((f) => f.endsWith('/section.json'));

  it('is generated on the kit too', () => {
    expect(manifests.length).toBeGreaterThan(0);
    for (const manifest of manifests) {
      const html: string = renderSection(JSON.parse(readFileSync(manifest, 'utf8')));
      expect(html, rel(manifest)).toContain('<link rel="stylesheet" href="/kit/page.css">');
      expectOnTheKit(html, rel(manifest));
    }
  });
});

describe('the page kit', () => {
  it('is served as one stylesheet: the font, then the tokens, the base rules and the kit', () => {
    const css: string = kitStylesheet();
    expect(
      css.startsWith(
        `@import url('https://fonts.googleapis.com/css2?family=${type.googleFonts}&display=swap');`,
      ),
    ).toBe(true);
    const tokens = css.indexOf('--ground');
    const base = css.indexOf('.wordmark');
    const kit = css.indexOf('snackbyte page kit');
    expect(tokens).toBeGreaterThan(0);
    expect(base).toBeGreaterThan(tokens);
    expect(kit).toBeGreaterThan(base);
  });

  it('only arranges brand tokens', () => {
    // The kit alone may set a percentage: html.large moves the whole scale at once.
    expectOnTheKit(readFileSync(KIT, 'utf8'), 'src/web/kit/page.css', {
      sizes: /^var\(--type-\d\)$|^\d+(\.\d+)?%$/,
    });
  });
});
