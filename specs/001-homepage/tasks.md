# Tasks: The homepage

**Feature**: `specs/001-homepage` · **Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

**Organisation**: by user story, so each is independently shippable. US1 alone is a
complete homepage; US2 and US3 each add one thing to it.

**Tests**: written alongside implementation, per the owner's testing discipline and
Principle VII. Every phase ends with the check gate green.

---

## Phase 1: Setup

- [ ] T001 Confirm the branch is cut from current `main` and `npm install` is clean, in the repo root
- [ ] T002 Verify `@snackbyte/brand` resolves and exposes `copy`, `marks` and both stylesheets, by reading `node_modules/@snackbyte/brand/dist/`

---

## Phase 2: Foundational — blocks every story

These change shared files. Nothing in Phase 3+ should start until they are done.

- [ ] T003 Create `src/web/copy.ts` holding this page's words, importing `copy` from `@snackbyte/brand` for the name, headline, subhead and place so none is restated
- [ ] T004 Replace the hard-coded headline string in `src/web/App.tsx` with the value from `copy.ts`, leaving the page otherwise unchanged, and confirm the page still renders
- [ ] T005 Run `npm run check:all` and confirm green before any story begins

---

## Phase 3: User Story 1 — the stranger with a link (P1) 🎯 MVP

**Goal**: a stranger on a phone learns in ten seconds what snackbyte is, what it does, and
where it is.

**Independent test**: show the built page to someone who has never heard of snackbyte for
ten seconds; they can then say what it does and who it is for.

- [ ] T006 [US1] Write the claim sentence into `src/web/copy.ts`, naming Bishop so SC-002 is met without moving the footer
- [ ] T007 [US1] Rewrite `src/web/App.tsx` to render the lockup, the headline, the claim and the place, and remove "Coming soon." and its dot
- [ ] T008 [US1] Update `src/web/app.css` for the new block, using only the brand's space and type steps — no literal values
- [ ] T009 [US1] Update `src/web/index.html`'s description meta to match what the page now says
- [ ] T010 [P] [US1] Update `tests/app/app.test.tsx`: the name is lowercase, the headline and claim render, "Coming soon" is gone, and no client name appears
- [ ] T011 [US1] Build, serve the production build with the real server, and confirm `dist/index.html` contains the claim as text rather than only rendering it
- [ ] T012 [US1] Read the page at 1280 and 390 in both themes; confirm name, claim and place are visible at 390 without scrolling

**Checkpoint**: a complete, shippable homepage.

---

## Phase 4: User Story 2 — the visitor who wants contact (P2)

**Goal**: one obvious way to get in touch, in one action, collecting nothing.

**Independent test**: from the page alone a visitor can begin contact and knows what will
happen.

- [ ] T013 [US2] Add the contact line and `jeff@snackbyte.io` to `src/web/copy.ts` as the only address, with no fallback
- [ ] T014 [US2] Render it in `src/web/App.tsx` as a `mailto:` link with nothing pre-filled but the recipient
- [ ] T015 [US2] Style the link in `src/web/app.css` from the brand's tokens, with a visible focus state
- [ ] T016 [P] [US2] Extend `tests/app/app.test.tsx`: exactly one `mailto:`, no form element, no other link
- [ ] T017 [US2] **Send a real message to `jeff@snackbyte.io` and confirm it arrives.** DNS routes to Workspace; the mailbox itself is unverified and this is the page's only call to action
- [ ] T018 [US2] Tab to the link in the built page and confirm focus is visible

**Checkpoint**: the page can produce a conversation.

---

## Phase 5: User Story 3 — the visitor who wants evidence (P3)

**Goal**: three pieces of real work, described by what they do, linked nowhere.

**Independent test**: a visitor can name one real thing snackbyte has built.

- [ ] T019 [US3] Add the three work descriptions to `src/web/copy.ts`, exactly as approved in the plan's Content section
- [ ] T020 [US3] Render them in `src/web/App.tsx` as a list, below the first screen
- [ ] T021 [US3] Style the list in `src/web/app.css` from the brand's steps
- [ ] T022 [P] [US3] Extend `tests/app/app.test.tsx`: three items render, none is a link, and no client name appears in the markup
- [ ] T023 [US3] Re-read the built page at both widths and both themes with the work present

**Checkpoint**: the claim is evidenced.

---

## Phase 6: The not-found page

Independent of all three stories and of the content; can run in parallel with Phase 3+ by
anyone not touching `App.tsx`.

- [ ] T024 Create `src/web/NotFound.tsx` — the lockup, one line in the voice, and a link home, the only page that links the homepage
- [ ] T025 Add a `404.html` shell so Vite emits a file with the prerender placeholder, alongside `src/web/index.html`
- [ ] T026 Add the `404.html` entry to `src/web/prerender.ts` so its markup is rendered at build
- [ ] T027 Change the fallback in `src/server.ts` to send `404.html` with status 404 instead of `index.html` with 200
- [ ] T028 [P] Create `tests/app/not-found.test.tsx` for the component
- [ ] T029 Extend `tests/app/server-smoke.test.ts`: an unknown path returns 404 and the not-found page; `/` still returns 200
- [ ] T030 Serve the build and confirm `/nonsense` returns 404, a real section under `/work/<slug>/` still returns 200, and every asset route is unaffected

---

## Phase 7: Polish and verification

Principle VII: this is part of done, not a follow-up.

- [ ] T031 Measure contrast on the real rendered colours for every text element in both themes against its actual background, and confirm each reaches 4.5:1, or 3:1 where the text is 24px or larger
- [ ] T032 Confirm `prefers-reduced-motion` is honoured and the page is complete without motion
- [ ] T033 Re-read the whole page and the not-found page at 1280 and 390, both themes
- [ ] T034 Confirm the link preview still resolves: the head points at `/social.png` and it serves
- [ ] T035 Read `dist/index.html` and `dist/404.html` and confirm the words are in the delivered HTML
- [ ] T036 Confirm no brand value appears anywhere in `src/` — no hex, no scale literal, no mark geometry
- [ ] T037 Confirm no spec or FR reference leaked into `src/`, `tests/` or `README.md`
- [ ] T038 Measure first contentful paint for the built page on a throttled connection and confirm the words are visible within two seconds; record the number rather than asserting the page is fast
- [ ] T039 Re-read every sentence on the finished page and confirm none becomes untrue through the passage of time alone — no status, no count, no date, and no claim that expires when the work behind it finishes
- [ ] T040 Confirm the three pieces of work still span more than one kind of client, so a later swap cannot quietly narrow them
- [ ] T041 Run `npm run check:all` and confirm green
- [ ] T042 Open the PR with day and night screenshots and the verification results

---

## Dependencies

```text
Phase 1 (setup)
  └─> Phase 2 (foundational: copy.ts) ─┬─> Phase 3 (US1) ──> Phase 4 (US2) ──> Phase 5 (US3)
                                       └─> Phase 6 (404, independent)
                                                  └─────────> Phase 7 (verification)
```

- **US1 depends on** Phase 2 only. It is the MVP and ships alone.
- **US2 and US3 depend on** US1 having rewritten `App.tsx`, because they add to it. They do
  not depend on each other and could swap order.
- **Phase 6** touches no file that Phases 3–5 touch except `prerender.ts`, so it is genuinely
  parallel.
- **Phase 7** needs everything shipped.

## Parallel opportunities

- T010, T016, T022, T028 — test files, each separate from the others.
- Phase 6 in full, alongside any story phase.
- T031–T040 — independent checks once the page is built.

## MVP scope

**Phase 1 + 2 + 3.** That is a complete homepage: lockup, headline, claim, place. It
retires "Coming soon." and satisfies the only story the page really has.

Phase 6 should ship with it regardless of scope, because the 404 bug exists today and is
independent of the content.
