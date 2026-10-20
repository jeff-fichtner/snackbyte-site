/**
 * Places the site's favicons and social card into public/ from the brand package, so the
 * frontend build ships them at the root without a second copy living in git.
 *
 * It also writes /kit/page.css, the one stylesheet a hosted page links: the brand's font,
 * tokens and base rules from the package, then the site's page kit (src/web/kit/page.css).
 * Hosted pages are copied verbatim by the build, so they can't import the package the way
 * the app does.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type } from '@snackbyte/brand';

const require = createRequire(import.meta.url);
const brandDir = resolve(require.resolve('@snackbyte/brand/marks.json'), '..');
const from = (p) => resolve(brandDir, p);
const to = (p) => fileURLToPath(new URL(`../src/web/public/${p}`, import.meta.url));
// From this file's path as a string: tests run under jsdom, whose URL a file path can't use.
const KIT = resolve(fileURLToPath(import.meta.url), '../../src/web/kit/page.css');

const FILES = [
  ['tile.svg', 'favicon.svg'], // follows the OS theme
  ['favicon/day/favicon.ico', 'favicon.ico'],
  ['favicon/day/apple-touch-icon-180.png', 'apple-touch-icon.png'],
  ['png/social-square-night.png', 'social.png'], // the Open Graph card: square, so previews stay compact
];

/**
 * The font, the tokens, the base rules and the kit, in that order. The font import comes
 * first because a browser ignores an @import that follows any other rule; the kit comes last
 * because it builds on the rest.
 */
export function kitStylesheet() {
  const font = `https://fonts.googleapis.com/css2?family=${type.googleFonts}&display=swap`;
  return [
    `@import url('${font}');`,
    readFileSync(from('tokens.css'), 'utf8'),
    readFileSync(from('base.css'), 'utf8'),
    readFileSync(KIT, 'utf8'),
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [src, dest] of FILES) copyFileSync(from(src), to(dest));
  mkdirSync(to('kit'), { recursive: true });
  writeFileSync(to('kit/page.css'), kitStylesheet());
}
