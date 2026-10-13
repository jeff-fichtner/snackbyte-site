import { color, copy } from '@snackbyte/brand';
import { page } from './copy';

/**
 * What the pages' <head> has to carry as literal text. The browser's theme colour and a
 * link preview cannot read CSS or run the app, so these values are written into the HTML
 * at build instead — from the brand package and this page's copy, so neither HTML file
 * restates a brand value. In the HTML a value is written `%head:<key>%`.
 */
export const headValues = {
  name: copy.name,
  headline: copy.headline,
  description: `${page.claim} ${page.based}`,
  'not-found': page.notFound.line,
  'ground-day': color.ground.day,
  'ground-night': color.ground.night,
} satisfies Record<string, string>;

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Fills every `%head:<key>%` in a page. A key with no value fails the build, naming it. */
export function fillHead(html: string): string {
  return html.replace(/%head:([a-z-]+)%/g, (_, key: string) => {
    if (!Object.hasOwn(headValues, key)) {
      throw new Error(`%head:${key}% has no value — add it to headValues in src/web/head.ts`);
    }
    return escape(headValues[key as keyof typeof headValues]);
  });
}
