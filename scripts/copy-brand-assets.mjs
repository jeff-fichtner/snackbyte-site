/**
 * Places the site's favicons and social card into public/ from the generated brand assets,
 * so the frontend build ships them at the root without a second copy living in git. Same pattern as the
 * section landing pages: generated into public/ at build time, ignored by git.
 */
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = (p) => fileURLToPath(new URL(`../brand/${p}`, import.meta.url));
const to = (p) => fileURLToPath(new URL(`../src/web/public/${p}`, import.meta.url));

const FILES = [
  ['tile.svg', 'favicon.svg'], // follows the OS theme
  ['favicon/day/favicon.ico', 'favicon.ico'],
  ['favicon/day/apple-touch-icon-180.png', 'apple-touch-icon.png'],
  ['png/social-square-night.png', 'social.png'], // the Open Graph card: square, so previews stay compact
];

for (const [src, dest] of FILES) copyFileSync(from(src), to(dest));
