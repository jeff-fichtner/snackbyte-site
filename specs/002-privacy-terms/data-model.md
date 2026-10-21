# Data model: Privacy policy and terms of service

Nothing is stored at runtime. The model is the three documents this feature keeps.

## The privacy policy — `src/web/legal/privacy.md`

- **Title**: `# Privacy policy`, the page's only first-level heading.
- **Date line**: `Last changed <Month D, YYYY>.` directly under the title (FR-018).
- **Body**: sections in this order — who and what it covers; this site; signing in with
  Google; what is kept; how long; cookies on the sign-in pages; what an app receives;
  where it is kept and who sees it; what a person can ask; changes; contact.
- **Rules**: every factual sentence has a row in `facts.md`; `Snackbyte LLC` once;
  `privacy@snackbyte.io` and `security@snackbyte.io` present; none of the forbidden
  promises (FR-013, FR-015).
- **Rendered to**: `src/web/public/privacy/index.html` at build, served at `/privacy`.

## The terms of service — `src/web/legal/terms.md`

- **Title**: `# Terms of service`; **date line** as above.
- **Body**: who and what; your account; what you may not do; what is yours and what is
  ours; ending; no warranty (own heading); limit of liability (own heading); the law and
  where disputes go; changes; the whole agreement; contact.
- **Rules**: `Snackbyte LLC` once; the legal choices exactly as FR-017 records them; none
  of FR-017a's promises.
- **Rendered to**: `src/web/public/terms/index.html`, served at `/terms`.

## The fact register — `specs/002-privacy-terms/facts.md`

One row per factual statement in the privacy policy.

| Field | Meaning |
| --- | --- |
| Statement | the claim, in the policy's words or close to them |
| Source | where it is true: snackbyte-auth's schema or record, a configuration read, this repository |
| Read | the date the source was read |

When a fact changes, its row changes in the same commit as the policy's sentence and the
date line (spec, edge cases).

## State

A page has one state: published. A change to its words is a new version at the same URL,
with a new date line.
