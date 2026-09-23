# Research: the homepage

Phase 0. The questions this plan had to answer before it could be written. Each was
checked against the running system rather than assumed.

## 1. What does the site do today with a URL that does not exist?

**Finding**: it answers with the homepage and status 200. Verified against the production
build served by the real server: `/nonsense`, `/work/` and `/style/nope` all returned 200
with `<title>snackbyte`.

**Cause**: `src/server.ts` ends with a catch-all that sends `index.html` for any unmatched
GET — the standard single-page-app fallback that the template ships with, correct for an
app with client-side routing and wrong for a site that has none.

**Decision**: prerender a `404.html` and have the fallback serve it with status 404.

**Alternatives considered**: letting Express return its default 404 (fails the spec's
requirement that the visitor lands somewhere recognisably snackbyte); a client-side route
(fails Principle VIII's prerender rule and would still send 200).

## 2. Can a second prerendered page reuse the existing machinery?

**Finding**: yes, with no new tooling. `src/web/prerender.ts` exports an array of entries,
each mapping an output filename to a React element, and `scripts/prerender.mjs` walks it.
It was built for more than one entry and has only ever had one.

**Decision**: add an entry for `404.html`. Vite must also emit a matching HTML shell for
the placeholder to be replaced in, so the page needs its own entry in the Vite build.

**Risk noted**: the prerender step throws if the placeholder is missing from an emitted
file, so a missing Vite entry fails the build loudly rather than shipping an empty page.
That is the desired behaviour and needs no extra guard.

## 3. Does adding a fallback page endanger client sections?

**Finding**: no. `express.static(distDir)` runs before the fallback, so any real file
under `dist/` — including `work/<slug>/index.html` and its pages — is served before the
fallback is reached. A section that exists is unaffected; a section path that does not
exist correctly becomes a 404, which is an improvement on today's homepage-with-200.

**Checked**: `/work/` with no slug currently returns the homepage; after this change it
returns the not-found page, which is right — there is no index of sections, deliberately.

## 4. Does `jeff@snackbyte.io` receive mail?

**Finding**: partially answered. `snackbyte.io` publishes Google Workspace MX records
(`aspmx.l.google.com` and its alternates), so mail to the domain routes. Whether `jeff@`
exists as a mailbox or alias inside that Workspace cannot be determined from DNS.

**Decision**: treat it as unverified and verify by sending a real message during
implementation. It is the page's only call to action; a dead address is the worst
available outcome and the cheapest to rule out.

## 5. Where should the headline and the place come from?

**Finding**: the brand package already exports them — `copy.headline`, `copy.subhead`,
`copy.place` — because they were added to the guide when the link-preview card needed the
words as data.

**Decision**: read them from the package. The holding page currently hard-codes the
headline string, which is a small Principle I violation that predates the extraction and
gets fixed here rather than carried.

## 6. Is one screen at 390px achievable with the new content?

**Finding**: not for the whole page, and the spec does not ask for that. SC-002 requires
the name, the claim and the place to be visible without scrolling; the work and the
contact may sit below the fold.

**Decision**: the first screen carries the lockup, the headline and the claim. The work,
the contact and the place follow. The place therefore appears twice in the requirements'
reading — once as "where it is" in the first screen and once in the footer — so the claim
sentence names Bishop, which satisfies SC-002 without moving the footer up.
