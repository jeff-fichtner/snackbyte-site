// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as brand from '@snackbyte/brand';
// @ts-expect-error — plain JS build script, no types
import { renderStyle, inWords } from '../../scripts/build-style.mjs';

// /style is generated from a template that holds no brand value, so it cannot drift from the
// brand: these tests pin that every value on it is the package's.

const TEMPLATE = readFileSync(join(process.cwd(), 'src/web/style/page.html'), 'utf8');
const page: string = renderStyle(TEMPLATE);
const roles = Object.keys(brand.color).filter((k) => k !== '_') as (keyof typeof brand.color)[];
const role = (r: (typeof roles)[number]) =>
  brand.color[r] as {
    day: string;
    night: string;
    name: { day: string; night: string };
    use: string;
  };

describe('the /style page', () => {
  it('fills every placeholder', () => {
    expect(page).not.toContain('%brand:');
  });

  it('says what the brand says now: the headline, the subhead, the faces and the version', () => {
    expect(page).toContain(brand.copy.headline);
    expect(page).toContain(brand.copy.subhead);
    for (const face of ['bricolage', 'inter', 'sourceSerif'] as const) {
      expect(page).toContain(brand.type.families[face].family);
    }
    expect(page).toContain(`guide v${brand.version}`);
    const { regular, strong } = brand.type.text.weights;
    expect(page).toContain(`${brand.type.families.inter.family}, ${regular} and ${strong}`);
    expect(page).toContain(`Headline, ${brand.type.headline.weight}`);
  });

  it('sets each face from the brand: the headline cut by class, the legal face by data-face', () => {
    expect(page).toMatch(/<span class="d headline">/);
    expect(page).toMatch(/<span class="l" data-face="legal">/);
  });

  it('shows every colour role with its day and night values, and names that say more', () => {
    // A colour named for its role (Sky, Rule) shows its value alone; the name would repeat it.
    const shown = (r: string, name: string, hex: string) =>
      name.toLowerCase() === r.split('-')[0] ? `>${hex}<` : `${name} ${hex}`;
    for (const r of roles) {
      const c = role(r);
      expect(page, r).toContain(shown(r, c.name.day, c.day));
      expect(page, r).toContain(shown(r, c.name.night, c.night));
    }
  });

  it('puts each theme on a class, for the day and night samples', () => {
    for (const theme of ['day', 'night'] as const) {
      const block = page.match(new RegExp(`\\.${theme} \\{([^}]*)\\}`))?.[1] ?? '';
      for (const r of roles) expect(block, `${theme} ${r}`).toContain(`--${r}: ${role(r)[theme]};`);
    }
  });

  it('draws the mark from the package’s own paths', () => {
    for (const shape of [...brand.marks.row.shapes, ...brand.marks.stack.shapes]) {
      expect(page).toContain(`d="${shape.d}"`);
    }
  });

  it('measures the construction drawing with the geometry', () => {
    const { cell, gap, seam, bite } = brand.geometry;
    for (const n of [cell, gap, seam]) expect(page).toContain(`text-anchor="middle">${n}</text>`);
    expect(page).toContain(`>r ${bite.r}</text>`);
    expect(page).toContain(`Cells of ${inWords(cell)}, gaps of ${inWords(gap)}`);
  });

  it('shows every type step and space step', () => {
    brand.type.scale.steps.forEach((px, i) => expect(page).toContain(`--type-${i} · ${px}px`));
    for (const [name, px] of Object.entries(brand.space.steps)) {
      expect(page).toContain(`--${name} · ${px}px`);
    }
  });
});

describe('renderStyle', () => {
  it('fails on a placeholder the brand has no value for, naming it', () => {
    expect(() => renderStyle('%brand:color.nowhere.day%')).toThrow(/%brand:color\.nowhere\.day%/);
    expect(() => renderStyle('%brand:@nowhere%')).toThrow(/no such block/);
    expect(() => renderStyle('%brand:color.ground%')).toThrow(/no value there/);
  });

  it('writes small numbers in words, and refuses to guess past twenty', () => {
    expect(renderStyle('%brand:geometry.cell|Word% wide')).toBe(
      `${inWords(brand.geometry.cell)[0].toUpperCase()}${inWords(brand.geometry.cell).slice(1)} wide`,
    );
    expect(inWords(10)).toBe('ten');
    expect(() => inWords(21)).toThrow(/no word/);
  });
});
