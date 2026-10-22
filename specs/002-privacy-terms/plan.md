# Implementation Plan: Privacy policy and terms of service

**Branch**: `002-privacy-terms` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-privacy-terms/spec.md`

## Summary

Two published pages, `/privacy` and `/terms`, whose words are the company's and must be
true on the day they go live, and a homepage that links them, because Google's brand
verification of the snackbyte OAuth client checks both.

The words are the feature. Each page's text is a markdown file the owner reads and
approves as written (`src/web/legal/privacy.md`, `src/web/legal/terms.md`). A generator
renders each into a standalone page on the page kit at build, the way `/style` is
generated from its template; the rendered HTML is build output and is not committed. The
server answers both addresses directly, with and without the trailing slash, ahead of
the static handler, whose directory redirect would otherwise turn `/privacy` into a 301.
The homepage gains one quiet line under the contact line that links both. Every factual
statement in the privacy policy is traced to its source in `facts.md`, beside this plan.

## Technical Context

**Language/Version**: TypeScript 6 and plain ES modules for build scripts, Node 24 LTS

**Primary Dependencies**: Express 5 (server), React 19 (homepage), `@snackbyte/brand`
(every brand value, through `/kit/page.css`), `markdown-it` (already a dev dependency,
used by `spec:html`; the Docker build stage installs dev dependencies, so it is present
when `npm run build` runs)

**Storage**: none. Neither page stores anything about a reader.

**Testing**: Vitest — generator unit tests, content guards over the two sources, the
homepage render test, and the server smoke test against the real built output

**Target Platform**: modern browsers, phone first; served from Cloud Run behind the load
balancer

**Project Type**: prerendered site with an Express server (`server` mode)

**Performance Goals**: each page is one HTML document plus the kit stylesheet and the
font; readable as delivered, with no script

**Constraints**: permanent URLs; 200 with no redirect at `/privacy`, `/privacy/`,
`/terms`, `/terms/`; no brand value in this repository; no `noindex` on production; the
owner approves the words before merge

**Scale/Scope**: two pages, about 900 and 700 words; one homepage line; one server route
block; one build step

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle | Check | Result |
| --- | --- | --- |
| I. Renders the brand, does not own it | Pages link `/kit/page.css` and write no colour, font or size; the homepage line is styled in `app.css` with tokens only | Pass |
| II. Derived, never hand-cut | The HTML is generated from the markdown at build and gitignored, like `/style`; the markdown is the one source | Pass |
| III. A conversation is not a record | The owner's decision and clarifications are in `spec.md`; every fact's source and date is in `facts.md` | Pass |
| IV. Sections are a contract with outsiders | Not a section, not `/for/`: site-owned pages. They link the kit, which gains no class; the kit's header comment widens to name them | Pass |
| V. Nothing is linked that is not finished | The homepage links pages the site owns, in the same change that finishes them; they are published, so indexable, unlike the shared-by-hand pages | Pass |
| VI. Every word ships in the voice | The texts follow the guide's § Voice; tests guard the name's case, the legal name's one place, and no capitals | Pass |
| VII. Proven in the built thing | Built, served by the real server, four routes and the homepage requested, both themes and phone width looked at (headless Chrome) | Pass (planned) |
| VIII. Hard rules by reference | No configuration added, so nothing to fail loud on; nothing user-facing named outside the brand; tests at every step | Pass |

**Development workflow**: a feature, so a spec; one unit, branch cut from `dev`, PR into
`dev`, the owner reviews and approves, the agent merges, then promotes `dev` to `main`
by fast-forward for production.

**Re-check after Phase 1**: the design adds no class to the kit, no configuration, no
dependency and no brand value. Still passes.

## Project Structure

### Documentation (this feature)

```text
specs/002-privacy-terms/
├── spec.md              # the decision, stories, requirements, clarifications
├── plan.md              # this file
├── research.md          # Phase 0: the decisions behind this design
├── data-model.md        # Phase 1: the two documents and the fact register
├── facts.md             # Phase 1: every statement in the privacy policy, with its source
├── quickstart.md        # Phase 1: how to build, serve and check it
├── contracts/
│   └── routes.md        # Phase 1: what the site answers, with this feature
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/web/legal/
├── privacy.md           # NEW — the privacy policy's words, as the owner approved them
├── terms.md             # NEW — the terms' words, as the owner approved them
└── page.html            # NEW — the page around them: head, kit link, footer; no brand value

scripts/
├── build-legal.mjs      # NEW — renders each source into src/web/public/<name>/index.html
└── build.mjs            # runs build-legal.mjs beside build-style.mjs

src/server.ts            # serves /privacy, /privacy/, /terms, /terms/ directly
src/web/copy.ts          # the homepage line's words
src/web/App.tsx          # the homepage line
src/web/app.css          # its placement, tokens only
src/web/kit/page.css     # header comment names the site's own published pages; no rule changes
.gitignore               # src/web/public/privacy/ and src/web/public/terms/

tests/app/
├── legal-pages.test.ts  # NEW — generator output and the sources' content guards
├── app.test.tsx         # the homepage now carries the two links beside the address
└── server-smoke.test.ts # the four routes answer 200 directly; the homepage links them
```

**Structure decision**: the existing single project. The generator follows
`build-style.mjs`: a template with no brand value, filled at build, output in
`src/web/public/` before Vite copies it, gitignored.

## Complexity Tracking

No violations to justify.
