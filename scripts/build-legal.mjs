/**
 * Generates /privacy and /terms from their words.
 *
 * Each page's text is a markdown file in src/web/legal/, which is what the owner reads and
 * approves; the page around it is src/web/legal/page.html, which links the page kit and holds
 * no brand value. A source must open with its title and, under it, the date its text last
 * changed (`Last changed October 21, 2026.`); without that line the build fails, naming the
 * file, rather than publish a policy with no date on it.
 *
 * The output is written into src/web/public/ before Vite copies it, and is not committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { copy } from '@snackbyte/brand';

// From this file's path as a string: tests run under jsdom, whose URL a file path can't use.
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const TEMPLATE = resolve(ROOT, 'src/web/legal/page.html');

/**
 * The pages, by the name in their address, with the line a search result or a link preview
 * shows. The URLs are given to Google and never move. Each page's title is its source's
 * heading, after the name.
 */
const PAGES = {
  privacy: {
    description: `What ${copy.name} keeps when you use this site or sign in to its products with Google, for how long, and who sees it.`,
  },
  terms: {
    description: `The terms for using ${copy.name}’s products and this site.`,
  },
};

const MONTH =
  '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
const DATE_LINE = new RegExp(`^Last changed ${MONTH} [1-9]\\d?, \\d{4}\\.$`);

// Raw HTML in a source is shown as text, not run; quotes and apostrophes are set curly.
const md = new MarkdownIt({ html: false, typographer: true });

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

/** The source split into its title, its date line, and the blocks after them. */
function parse(name, markdown) {
  const lines = markdown.split(/\r?\n/);
  const filled = (from) => lines.findIndex((l, i) => i >= from && l.trim() !== '');
  const first = filled(0);
  const title = /^# (.+)$/.exec(first < 0 ? '' : lines[first]);
  if (!title) throw new Error(`${name}.md: the first line must be its title, "# …"`);
  const second = filled(first + 1);
  const dateLine = second < 0 ? '' : lines[second].trim();
  if (!DATE_LINE.test(dateLine)) {
    throw new Error(`${name}.md: no "Last changed <Month D, YYYY>." line under the title`);
  }
  const body = lines.slice(second + 1).join('\n');
  // The opening, then one block per "## " section.
  const blocks = body
    .split(/^(?=## )/m)
    .map((b) => b.trim())
    .filter(Boolean);
  return { heading: title[1].trim(), date: dateLine, blocks };
}

/** One page, from its name and its markdown. */
export function renderLegal(name, markdown, template = readFileSync(TEMPLATE, 'utf8')) {
  const page = PAGES[name];
  if (!page) throw new Error(`no legal page called "${name}": add it to PAGES in build-legal.mjs`);
  const { heading, date, blocks } = parse(name, markdown);
  const body = blocks
    .map((b) => `<section class="card">\n${md.render(b).trim()}\n</section>`)
    .join('\n');
  const values = {
    title: esc(`${copy.name} ${heading[0].toLowerCase()}${heading.slice(1)}`),
    description: esc(page.description),
    url: `https://snackbyte.io/${name}`,
    name: esc(copy.name),
    heading: md.renderInline(heading),
    date: esc(date),
    body,
  };
  // The template's void elements are written for the formatter; the page carries them plain.
  return template.replace(/ \/>/g, '>').replace(/%legal:([a-z]+)%/g, (whole, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`page.html: ${whole} has no value`);
    return values[key];
  });
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  for (const name of Object.keys(PAGES)) {
    const source = readFileSync(resolve(ROOT, `src/web/legal/${name}.md`), 'utf8');
    const out = resolve(ROOT, `src/web/public/${name}/index.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, renderLegal(name, source));
    console.log(`Rendered /${name}`);
  }
}
