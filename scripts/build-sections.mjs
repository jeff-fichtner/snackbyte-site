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

/** Renders one section's index.html from its manifest. */
export function renderSection(section) {
  const cards = section.pages
    .map(
      (p) => `      <a class="card" href="${esc(href(p))}"${p.url ? ' rel="noopener"' : ''}>
        <span class="row"><span class="t">${esc(p.title)}</span>${
          p.url ? '<span class="ext" aria-label="Opens another site">&#8599;</span>' : ''
        }${p.locked ? '<span class="lock" title="Password protected">Password</span>' : ''}</span>
        <span class="b">${esc(p.blurb)}</span>
        <span class="s">${esc(p.status)}</span>
      </a>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(section.title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
  :root{--bg:#F7F8FB;--surface:#fff;--ink:#14171C;--muted:#59636F;--faint:#8A94A2;--rule:#DEE2EA;--brand:#2E3192}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --bg:#0F1117;--surface:#181B24;--ink:#EAEDF3;--muted:#98A1B2;--faint:#6B7689;--rule:#262B37;--brand:#8E92E8}}
  :root[data-theme="dark"]{--bg:#0F1117;--surface:#181B24;--ink:#EAEDF3;--muted:#98A1B2;--faint:#6B7689;--rule:#262B37;--brand:#8E92E8}
  *{box-sizing:border-box}
  body{background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:16px;line-height:1.55;margin:0}
  .wrap{max-width:44rem;margin:0 auto;padding:4rem 1.25rem 6rem;display:flex;flex-direction:column;gap:2.5rem}
  .kicker{font-family:"IBM Plex Mono",monospace;font-size:.7rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--brand)}
  h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(2.2rem,6vw,3.2rem);line-height:1;margin:.5rem 0 0;letter-spacing:-.02em}
  .blurb{color:var(--muted);margin:.9rem 0 0;max-width:36rem}
  .cards{display:flex;flex-direction:column;gap:.7rem}
  .card{display:flex;flex-direction:column;gap:.3rem;padding:1.1rem 1.2rem;background:var(--surface);
    border:1px solid var(--rule);border-radius:4px;text-decoration:none;color:inherit;transition:border-color .12s,transform .12s}
  .card:hover{border-color:var(--brand);transform:translateY(-1px)}
  .card:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
  .row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
  .t{font-family:Fraunces,Georgia,serif;font-size:1.25rem;font-weight:600;letter-spacing:-.01em}
  .lock{font-family:"IBM Plex Mono",monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;
    color:var(--faint);border:1px solid var(--rule);border-radius:2px;padding:.1rem .35rem}
  .ext{color:var(--faint);font-size:.9rem;line-height:1;margin-left:-.25rem}
  .card:hover .ext{color:var(--brand)}
  .b{color:var(--muted);font-size:.92rem}
  .s{font-family:"IBM Plex Mono",monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);margin-top:.35rem}
  footer{border-top:1px solid var(--rule);padding-top:1.1rem;font-size:.82rem;color:var(--faint)}
  @media (prefers-reduced-motion:reduce){.card{transition:none}}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="kicker">Snackbyte &middot; client work</div>
      <h1>${esc(section.title)}</h1>
      <p class="blurb">${esc(section.blurb)}</p>
    </header>
    <div class="cards">
${cards}
    </div>
    <footer>Working documents, shared by link. Not listed publicly.</footer>
  </div>
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
    writeFileSync(join(dir, 'index.html'), renderSection(section));
    built.push(slug);
  }
  return built;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const built = buildSections();
  console.log(built.length ? `sections: ${built.join(', ')}` : 'sections: none');
}
