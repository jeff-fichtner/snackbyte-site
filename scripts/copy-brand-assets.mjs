/**
 * Places the site's favicons and social card into public/ from the brand package, so the
 * frontend build ships them at the root without a second copy living in git.
 */
import { copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const brandDir = resolve(require.resolve('@snackbyte/brand/marks.json'), '..');
const from = (p) => resolve(brandDir, p);
const to = (p) => fileURLToPath(new URL(`../src/web/public/${p}`, import.meta.url));

const FILES = [
  ['tile.svg', 'favicon.svg'], // follows the OS theme
  ['favicon/day/favicon.ico', 'favicon.ico'],
  ['favicon/day/apple-touch-icon-180.png', 'apple-touch-icon.png'],
  ['png/social-square-night.png', 'social.png'], // the Open Graph card: square, so previews stay compact
];

for (const [src, dest] of FILES) copyFileSync(from(src), to(dest));
