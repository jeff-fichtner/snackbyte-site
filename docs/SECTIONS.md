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
  call-board/index.html  a page — you write this
```

## The contract for an outside contributor

1. **Write only inside your own section directory.** Not `src/`, not `config/`,
   not `scripts/`, not another client's folder. If your change needs anything
   outside that directory, it is a change to the site and belongs to whoever owns
   the site — raise it, don't reach in.
2. **Pages are complete, standalone HTML documents.** Own `<style>`, own script,
   no build step, no imports from the app, no shared stylesheet. They are copied
   verbatim into `dist/` by Vite, so what you write is what ships.
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
    }
  ]
}
```

`path` is a directory containing `index.html`. `status` is free text — it is a
label, not an enum. `locked` is optional and only adds a badge; it does not
enforce anything. **If a page needs protecting, the page protects itself** — the
site serves static files and has no auth.

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
