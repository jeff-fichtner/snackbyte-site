# Research: Privacy policy and terms of service

Each decision with what was chosen, why, and what else was weighed.

## R1. Where the words live

- **Decision**: one markdown file per page, `src/web/legal/privacy.md` and
  `src/web/legal/terms.md`, rendered to HTML at build.
- **Rationale**: the owner approves the words, not the markup (FR-021); a markdown file
  is what he reads, and a later change shows as a plain diff of prose. Generating the page
  keeps one source (Principle II).
- **Alternatives**: hand-written HTML under `public/` like `/for/` pages — the words
  would sit inside markup, and an edit to a sentence would be an edit to a page; React
  pages prerendered like the homepage — the words would live in TSX, and two long
  documents would need components for nothing they do.

## R2. How the pages look

- **Decision**: the page kit, `/kit/page.css`, which every hosted page already links:
  `.page`, `.lede`, `.meta`, and the footer with the wordmark. No new class.
- **Rationale**: the kit exists to make plain HTML look like snackbyte, and these are
  plain HTML; no style needs writing (Principle I).
- **Alternatives**: the homepage's `app.css` — built for one screen with a lockup, not
  for reading at length.

## R3. Serving `/privacy` without a redirect

- **Decision**: explicit routes for `/privacy`, `/privacy/`, `/terms` and `/terms/`,
  registered before `express.static`, each sending the page's `index.html` with a 200.
- **Rationale**: `express.static` answers a directory requested without its slash with a
  301 to the slashed form. Google is given `https://snackbyte.io/privacy`; the route
  contract forbids redirects; and both forms must reach the page (spec, edge cases).
- **Alternatives**: `express.static` with `redirect: false` site-wide — would change how
  `/style`, `/work/` and `/for/` answer; generating `privacy.html` and serving with
  `extensions: ['html']` — the slashed form would 404.

## R4. Indexing and the canonical address

- **Decision**: no robots meta on either page; a `<link rel="canonical">` to the
  no-slash address. Staging is already `noindex` by header for every response.
- **Rationale**: these pages are published, not shared by hand (FR-003); two forms of one
  URL need one canonical.

## R5. The homepage link

- **Decision**: one line under the contact line, muted: `Privacy` and `Terms`, linking
  `/privacy` and `/terms`. The words live in `copy.ts`.
- **Rationale**: Google requires the homepage to link the privacy policy at the URL the
  consent screen names; on snackbyte.io the relative `/privacy` resolves to exactly
  `https://snackbyte.io/privacy`, and on staging it stays on staging. Placed after the
  contact line it reads as the page's foot, not as a claim about what snackbyte does.
- **Alternatives**: absolute `https://snackbyte.io/...` links — would send staging
  visitors to production; a footer component with more in it — nothing else belongs
  there.

## R6. The date each page carries

- **Decision**: written in the source's first lines as `Last changed <Month D, YYYY>.`,
  set to the day the text is approved for publication. A test requires the line.
- **Rationale**: the date is part of the text the owner approves (FR-018); deriving it
  from git would fail in the Docker build, which has no history.

## R7. Holding the words to the spec

- **Decision**: content guards in `tests/app/legal-pages.test.ts` over the two sources:
  both addresses present; `Snackbyte LLC` exactly once per page; `snackbyte` never
  capitalised otherwise; no word in capitals beyond a short list of acronyms; none of
  the forbidden promises (deletion after a year, children, uptime, refunds, advance
  notice); the date line present.
- **Rationale**: Principle VI says a rushed change breaks the voice quietly; these turn
  the spec's prohibitions into failing tests. Truth itself is checked against
  `facts.md`, by a person, at review.

## R8. Looking at it (Principle VII)

- **Decision**: headless Chrome screenshots of both pages and the homepage at 390 px and
  1280 px, by day and by night, from the production build served by the real server.
- **Rationale**: the constitution requires both themes and phone width; Chrome is
  installed on the build machine and needs no new dependency.
