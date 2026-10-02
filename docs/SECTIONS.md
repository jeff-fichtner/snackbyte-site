# Client sections

A **section** is a self-contained set of pages for one client, living under
`src/web/public/work/<slug>/`. It exists so that work done in another repo — often
by an agent that never opens this one — can be published on this site without
touching the app.

Sections are **not linked from the homepage** and are marked `noindex`. They are
reached by direct URL and shared deliberately.

```
src/web/public/work/playhouse-395/
  section.json           the manifest — you write this
  index.html             GENERATED from section.json — never hand-edit
  roadmap/index.html     a page — you write this
```

## The contract for an outside contributor

1. **Write only inside your own section directory.** Not `src/`, not `config/`,
   not `scripts/`, not another client's folder. If your change needs anything
   outside that directory, it is a change to the site and belongs to whoever owns
   the site — raise it, don't reach in.
2. **Pages are complete, standalone HTML documents.** Own `<style>`, own script,
   no build step, no imports from the app, no shared stylesheet. They are copied
   verbatim into `dist/` by Vite, so what you write is what ships.
   Start each page with the section's name linking back to its landing page —
   `<a href="../">Playhouse 395</a>` in the top line — so a reader who arrives on one page
   can find the rest.
3. **Every section needs a `section.json`.** Without one the section has no
   landing page and nothing links its pages together.
4. **Never write `index.html` at the section root.** `scripts/build-sections.mjs`
   generates it from the manifest on every build, so a hand-written one is
   overwritten. This is deliberate: it keeps every client section navigating the
   same way without any contributor writing that markup.
5. **Sections are prettier-ignored** (`../src/web/public/**` in
   `config/.prettierignore`). Do not format them; a generator's output would
   fight the formatter on every regeneration.

## The manifest

```json
{
  "title": "Playhouse 395",
  "blurb": "One or two sentences. Shown under the heading.",
  "pages": [
    {
      "path": "roadmap",
      "title": "Schedule Map",
      "blurb": "One line describing the page.",
      "status": "Proposal",
      "locked": true
    },
    {
      "url": "https://rehearsal.playhouse395.com/",
      "title": "Matilda Call Board",
      "blurb": "One line describing where this goes.",
      "status": "Live"
    }
  ]
}
```

Every page names **exactly one** of `path` or `url`, and the build throws if it
names neither or both.

- `path` — a directory in the section containing `index.html`.
- `url` — an absolute URL. The card links straight there. Use it for work that
  has outgrown the section and now runs on its own host: the card gets a small
  `↗` and the reader lands on the real thing in one click. **Do not leave a
  stub page behind that redirects** — an interstitial that bounces is a page
  that can be bookmarked, cached, and shared, and it is slower than the link it
  replaces. Delete the directory and give the entry a `url`.

`new` (optional, `true` or `false`) lifts a page out of the list into a **New** block at the
top of the section's landing page, as a larger card; the rest follow under "Everything else".
With nothing marked new, the landing page is the plain list. Nothing expires on its own: take
the flag off when the page is no longer news. Anything other than a real boolean fails the build.

`image` (optional) is the picture on a new page's card — a path relative to the section, such as
`sound-system/photos/console.jpg`. It must stay inside the section folder and the file must
exist, or the build fails naming the page.

`status` is free text — it is a label, not an enum. `locked` is optional and only
adds a badge; it does not enforce anything. **If a page needs protecting, the
page protects itself** — the site serves static files and has no auth.

## Publishing from another repo

The contributing repo owns a script that writes into this one. It takes this
repo's path as a required argument rather than defaulting, so a wrong path fails
where you can see it instead of writing files somewhere unnoticed.

```bash
node scripts/publish-to-site.mjs /path/to/snackbyte-site
cd /path/to/snackbyte-site && npm run check:all && npm run build
```

Run the gate from this repo after publishing. A section cannot break typecheck or
lint — it is not app source — but it can break the build if a manifest is
malformed, and that is worth catching before a deploy.

## Pages that hold personal data

Several of these pages exist to show a schedule to the people on it. That means
real names, real times, a real place, and often minors. Two rules:

- **Abbreviate.** First name and last initial is enough for someone to find
  themselves, and is a materially different thing to publish than a full name.
- **If it is gated, encrypt it — don't hide it.** A password check in JavaScript
  over plaintext is not a gate; the content is one view-source away. Ship
  ciphertext and derive the key from the passphrase in the browser.
