# Implementation Plan: The homepage

**Branch**: `001-homepage-plan` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-homepage/spec.md`

## Summary

Replace the holding page with the real homepage: the lockup, a claim, what snackbyte
does, three pieces of work described in words, a place, and one contact address. One
screen at a phone size, prerendered, following the system theme.

Most of the machinery already exists and was built during the brand work — the lockup,
the theme, prerendering, the favicons, the link-preview card. What this feature adds is
**content and one gap**: copy that has never been written, and a not-found page, because
the server currently answers every unknown URL with the homepage and a 200.

## Technical Context

**Language/Version**: TypeScript 5, Node 24 LTS (pinned in `.nvmrc`)

**Primary Dependencies**: React 19, Vite, Express 5; `@snackbyte/brand` for every brand
value (installed by git tag)

**Storage**: none. The page holds no data and stores nothing about a visitor.

**Testing**: Vitest — component render assertions plus a server smoke test that exercises
the built output through the real Express app

**Target Platform**: modern browsers, phone first; served from Cloud Run

**Project Type**: prerendered single-page site with an Express server (the template's
`server` mode)

**Performance Goals**: meaningful content visible within 2s on a mid-range phone over a
typical mobile connection (SC-003). The page ships as real HTML, so this is bounded by
the font request, not by script execution.

**Constraints**: one screen at 390px without scrolling for name, claim and place
(SC-002); every text role ≥ 4.5:1, ≥ 3:1 at 24px and above, in both themes (SC-004);
no analytics, no cookies, no consent banner

**Scale/Scope**: one page, one not-found page, a handful of components. Single visitor
concurrency is irrelevant; the container scales to zero between visits.

## Constitution Check

_GATE: passed before Phase 0, re-checked after Phase 1._

| Principle                                                       | How this feature satisfies it                                                                                                                                                                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. The site renders the brand; it does not own it**           | Every colour, space step, type step, mark and the wordmark's cut come from `@snackbyte/brand`. No hex, no scale value, no geometry appears in this repository. The headline and the place are read from the package's `copy`, because the guide already holds them. |
| **II. Derived, never hand-cut**                                 | Favicons and the link-preview card continue to be copied from the package at build. No generated file is edited.                                                                                                                                                    |
| **III. A conversation is not a record**                         | The three answers that shaped this page are in the spec, not only in chat. Copy decisions that follow from taste rather than from the spec are recorded in this plan's Content section.                                                                             |
| **IV. Sections are a contract with outsiders**                  | Untouched. The not-found route must not swallow `/work/<slug>/` paths that exist.                                                                                                                                                                                   |
| **V. Nothing is linked that is not finished**                   | The page links nothing except a `mailto:`. Work is described, not linked. `/style` stays unlinked.                                                                                                                                                                  |
| **VI. Every word ships in the voice**                           | All new copy follows the guide's voice rules; the name is lowercase everywhere including `<title>`. The Content section below is where that is checked before it is written.                                                                                        |
| **VII. Proven in the built thing before handover**              | The verification list below is part of the definition of done, not a follow-up.                                                                                                                                                                                     |
| **VIII. Hard rules and the template's rules bind by reference** | Prerender stays on; the check gate stays green at every step; no spec references leak into `src/`. Contact is a real address, not a configurable one with a fallback.                                                                                               |

**Result: pass.** No violations, so Complexity Tracking is omitted.

## What already exists

Built during the brand work and reused unchanged:

- The lockup (`Lockup`, `Mark`) drawing from the package's mark data, filled from tokens.
- Theme selection, day and night, from `tokens.css`.
- Prerendering: `prerender.ts` renders `App` into `index.html` at build.
- The favicon set, the theme-colour meta, and the Open Graph card.
- The layout shell in `app.css` — the centred block above a footer.

## What this feature adds

### 1. Content (the substance of the work)

The page gains three things it has never had: a sentence saying what snackbyte does,
three pieces of work in words, and a contact. See **Content** below — that section is the
real deliverable and needs sign-off before the code is written.

### 2. A not-found page

**Current behaviour, verified**: `src/server.ts` answers every unmatched GET with
`index.html` and status 200. `/nonsense`, `/work/`, and `/style/nope` all return the
homepage. This fails FR-016 twice: the visitor gets no indication they mistyped, and a
search engine indexes infinite duplicate homepages.

**Approach**: prerender a second page. `prerender.ts` gains an entry that renders a
`NotFound` component to `404.html`; the Express fallback serves that file with status 404. Static assets and existing section paths are unaffected because `express.static`
runs first and only misses reach the fallback.

The page itself: the lockup, a line in the voice, and a link home. It is the only page
on the site that links the homepage.

### 3. Copy moved to one place

`App.tsx` currently holds its strings inline. With several more arriving, the page's copy
moves into one module so the voice can be read in one place and tested in one place.
Brand-level strings (the name, the headline, the place) still come from the package; this
module holds only what is specific to this page.

## Project Structure

### Documentation (this feature)

```text
specs/001-homepage/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0: the questions this plan had to answer
├── quickstart.md        # Phase 1: how to run, change and verify the page
├── contracts/
│   └── routes.md        # Phase 1: what the site answers, and with what
└── checklists/
    └── requirements.md
```

No `data-model.md`: the feature has no entities. The page stores nothing, reads nothing,
and has no state beyond the reader's own theme preference.

### Source code

```text
src/
├── server.ts                 # CHANGED: fallback serves 404.html with status 404
└── web/
    ├── App.tsx               # CHANGED: the real page
    ├── NotFound.tsx          # NEW: the not-found page
    ├── copy.ts               # NEW: this page's words, in one place
    ├── Logo.tsx              # unchanged
    ├── app.css               # CHANGED: styles for the new sections
    ├── prerender.ts          # CHANGED: a second entry for 404.html
    └── index.html            # CHANGED: description meta matches the new page

tests/app/
├── app.test.tsx              # CHANGED: assertions for the real page
├── not-found.test.tsx        # NEW
└── server-smoke.test.ts      # CHANGED: a 404 returns 404 and the right page
```

**Structure Decision**: the existing layout, unchanged. This is one page in a site that
already has its shape; no new directories, no new layers. `copy.ts` is the only new
concept and it exists to keep Principle VI checkable.

## Content

**This is the part that needs your sign-off.** Everything else follows mechanically.

### The claim, under the headline

The headline comes from the brand (`copy.headline`). Under it, one sentence that says
what snackbyte actually does, for whom:

> snackbyte builds small software for people and organizations who need a tool that
> nobody sells.

And under that, the address — not the market:

> Based in Bishop, California.

**The claim once said "for the people and organizations around Bishop, California".**
That was wrong, and wrong in a way that shrinks the business: Bishop is where the work is
done, not who it is for. The work goes wherever it is wanted. Corrected 2026-09-23 in the
guide first (`copy.based`, guide v1.2.0) because it is a brand decision, not a page one.

### The work, in words

Three, chosen to span an institution, a craft business and a community — the range a
stranger needs in order to place what snackbyte does. Each names the product — what it
does for the person who uses it — not the machinery inside it. No links, no technology,
no client named.

> **Enrollment for an after-school music program.** Families sign their children up,
> staff see who is in which class, and nobody re-types a spreadsheet.
>
> **An AI that edits wedding films.** It is learning to watch a day's raw footage and cut
> it into the film a videographer would have made.
>
> **A call board for a community theatre.** Cast and crew pick their name and see when
> they are called, and when they are done.

**Why these three** (surveyed 2026-09-22, and decided over a weaker first attempt):
the first is the one that says an institution depends on this software; the second is
current work with a real idea in it, and it is the only one that reads as modern; the
third is live, local and the closest to the brand's own voice. All three are running —
the call board verified at its host, the other two in active development with commits
in the last fortnight.

**Considered and not used**: short links and printed QR codes (live, tangible, but
thinner than the three); limited-use magazine downloads (legible but narrow); the
generator maintenance log (real and charming, but the smallest thing here); the console
over one person's day (not built for anyone else, so it is not evidence of work done for
others).

**The second one is the biggest claim on the page, and it is written as ongoing on
purpose.** "Is being taught" is the whole of its honesty: the judging pipeline runs today
— transcription, per-frame vision analysis, a per-clip judgment, validated against the
videographer's own independent reads — and picture's reference is filling while its
self-training program is built. Sound has not started, and the user-facing product is
deliberately unspecified until both mediums have trained. So the sentence claims the
ambition and the work, and claims nothing finished. Written in the past or present
perfect it would be a lie; written as ongoing it is exactly true, and it is the most
interesting thing on the page.

**A correction worth keeping**: the first draft of this line described the capture tool —
the app where the videographer marks clips by hand. That is the machinery that trains the
product, not the product. FR-008b exists because of it.

**The claim once ended "— a theatre, a crew, a shop —" and that was cut.** There is no
shop among the clients: the third item was invented to complete a rule of three, which is
filler the voice rules forbid and a false claim on a page whose job is to be credible.
"A theatre" also previewed the work list eight lines below it. The list does that job
properly; the claim does not need to.

**Spelling and phrasing** (corrected 2026-09-23): American spelling throughout — the
business is in California and the reader is in Bishop. "A school's after-school music
program" said school twice in five words. "In picture and in sound" is the industry's
words, not a stranger's, and the detail belongs in the guide rather than on the page.
"Theatre" stays: it is how the art form is spelled, and how the theatre in question
spells itself.

**Naming**: all three are client work and are described unnamed, per FR-008. Adding a
name later never requires taking anything down; the reverse does.

### Contact

> Something you need built? **jeff@snackbyte.io**

The address is the only link on the page. It is not configurable, has no fallback, and
appears exactly once.

### The place

Unchanged from the holding page: _Bishop, California._

### Retired

"Coming soon." and its dot. Nothing on the page reports a status after this.

## Verification (part of done, not after it)

1. `npm run check:all` green at every step.
2. Production build served by the real Express server; `/`, `/style/`, `/work/<a real
slug>/`, `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`, `/social.png` all
   200; an unknown path returns **404** with the not-found page.
3. Rendered and read at 1280 and 390, in both themes.
4. Contrast measured on the real rendered colours, not assumed — every text element
   against its actual background.
5. Keyboard: tab to the `mailto:` and the home link, focus visible on both.
6. `prefers-reduced-motion` honoured, and the page complete without motion.
7. The prerendered HTML contains the claim, the work and the address — verified by
   reading `dist/index.html`, not by trusting the render.
8. **Send a message to `jeff@snackbyte.io` and confirm it arrives.** DNS routes to Google
   Workspace; whether that mailbox or alias exists is unverified and is the one thing
   that can make the page's only call to action dead.

## Phase 2 note

`/speckit-tasks` turns this into an ordered task list. The natural order is content first
(it is the thing needing approval), then the not-found page (independent of the content),
then the page itself, then verification.
