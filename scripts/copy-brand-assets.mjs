/**
 * Places the site's favicons and social card into public/ from the brand package, so the
 * frontend build ships them at the root without a second copy living in git.
 *
 * It also writes /kit/page.css, the one stylesheet a hosted page links: the brand's faces,
 * tokens and base rules from the package, then the site's page kit (src/web/kit/page.css),
 * with the faces' files beside it in /kit/fonts/. Hosted pages are copied verbatim by the
 * build, so they can't import the package the way the app does.
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
 * The faces' files, from the package to /kit/fonts/: fonts.css names them by relative url(),
 * so they sit beside the stylesheet that inlines it. Licences go with them.
 */
export function kitFonts() {
  return readdirSync(from('fonts')).map((name) => [from(`fonts/${name}`), `kit/fonts/${name}`]);
}

/**
 * The faces, the tokens, the base rules and the kit, in that order: the kit comes last
 * because it builds on the rest. The tokens and base rules sit in the `brand` layer, which
 * the kit reverts inside an exhibit, so a client's design renders as it was made.
 */
export function kitStylesheet() {
  return [
    readFileSync(from('fonts.css'), 'utf8'),
    '@layer brand {',
    readFileSync(from('tokens.css'), 'utf8'),
    readFileSync(from('base.css'), 'utf8'),
    '}',
    readFileSync(KIT, 'utf8'),
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [src, dest] of FILES) copyFileSync(from(src), to(dest));
  for (const [src, dest] of kitFonts()) {
    mkdirSync(dirname(to(dest)), { recursive: true });
    copyFileSync(src, to(dest));
  }
  writeFileSync(to('kit/page.css'), kitStylesheet());
}
