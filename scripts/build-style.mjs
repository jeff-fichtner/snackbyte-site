/**
 * Generates /style, the readable preview of the brand, from @snackbyte/brand.
 *
 * The page's words and layout are a template, src/web/style/page.html, that holds no brand
 * value. Every value is filled from the package at build: a `%brand:<path>%` placeholder is a
 * value (`%brand:color.ground.day%`), `%brand:@<block>%` is a block drawn from several (the
 * palette, the mark's paths), and `|word` or `|Word` writes a number out in words. A
 * placeholder the brand has no value for fails the build, naming it, rather than shipping a
 * page with a hole in it.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as brand from '@snackbyte/brand';

// From this file's path as a string: tests run under jsdom, whose URL a file path can't use.
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const TEMPLATE = resolve(ROOT, 'src/web/style/page.html');
const OUT = resolve(ROOT, 'src/web/public/style/index.html');

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

/** A whole number from zero to twenty in words; anything else fails rather than guess. */
export function inWords(n) {
  if (!Number.isInteger(n) || n < 0 || n >= WORDS.length) {
    throw new Error(`no word for ${n}: write it as a number in the template`);
  }
  return WORDS[n];
}

/** The colour roles in the package's order, without its notes. */
const roles = (b) => Object.keys(b.color).filter((k) => k !== '_');

/** A role's name as a heading: sage-text is "Sage, for text". */
const roleTitle = (role) => {
  const [first, ...rest] = role.split('-');
  return first[0].toUpperCase() + first.slice(1) + (rest.length ? `, for ${rest.join(' ')}` : '');
};

/** Each theme's values on a class, so a day sample and a night sample can sit side by side. */
function themes(b) {
  const block = (theme) =>
    roles(b)
      .map((r) => `--${r}: ${b.color[r][theme]};`)
      .join(' ');
  return `.day { ${block('day')} }\n  .night { ${block('night')} }`;
}

/** The mark's forms as SVG symbols, drawn from the package's paths, filled by role. */
function marks(b) {
  const group = (id, mark) =>
    `<g id="${id}">${mark.shapes
      .map((s) => `<path d="${s.d}" style="fill:var(--${s.role})"/>`)
      .join('')}</g>`;
  const { size, radius, fill } = b.forms.tile;
  const { width, height } = b.marks.stack;
  return `<svg class="defs" aria-hidden="true" focusable="false"><defs>
    ${group('m-row', b.marks.row)}
    ${group('m-stack', b.marks.stack)}
    <g id="m-tile"><rect width="${size}" height="${size}" rx="${radius}" style="fill:var(--${fill})"/><g transform="translate(${(size - width) / 2} ${(size - height) / 2})"><use href="#m-stack"/></g></g>
  </defs></svg>`;
}

/** The construction drawing: the row, with its cell, gap, seam and bite measured on it. */
function construct(b) {
  const { cell, gap, seam, bite } = b.geometry;
  const cells = b.marks.row.shapes.length;
  const half = cells / 2;
  // Where cell i starts: a gap between cells, and the seam in place of one between the nibbles.
  const x = (i) => i * (cell + gap) + (i >= half ? seam - gap : 0);
  const end = x(cells - 1) + cell;
  const biteX = x(cells - 1) + bite.cx;
  const firstNibble = (x(0) + x(half - 1) + cell) / 2;
  const secondNibble = (x(half) + end) / 2;
  const seamAt = x(half - 1) + cell;
  const name = (role) => esc(b.color[role].name.day.toLowerCase());
  const label = `Construction of the mark: cells of ${inWords(cell)}, gaps of ${inWords(gap)}, a seam of ${inWords(seam)}, and a bite of radius ${inWords(bite.r)} at the last corner`;
  return `<svg viewBox="0 0 ${end + 29} 52" role="img" aria-label="${label}">
        <g transform="translate(8 14)" font-size="3.6">
          <use href="#m-row"/>
          <circle class="bite" cx="${biteX}" cy="${bite.cy}" r="${bite.r}"/>
          <path class="dim" d="M0 16 v3 M${cell} 16 v3 M0 17.5 h${cell}"/>
          <text x="${cell / 2}" y="24" text-anchor="middle">${cell}</text>
          <path class="dim" d="M${cell} 16 v3 M${cell + gap} 16 v3"/>
          <text x="${cell + gap / 2}" y="24" text-anchor="middle">${gap}</text>
          <path class="dim" d="M${seamAt} 16 v3 M${seamAt + seam} 16 v3 M${seamAt} 17.5 h${seam}"/>
          <text x="${seamAt + seam / 2}" y="24" text-anchor="middle">${seam}</text>
          <path class="dim" d="M${biteX} ${bite.cy} l6 -8"/>
          <text x="${biteX + 7}" y="${bite.cy - 9.5}">r ${bite.r}</text>
          <text x="${firstNibble}" y="32" text-anchor="middle">${name(b.forms.row.nibbles[0])}</text>
          <text x="${secondNibble}" y="32" text-anchor="middle">${name(b.forms.row.nibbles[1])}</text>
        </g>
      </svg>`;
}

/** One chip per role: day on the left, night on the right, the names, values and use below. */
function palette(b) {
  return roles(b)
    .map((r) => {
      const c = b.color[r];
      // A colour named for its role (Sky, Rule) shows only its value; the name would repeat it.
      const value = (name, hex) =>
        name.toLowerCase() === r.split('-')[0] ? hex : `${esc(name)} ${hex}`;
      return `      <div class="tok"><div class="chips"><i style="background:${c.day}"></i><i style="background:${c.night}"></i></div><div class="lbl"><b>${esc(roleTitle(r))}</b><small>${value(c.name.day, c.day)}<br>${value(c.name.night, c.night)}</small><div class="from">${esc(c.use)}</div></div></div>`;
    })
    .join('\n');
}

/** The type steps, each set at its own size, and the spacing steps drawn to length. */
function scale(b) {
  const type = b.type.scale.steps
    .map(
      (px, i) =>
        `      <div class="step"><span class="sample wordmark" style="font-size:var(--type-${i})">${esc(b.copy.name)}</span><small>--type-${i} · ${px}px</small></div>`,
    )
    .join('\n');
  const space = [['unit', b.space.unit], ...Object.entries(b.space.steps)]
    .map(
      ([name, px]) =>
        `      <div class="space"><i style="width:var(--${name})"></i><small>--${name} · ${px}px</small></div>`,
    )
    .join('\n');
  return `<div class="steps">\n${type}\n    </div>\n    <div class="spaces">\n${space}\n    </div>`;
}

const BLOCKS = {
  themes,
  marks,
  construct,
  palette,
  scale,
  roles: (b) => roles(b).length,
  cells: (b) => b.marks.row.shapes.length,
  nibble: (b) => b.marks.row.shapes.length / 2,
  // How far the bite's centre sits outside its cell: it is given in the cell's own coordinates.
  biteOutside: (b) => b.geometry.bite.cx - b.geometry.cell,
};

/** The value at a dotted path in the package, or undefined. */
const at = (b, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), b);

/** Fills every placeholder in the template from the brand. An unknown one fails, by name. */
export function renderStyle(template, b = brand) {
  return template.replace(
    /%brand:(@?)([\w.-]+)(?:\|(word|Word|lower))?%/g,
    (_, block, path, form) => {
      const name = `%brand:${block}${path}${form ? `|${form}` : ''}%`;
      let value;
      if (block) {
        if (!Object.hasOwn(BLOCKS, path)) throw new Error(`${name}: no such block`);
        value = BLOCKS[path](b);
      } else {
        value = at(b, path);
        if (value === undefined || (typeof value === 'object' && value !== null)) {
          throw new Error(`${name}: the brand has no value there`);
        }
      }
      if (form === 'word' || form === 'Word') {
        const word = inWords(Number(value));
        return form === 'Word' ? word[0].toUpperCase() + word.slice(1) : word;
      }
      if (form === 'lower') return esc(String(value).toLowerCase());
      return block ? String(value) : esc(value);
    },
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, renderStyle(readFileSync(TEMPLATE, 'utf8')));
  console.log(`style: generated from brand v${brand.version}`);
}
