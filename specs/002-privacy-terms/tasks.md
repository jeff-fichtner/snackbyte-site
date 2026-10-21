# Tasks: Privacy policy and terms of service

**Input**: Design documents from `/specs/002-privacy-terms/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, facts.md, contracts/routes.md

**Tests**: written before the code they cover, per the owner's testing discipline; each
test task names the file and must be seen failing first.

**Organization**: by user story, so each is testable on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: the user story a task belongs to (US1–US4)

---

## Phase 1: Setup

- [x] T001 Confirm the worktree is on `002-privacy-terms` cut from current `origin/dev`, `npm ci` is clean, and `npm run check:all` is green before any change, in the repo root

---

## Phase 2: Foundational — blocks every story

The generator, the two sources' skeletons and the routes. Nothing in Phase 3+ starts
until these are done.

- [x] T002 Write failing tests in `tests/app/legal-pages.test.ts` for the generator `renderLegal(name, markdown)` exported by `scripts/build-legal.mjs`: the output links `/kit/page.css` and `/favicon.svg`; the `<title>` is `snackbyte privacy policy` or `snackbyte terms of service`; `<link rel="canonical">` is `https://snackbyte.io/<name>`; there is no robots meta, no `<script>`, no `<style>` block and no `style=` attribute (FR-004); the markdown's `#` heading becomes the page's only `<h1>`; a source without a `Last changed <Month D, YYYY>.` line under the title throws, naming the file
- [x] T003 Create the page template `src/web/legal/page.html`: head (charset, viewport, `%legal:title%`, `%legal:description%`, canonical `%legal:url%`, og tags as `/style` and `/for/` pages carry them, favicon, `/kit/page.css`), `<main class="page">` holding `%legal:body%`, and the kit footer with the wordmark linking `/`; no colour, font or size
- [x] T004 Create `scripts/build-legal.mjs`: `renderLegal(name, markdown)` renders with `markdown-it` (HTML disabled, typographer off), fills the template, fails on a missing date line or an unfilled `%legal:…%`; run as a script it renders `src/web/legal/privacy.md` and `terms.md` into `src/web/public/privacy/index.html` and `src/web/public/terms/index.html`, with titles and descriptions held in the script beside each name
- [x] T005 Create the two sources with their title and date line only, `src/web/legal/privacy.md` and `src/web/legal/terms.md`, so the build has something to render
- [x] T006 Run `scripts/build-legal.mjs` from `scripts/build.mjs` after `build-style.mjs`, and add `src/web/public/privacy/` and `src/web/public/terms/` to `.gitignore` with a comment naming the generator; confirm T002's tests pass
- [x] T007 Write failing tests in `tests/app/server-smoke.test.ts`: `/privacy`, `/privacy/`, `/terms`, `/terms/` each answer 200 `text/html` with no `Location` header and the page's `<h1>`
- [x] T008 Serve the four paths directly in `src/server.ts`, registered before `express.static`, each sending `<name>/index.html` from `dist/`, with a comment saying why (the static handler's directory redirect; the URLs given to Google); confirm T007's tests pass
- [x] T009 Widen the header comment of `src/web/kit/page.css` to name the site's own published pages (`/privacy`, `/terms`) among the pages it styles; change no rule
- [x] T010 Run `npm run check:all` and confirm green

**Checkpoint**: both URLs answer directly with a dated, kit-styled page.

---

## Phase 3: User Story 1 — Google can verify the snackbyte app (P1) 🎯 MVP

**Goal**: the homepage links both pages at the addresses Google is given.

**Independent test**: the built homepage carries `href="/privacy"` and `href="/terms"`;
the four routes answer 200 with no redirect.

- [x] T011 [US1] Update the failing expectations in `tests/app/app.test.tsx`: the homepage links `/privacy` and `/terms` with the words from `copy.ts`, and the contact address is still the only `mailto:`
- [x] T012 [US1] Add the words (`Privacy`, `Terms`) to `src/web/copy.ts` and correct its comment that the address is "the only link on the page"
- [x] T013 [US1] Add the line under the contact line in `src/web/App.tsx`, and place it in `src/web/app.css` with tokens only, muted, at the page's foot
- [x] T014 [US1] Add to `tests/app/server-smoke.test.ts`: the built homepage links `/privacy` and `/terms`; confirm T011's expectations and these pass

**Checkpoint**: US1 complete — the verification path works end to end, whatever the words.

---

## Phase 4: User Story 2 — A person learns what snackbyte keeps (P1)

**Goal**: the privacy policy's sign-in sections, true and in the voice.

**Independent test**: the content guards pass, and every sentence has a row in `facts.md`.

- [ ] T015 [US2] Write failing content guards for `src/web/legal/privacy.md` in `tests/app/legal-pages.test.ts`: `privacy@snackbyte.io` and `security@snackbyte.io` present; `Snackbyte LLC` exactly once; `snackbyte` never capitalised otherwise; no word in capitals but `IP`, `ID`, `KMS`, `PKCE`, `SQL` and `LLC`; no promise of deletion after a year, no statement about children, no sentence saying how a deletion is carried out; the three commitments present (FR-013)
- [ ] T016 [US2] Write the policy's opening and sign-in sections in `src/web/legal/privacy.md` — who and what it covers; signing in with Google; what is kept; how long; cookies; what an app receives; where it is kept and who sees it; what you can ask; changes; contact — from facts F1 and F8–F29 and commitments C1–C3 in `specs/002-privacy-terms/facts.md`
- [ ] T017 [US2] Read every sentence of `src/web/legal/privacy.md` against `specs/002-privacy-terms/facts.md`; add a row for any statement without one or cut the statement; confirm T015 passes

**Checkpoint**: the policy says only what is true about sign-in.

---

## Phase 5: User Story 3 — A person reads the terms (P2)

**Goal**: the terms of service, with the owner's legal choices and nothing more.

**Independent test**: the content guards pass; a reader can name the company, two things
they may not do, and the governing law.

- [ ] T018 [P] [US3] Write failing content guards for `src/web/legal/terms.md` in `tests/app/legal-pages.test.ts`: `Snackbyte LLC` exactly once; California law and Inyo County named; the $100 floor and the twelve months named; `No warranty` and `Limit of liability` each a heading; no word in capitals beyond the same acronym list (`IP`, `ID`, `KMS`, `PKCE`, `SQL`, `LLC`); no promise of uptime, availability, refunds or advance notice (FR-017a); `security@snackbyte.io` present
- [ ] T019 [US3] Write `src/web/legal/terms.md` from FR-016, FR-017 and FR-017a: who and what; your account; what you may not do; what is yours and what is ours; ending; no warranty; limit of liability; the law and where disputes go; changes; the whole agreement; contact; confirm T018 passes

**Checkpoint**: the terms are complete.

---

## Phase 6: User Story 4 — A visitor learns what this site keeps (P3)

**Goal**: the policy's section about snackbyte.io itself.

**Independent test**: the section states no cookies, no analytics, Google Fonts, and 30
days of request logs.

- [ ] T020 [US4] Write a failing guard in `tests/app/legal-pages.test.ts` that the privacy policy's section about this site names cookies, analytics, Google Fonts and the 30 days
- [ ] T021 [US4] Write the section in `src/web/legal/privacy.md` from facts F2–F7, after the opening and before the sign-in sections (data-model.md order); confirm T020 passes

**Checkpoint**: all four stories complete.

---

## Phase 7: Polish, approval and release

- [ ] T022 Present both texts, as they will be published, to the owner; the owner reads each as a first-time reader and answers SC-004's three questions; record the approval and its date under Clarifications in `specs/002-privacy-terms/spec.md` (FR-021, SC-004, SC-006). Nothing merges before this
- [ ] T023 Set each source's date line to the approval date in `src/web/legal/privacy.md` and `src/web/legal/terms.md`
- [ ] T024 Run `npm run check:all` and confirm green
- [ ] T025 Principle VII: build, start the real server, request the four routes and the homepage per `specs/002-privacy-terms/quickstart.md`, and record status, content type and the absence of a redirect
- [ ] T026 Screenshot both pages and the homepage with headless Chrome at 390 px and 1280 px, day and night, into `specs/002-privacy-terms/screenshots/`, and look at each
- [ ] T027 Open the PR into `dev` with the gate green; after the owner approves, merge; confirm staging deploys and `https://snackbyte.dev/privacy` and `/terms` answer 200 with `X-Robots-Tag: noindex`
- [ ] T028 Promote `main` to the `dev` commit by fast-forward; confirm production deploys and, per the quickstart, the four routes answer 200 with no redirect, the homepage links both, and no `X-Robots-Tag` is sent
- [ ] T029 Close request #cba6aa with `ops done cba6aa` naming `https://snackbyte.io/privacy` and `https://snackbyte.io/terms`

---

## Dependencies & execution order

- **Setup (T001)** → **Foundational (T002–T010)** → stories.
- **US1 (T011–T014)** depends only on Foundational.
- **US2 (T015–T017)** and **US4 (T020–T021)** both edit `privacy.md`: US4 follows US2.
- **US3 (T018–T019)** edits only `terms.md` and its guards: it can run beside US2.
- **Polish (T022–T029)** follows every story; T022 (the owner's approval) gates T027's
  merge, and T027's staging check gates T028's promotion.

## Parallel opportunities

- T018 (terms guards) can be written while US2 is in progress; they touch different
  sources, though both add to `tests/app/legal-pages.test.ts` — write them in separate
  `describe` blocks.

## Implementation strategy

1. Foundational, then US1: the URLs answer and the homepage links them. This is the
   verification path; it is not shippable alone, because the pages would be empty.
2. US2 and US3: the words. US4 completes the policy.
3. The owner reads both texts (T022) — the one gate that cannot be automated.
4. Gate, Principle VII, PR, staging, production, close the request.
