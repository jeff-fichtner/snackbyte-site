/**
 * Cuts the brand assets from the geometry recorded in docs/BRAND.md.
 *
 * The four numbers (cell, gap, seam, bite) and the palette go in once, here; every
 * SVG and PNG under brand/ derives from them. The wordmark is outlined from the
 * Bricolage Grotesque variable font (weight 800, optical size 96) so the lockups are
 * self-contained wherever they go: a letterhead, a signature, a print shop. This
 * script is the future build step of the brand's own package.
 *
 *   npm run brand:assets
 *
 * The font is fetched once into .cache/fonts/ (gitignored). Outputs are committed.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';
import { Resvg } from '@resvg/resvg-js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = resolve(ROOT, 'brand');
const FONT_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf';
const FONT_PATH = resolve(ROOT, '.cache/fonts/BricolageGrotesque[opsz,wdth,wght].ttf');

// ---- the geometry, in one unit ------------------------------------------------
const CELL = 10; // every cell is CELL × CELL
const RADIUS = 2; // its corner radius
const GAP = 3; // between cells within a nibble
const SEAM = 7; // between the two nibbles, and between the rows of the stack
const BITE_R = 8; // a circle removed, centred (1, -1) from the last cell's top-right corner
const BITE_C = { x: CELL + 1, y: -1 }; // in the bitten cell's own coordinates

// ---- the palette --------------------------------------------------------------
const THEMES = {
  day: { ground: '#ECEDEA', ink: '#45423E', sky: '#38639A' },
  night: { ground: '#2A2724', ink: '#ECEDEA', sky: '#7FA7D3' },
};

// ---- the wordmark -------------------------------------------------------------
const WORD = 'snackbyte';
const VARIATION = { wght: 800, opsz: 96, wdth: 100 };
const TRACKING_EM = -0.045;

const r = (n) => Math.round(n * 1000) / 1000;

/** A plain cell as a path (a rounded rect), at (x, y). */
function cellPath(x, y) {
  const c = CELL;
  const k = RADIUS;
  return (
    `M${r(x + k)},${r(y)} h${c - 2 * k} a${k},${k} 0 0 1 ${k},${k} v${c - 2 * k} ` +
    `a${k},${k} 0 0 1 -${k},${k} h-${c - 2 * k} a${k},${k} 0 0 1 -${k},-${k} v-${c - 2 * k} ` +
    `a${k},${k} 0 0 1 ${k},-${k} z`
  );
}

/**
 * The bitten cell as an exact path: the rounded rect with the bite's arc cut in from
 * the top edge to the right edge. Computed, not masked, so it survives any SVG consumer.
 */
function bittenCellPath(x, y) {
  const c = CELL;
  const k = RADIUS;
  // where the bite circle crosses the top edge (y = 0) and the right edge (x = CELL)
  const dx = Math.sqrt(BITE_R ** 2 - BITE_C.y ** 2); // half-chord along the top edge
  const topX = BITE_C.x - dx;
  const dy = Math.sqrt(BITE_R ** 2 - (BITE_C.x - c) ** 2);
  const rightY = BITE_C.y + dy;
  return (
    `M${r(x + topX)},${r(y)} ` + // start where the bite meets the top edge
    `h-${r(topX - k)} a${k},${k} 0 0 0 -${k},${k} v${c - 2 * k} ` + // top-left corner, down the left
    `a${k},${k} 0 0 0 ${k},${k} h${c - 2 * k} a${k},${k} 0 0 0 ${k},-${k} ` + // along the bottom, bottom-right corner
    `v-${r(c - rightY)} ` + // up the right edge to the bite
    `A${BITE_R},${BITE_R} 0 0 0 ${r(x + topX)},${r(y)} z` // the bite, back to the start
  );
}

/** The row: four ink cells, the seam, four sky cells, the last one bitten. 105 × 10. */
function rowShapes(t) {
  const step = CELL + GAP;
  const xs = [0, 1, 2, 3].map((i) => i * step);
  const off = 3 * step + CELL + SEAM;
  const shapes = [];
  for (const x of xs) shapes.push({ d: cellPath(x, 0), fill: t.ink });
  for (let i = 0; i < 3; i++) shapes.push({ d: cellPath(off + xs[i], 0), fill: t.sky });
  shapes.push({ d: bittenCellPath(off + xs[3], 0), fill: t.sky });
  return { shapes, w: off + 3 * step + CELL, h: CELL };
}

/** The stack: sky over ink, the seam between the rows, the bite top right. 49 × 27. */
function stackShapes(t) {
  const step = CELL + GAP;
  const xs = [0, 1, 2, 3].map((i) => i * step);
  const y2 = CELL + SEAM;
  const shapes = [];
  for (let i = 0; i < 3; i++) shapes.push({ d: cellPath(xs[i], 0), fill: t.sky });
  shapes.push({ d: bittenCellPath(xs[3], 0), fill: t.sky });
  for (const x of xs) shapes.push({ d: cellPath(x, y2), fill: t.ink });
  return { shapes, w: 3 * step + CELL, h: y2 + CELL };
}

const pathsToSvg = (shapes, extra = '') =>
  shapes.map((s) => `  <path d="${s.d}" fill="${s.fill}"${extra}/>`).join('\n');

function svgDoc(w, h, body, { title } = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}"` +
    (title ? ` role="img" aria-label="${title}"` : '') +
    `>\n${body}\n</svg>\n`
  );
}

/** The tile: a square of the ground colour, corner 14, with the stack centred. 64 × 64. */
function tileSvg(t, { rounded = true } = {}) {
  const { shapes, w, h } = stackShapes(t);
  const S = 64;
  const tx = (S - w) / 2;
  const ty = (S - h) / 2;
  const corner = rounded ? ' rx="14"' : '';
  return svgDoc(
    S,
    S,
    `  <rect width="${S}" height="${S}"${corner} fill="${t.ground}"/>\n` +
      `  <g transform="translate(${r(tx)} ${r(ty)})">\n${pathsToSvg(shapes)}\n  </g>`,
    { title: 'Snackbyte' },
  );
}

/** The theme-following tile: one SVG whose colours flip under prefers-color-scheme. */
function tileThemedSvg() {
  const d = THEMES.day;
  const n = THEMES.night;
  const { shapes, w, h } = stackShapes({ ink: 'INK', sky: 'SKY', ground: 'GROUND' });
  const S = 64;
  const body =
    `  <style>\n    .t{fill:${d.ground}}.s{fill:${d.sky}}.g{fill:${d.ink}}\n` +
    `    @media (prefers-color-scheme: dark){.t{fill:${n.ground}}.s{fill:${n.sky}}.g{fill:${n.ink}}}\n  </style>\n` +
    `  <rect width="${S}" height="${S}" rx="14" class="t"/>\n` +
    `  <g transform="translate(${r((S - w) / 2)} ${r((S - h) / 2)})">\n` +
    shapes.map((s) => `    <path d="${s.d}" class="${s.fill === 'SKY' ? 's' : 'g'}"/>`).join('\n') +
    `\n  </g>`;
  return svgDoc(S, S, body, { title: 'Snackbyte' });
}

// ---- the wordmark, outlined ---------------------------------------------------
async function ensureFont() {
  if (existsSync(FONT_PATH)) return;
  mkdirSync(resolve(FONT_PATH, '..'), { recursive: true });
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status} ${FONT_URL}`);
  writeFileSync(FONT_PATH, Buffer.from(await res.arrayBuffer()));
}

/**
 * Lays out the wordmark at `size` px and returns its glyph paths (y down, origin at the
 * baseline's left advance origin) plus the ink bounds and the font's vertical metrics.
 */
function wordmark(size) {
  const font = fontkit.openSync(FONT_PATH).getVariation(VARIATION);
  const scale = size / font.unitsPerEm;
  const tracking = TRACKING_EM * size;
  const run = font.layout(WORD);
  let x = 0;
  const paths = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const gx = x + p.xOffset * scale;
    const gy = -p.yOffset * scale;
    const path = g.path.scale(scale, -scale).translate(gx, gy);
    const b = path.bbox;
    if (b.width > 0) {
      minX = Math.min(minX, b.minX);
      maxX = Math.max(maxX, b.maxX);
      minY = Math.min(minY, b.minY);
      maxY = Math.max(maxY, b.maxY);
    }
    paths.push(path.toSVG());
    x += p.xAdvance * scale + tracking;
  });
  return {
    d: paths.join(' '),
    ink: { minX, maxX, minY, maxY, width: maxX - minX },
    xHeight: (font.xHeight / font.unitsPerEm) * size,
    capHeight: (font.capHeight / font.unitsPerEm) * size,
  };
}

/** The name alone, outlined, cropped to its ink. */
function wordmarkSvg(t, size = 100) {
  const w = wordmark(size);
  const pad = size * 0.02;
  const W = w.ink.width + 2 * pad;
  const H = w.ink.maxY - w.ink.minY + 2 * pad;
  return svgDoc(
    W,
    H,
    `  <path transform="translate(${r(-w.ink.minX + pad)} ${r(-w.ink.minY + pad)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: 'snackbyte' },
  );
}

/**
 * Above: the row over the name, left edges aligned on ink, the row three quarters of
 * the name's width, the gap between them one seam.
 */
function lockupAboveSvg(t, size = 100) {
  const w = wordmark(size);
  const row = rowShapes(t);
  const unit = (0.75 * w.ink.width) / row.w;
  const rowH = row.h * unit;
  const gap = SEAM * unit;
  const pad = size * 0.04;
  const W = w.ink.width + 2 * pad;
  const H = rowH + gap + (w.ink.maxY - w.ink.minY) + 2 * pad;
  const wordY = pad + rowH + gap - w.ink.minY;
  return svgDoc(
    W,
    H,
    `  <g transform="translate(${r(pad)} ${r(pad)}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      `  <path transform="translate(${r(pad - w.ink.minX)} ${r(wordY)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: 'snackbyte' },
  );
}

/**
 * Beside: the row to the left of the name, standing on the baseline as tall as the
 * lowercase letters, one seam between them.
 */
function lockupBesideSvg(t, size = 100) {
  const w = wordmark(size);
  const row = rowShapes(t);
  const unit = w.xHeight / row.h;
  const rowW = row.w * unit;
  const gap = SEAM * unit;
  const pad = size * 0.04;
  const W = rowW + gap + w.ink.width + 2 * pad;
  const H = w.ink.maxY - w.ink.minY + 2 * pad;
  const baseline = pad - w.ink.minY;
  return svgDoc(
    W,
    H,
    `  <g transform="translate(${r(pad)} ${r(baseline - w.xHeight)}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      `  <path transform="translate(${r(pad + rowW + gap - w.ink.minX)} ${r(baseline)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: 'snackbyte' },
  );
}

// ---- raster -------------------------------------------------------------------
function png(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/** An .ico holding PNG-encoded images (every browser since IE has read these). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

// ---- write everything ---------------------------------------------------------
await ensureFont();
mkdirSync(OUT, { recursive: true });
const write = (rel, data) => {
  const p = join(OUT, rel);
  mkdirSync(resolve(p, '..'), { recursive: true });
  writeFileSync(p, data);
  console.log(`  ${rel}`);
};

for (const [name, t] of Object.entries(THEMES)) {
  const row = rowShapes(t);
  const stack = stackShapes(t);
  write(
    `mark-row-${name}.svg`,
    svgDoc(row.w, row.h, pathsToSvg(row.shapes), { title: 'Snackbyte' }),
  );
  write(
    `icon-stack-${name}.svg`,
    svgDoc(stack.w, stack.h, pathsToSvg(stack.shapes), { title: 'Snackbyte' }),
  );
  write(`tile-${name}.svg`, tileSvg(t));
  write(`wordmark-${name}.svg`, wordmarkSvg(t));
  const above = lockupAboveSvg(t);
  const beside = lockupBesideSvg(t);
  write(`lockup-above-${name}.svg`, above);
  write(`lockup-beside-${name}.svg`, beside);
  write(`png/lockup-above-${name}-1200.png`, png(above, 1200));
  write(`png/lockup-above-${name}-2400.png`, png(above, 2400));
  write(`png/lockup-beside-${name}-1200.png`, png(beside, 1200));
  write(`png/lockup-beside-${name}-2400.png`, png(beside, 2400));
  write(`png/mark-row-${name}-1200.png`, png(svgDoc(row.w, row.h, pathsToSvg(row.shapes)), 1200));

  // favicons and app icons from the tile
  const tile = tileSvg(t);
  const sizes = [16, 32, 48, 180, 192, 512];
  const rendered = Object.fromEntries(sizes.map((s) => [s, png(tile, s)]));
  write(`favicon/${name}/favicon-16.png`, rendered[16]);
  write(`favicon/${name}/favicon-32.png`, rendered[32]);
  write(`favicon/${name}/favicon-48.png`, rendered[48]);
  write(`favicon/${name}/apple-touch-icon-180.png`, rendered[180]);
  write(`favicon/${name}/icon-192.png`, rendered[192]);
  write(`favicon/${name}/icon-512.png`, rendered[512]);
  write(`favicon/${name}/icon-maskable-512.png`, png(tileSvg(t, { rounded: false }), 512));
  write(
    `favicon/${name}/favicon.ico`,
    ico([16, 32, 48].map((s) => ({ size: s, data: rendered[s] }))),
  );
}
write('tile.svg', tileThemedSvg());
console.log('done');
