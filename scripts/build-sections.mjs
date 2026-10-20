/**
 * Generates the landing page for each client section under src/web/public/work/.
 *
 * A section is a self-contained folder owned by whoever is doing that client's work —
 * often an agent in a different repo. It contributes standalone pages plus a
 * section.json; this script renders the index that ties them together, so every
 * section navigates the same way without any contributor writing that markup.
 *
 * Sections are NOT linked from the homepage. They are reached by direct URL.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORK_DIR = fileURLToPath(new URL('../src/web/public/work/', import.meta.url));

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

/**
 * Where a card points. A page either lives in the section (`path`, a directory
 * holding index.html) or somewhere else entirely (`url`, an absolute URL) — a
 * section can list work that has outgrown it and now runs on its own host.
 *
 * Exactly one of the two, and it throws otherwise: a manifest that says neither
 * would silently render a card linking to nowhere, and one that says both leaves
 * the reader guessing which one the build honoured.
 */
function href(page) {
  const hasPath = Boolean(page.path);
  const hasUrl = Boolean(page.url);
  if (hasPath === hasUrl) {
    throw new Error(
      `section page "${page.title ?? '(untitled)'}" needs exactly one of "path" or "url"` +
        (hasPath ? ' — it has both' : ' — it has neither'),
    );
  }
  return hasUrl ? page.url : `${page.path}/`;
}

const nameOf = (page) => `section page "${page.title ?? '(untitled)'}"`;

/**
 * Whether a page is flagged new. Only a real boolean counts: a manifest saying "yes" or 1 is
 * a typo or a misunderstanding, and quietly reading it either way would hide that.
 */
function isNew(page) {
  if (page.new === undefined) return false;
  if (typeof page.new !== 'boolean') {
    throw new Error(`${nameOf(page)} has new: ${JSON.stringify(page.new)} — use true or false`);
  }
  return page.new;
}

/**
 * A page's preview image, or null when it has none. The path is relative to the section and
 * must stay inside it: a section only owns its own folder, and the build checks the file exists.
 */
function imageOf(page) {
  if (page.image === undefined) return null;
  const img = String(page.image);
  const escapes =
    !img ||
    img.startsWith('/') ||
    /^[a-z][a-z0-9+.-]*:/i.test(img) ||
    img.split('/').includes('..');
  if (escapes) {
    throw new Error(`${nameOf(page)} has image "${img}" — it must be a path inside the section`);
  }
  return img;
}

const extMark = (p) =>
  p.url ? '<span class="ext" aria-label="Opens another site">&#8599;</span>' : '';
const lockMark = (p) =>
  p.locked ? '<span class="lock" title="Password protected">Password</span>' : '';
const linkAttrs = (p) => `href="${esc(href(p))}"${p.url ? ' rel="noopener"' : ''}`;

/** The ordinary card: one block per page in the list. */
const card = (p) => `      <a class="link" ${linkAttrs(p)}>
        <span class="row"><span class="title">${esc(p.title)}</span>${extMark(p)}${lockMark(p)}</span>
        <span class="meta">${esc(p.blurb)}</span>
        <span class="status">${esc(p.status)}</span>
      </a>`;

/** A new page gets a larger card, with its picture when it has one. */
const feature = (p) => {
  const img = imageOf(p);
  return `        <a class="link" ${linkAttrs(p)}>${
    img ? `\n          <span class="pic"><img src="${esc(img)}" alt="" loading="lazy"></span>` : ''
  }
          <span class="row"><span class="badge">New</span>${extMark(p)}${lockMark(p)}</span>
          <span class="title">${esc(p.title)}</span>
          <span class="meta">${esc(p.blurb)}</span>
          <span class="status">${esc(p.status)}</span>
        </a>`;
};

/**
 * Renders one section's index.html from its manifest. It is a hosted page like any other: it
 * links the page kit and is built only from the kit's components, so it has no style of its
 * own to drift.
 */
export function renderSection(section) {
  for (const p of section.pages) imageOf(p);
  const fresh = section.pages.filter(isNew);
  const rest = section.pages.filter((p) => !isNew(p));

  // With nothing new the page is the plain list it has always been. With something new, the
  // new pages lead in their own block and the rest follow under a label of their own.
  const body = fresh.length
    ? `    <section class="fresh" aria-labelledby="fresh-h">
      <h2 class="label" id="fresh-h">New</h2>
      <div class="links big">
${fresh.map(feature).join('\n')}
      </div>
    </section>${
      rest.length
        ? `
    <section aria-labelledby="rest-h">
      <h2 class="label" id="rest-h">Everything else</h2>
      <div class="links">
${rest.map(card).join('\n')}
      </div>
    </section>`
        : ''
    }`
    : `    <div class="links">
${rest.map(card).join('\n')}
    </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(section.title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/kit/page.css">
</head>
<body>
  <main class="page">
    <header>
      <div class="crumb">snackbyte &middot; client work</div>
      <h1>${esc(section.title)}</h1>
      <p class="lede">${esc(section.blurb)}</p>
    </header>
${body}
    <footer><p>Working documents, shared by link. Not listed publicly.</p><a class="wordmark" href="/">snackbyte</a></footer>
  </main>
</body>
</html>
`;
}

/** Writes index.html for every section that has a manifest. Returns the slugs built. */
export function buildSections(workDir = WORK_DIR) {
  if (!existsSync(workDir)) return [];
  const built = [];
  for (const slug of readdirSync(workDir)) {
    const dir = join(workDir, slug);
    if (!statSync(dir).isDirectory()) continue;
    const manifest = join(dir, 'section.json');
    if (!existsSync(manifest)) continue;
    const section = JSON.parse(readFileSync(manifest, 'utf8'));
    const html = renderSection(section);
    // A picture the manifest names but the folder lacks would ship as a broken image on the
    // landing page; stop the build and say which one instead.
    for (const page of section.pages) {
      if (page.image !== undefined && !existsSync(join(dir, page.image))) {
        throw new Error(
          `section "${slug}": page "${page.title}" names image "${page.image}", which is not there`,
        );
      }
    }
    writeFileSync(join(dir, 'index.html'), html);
    built.push(slug);
  }
  return built;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const built = buildSections();
  console.log(built.length ? `sections: ${built.join(', ')}` : 'sections: none');
}
