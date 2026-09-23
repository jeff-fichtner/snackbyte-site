<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0 (2026-09-22): the brand left this repository. Principle I
now forbids brand values here outright rather than fencing them into four files;
Principles II, III and VI and the governing-files list point at the guide and the
package instead of docs/BRAND.md. Previous text is in version history.

Version change: (none) → 1.0.0
Ratification: first constitution for this repository; the file existed only as an
unfilled template.
Principles added:
  I. The Site Renders the Brand; It Does Not Own It
  II. Derived, Never Hand-Cut
  III. A Conversation Is Not a Record
  IV. Sections Are a Contract With Outsiders
  V. Nothing Is Linked That Is Not Finished
  VI. Every Word Ships in the Voice
  VII. Proven in the Built Thing Before Handover
  VIII. The Hard Rules and the Template's Rules Bind by Reference
Sections added: What Governs, and Where It Lives; Development Workflow; Governance
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is generic; no edit needed
  ✅ .specify/templates/spec-template.md — no principle references; no edit needed
  ✅ .specify/templates/tasks-template.md — no principle references; no edit needed
  ✅ CLAUDE.md — brand and sections pointers already present; constitution pointer added
Deferred: none
-->

# snackbyte-site Constitution

This is the public face of snackbyte and a consumer of its brand. Two bodies of
law already govern it and are bound by reference, not restated here — see
Principle VIII.

## Core Principles

### I. The Site Renders the Brand; It Does Not Own It

The brand's record is the `snackbyte-brand` guide, which is the authority: values,
rules, voice, and where the brand has landed. The site reads it through
`@snackbyte/brand` and renders it. A brand decision MUST NOT first appear in this
site's code — it is made in the guide, then rendered.

The brand left this repository on 2026-09-22: the guide is `snackbyte-brand` and the
implementation that compresses it is `snackbyte-brand-render`, consumed here as
`@snackbyte/brand`. A brand value MUST NOT be written in this repository at all —
not in `app.css`, not in a component, not in a page under `public/`. It is read from
the package, or the page is wrong.

**Rationale**: every snackbyte app consumes this brand. While the site owned it,
every app would have depended on the site. The boundary this principle drew is what
made the extraction a move rather than a rewrite.

### II. Derived, Never Hand-Cut

Anything that can be computed from a source MUST be computed from it: the marks
and tokens from the guide, by the brand package; the favicons and the link-preview
card copied into `public/` at build; each client section's landing page from its
`section.json`. A generated file MUST NOT be hand-edited — the generator is fixed
and the file regenerated.

Generated output that only this deployment needs is produced at build and excluded
from version control.

**Rationale**: a hand-tuned copy of a generated file is a bug with a delayed
fuse: it survives until the next regeneration and then silently disappears.
One source also means a correction happens once — the bite geometry was wrong
in every asset and was fixed in one function.

### III. A Conversation Is Not a Record

A decision exists when it is written down: in the `snackbyte-brand` guide for the
brand, in this constitution for a principle, in `specs/` for a feature. Agreement reached
in conversation and then implemented is not recorded, and the next session
inherits code with no reason attached. A superseded decision is changed in the
record and dated; the reasoning that produced it is kept, not overwritten.

**Rationale**: this brand took four rounds of options to settle, and almost all
of that reasoning would have evaporated with the session that produced it.
What survives is what was written down.

### IV. Sections Are a Contract With Outsiders

`docs/SECTIONS.md` binds every contributor to `src/web/public/work/<slug>/`,
including agents from other repositories that never open this one, and it MUST
remain self-contained: a reader with only that file can comply with it.

The app never reaches into a section, and a section never reaches out. Section
pages are standalone HTML documents with no import from `src/`, no shared
stylesheet and no build step, and they are excluded from this repository's
formatter.

**Rationale**: a section is published by someone who does not know this
codebase and should not have to learn it. The isolation is what keeps the site
from breaking a client's page, and a client's page from breaking the site.

### V. Nothing Is Linked That Is Not Finished

The homepage links only what it owns and what is done. Client sections are
never linked from it. Pages that are shared deliberately rather than published
— client sections, `/style` — are marked `noindex` and reached by direct URL.
A link is a claim that what is behind it is ready.

**Rationale**: the two kinds of page on this site have different audiences. A
stranger reaching the homepage should find one finished thing; a person handed
a section's URL already has the context that page assumes.

### VI. Every Word Ships in the Voice

Copy is bound by the guide's § Voice: say what it does, then what it
doesn't; short declaratives; specific over general; sentence case and plain
verbs; no adjectives that sell. The name is `snackbyte`, lowercase, everywhere
a human reads it — page titles, `<title>` and link previews included. The legal
name on legal and financial paper is the only exception.

**Rationale**: the voice was extracted from work that already sounded like
itself, and it carries as much of the brand as the mark does. It is also the
half that a rushed change breaks quietly, because nothing fails when the words
go wrong.

### VII. Proven in the Built Thing Before Handover

A change is not done when it compiles. Before it is handed over: the check gate
green; the production build served by the real server; every route the change
touches requested and its status and content type checked; and the result
looked at in both themes and at phone width. Whatever could not be verified
automatically is stated plainly, with why.

**Rationale**: this site's output is visual, and its build runs steps the dev
server does not — prerendering, section generation, asset copying. A change can
pass every test and still ship a blank page or a broken mark.

### VIII. The Hard Rules and the Template's Rules Bind by Reference

Two bodies of law already govern this repository and are NOT restated here:

- the owner's global rules in `~/.claude/CLAUDE.md` — fail loud on missing
  configuration, name ≠ brand, testing discipline, and how work comes back in;
- `snackbyte-base`'s constitution — prerender by default; pinned, linted,
  type-safe, tested; spec stays in spec spaces.

They bind every change by reference. Where this file and those disagree, those
win: the divergence is fixed where the rule lives, and mirrored here.

**Rationale**: one copy of each rule. A restatement is a second copy, and the
second copy is the one that drifts.

## What Governs, and Where It Lives

- [`snackbyte-brand`](https://github.com/jeff-fichtner/snackbyte-brand) — the brand
  guide: values, rules, voice, and the rollout list that tracks where the brand has
  landed across repositories. The authority; `docs/BRAND.md` here is a pointer to it.
- [`snackbyte-brand-render`](https://github.com/jeff-fichtner/snackbyte-brand-render)
  — the implementation that compresses the guide, consumed here as `@snackbyte/brand`.
- `docs/SECTIONS.md` — the client-section contract, binding on contributors
  from outside this repository.
- <https://snackbyte.io/style/> — the readable style guide, with the reasoning.
- `artifacts/` — published documents whose URLs are stable; never a scratch
  directory.

## Development Workflow

- **A unit of work** is a branch cut from `main` with a pull request as its
  handle, ending as a ready PR with the check gate green. The owner reviews and
  approves it in conversation; the agent then merges. An agent never merges a
  unit the owner has not reviewed.
- **A feature gets a spec; a chore does not.** A feature changes what the site
  is — a new page, new behaviour, a change to what the homepage says it does.
  A chore does not: a copy fix, a new client section, regenerating assets, a
  dependency bump. Neither skips the check gate or Principle VII.
- **The check gate** is `npm run check:all` — format, lint, typecheck, test.
- **Versioning is derived.** CI creates a tag from the commit; no version is
  committed and no agent edits one.
- **Deployment is automatic**: `main` deploys production, `dev` deploys
  staging. Staging serves exactly as production does and is marked `noindex`.

## Governance

This constitution supersedes other practices in this repository, subject to
Principle VIII. Every plan and review MUST verify compliance with it; a
deviation is either corrected or recorded as an amendment, never tolerated
silently.

Amendments are made here with the previous text kept in version history, and
the reason recorded in the commit that makes them. Versioning is semantic:
MAJOR for a principle removed or redefined, MINOR for a principle added or
materially expanded, PATCH for wording. `CLAUDE.md` carries the runtime
guidance for agents working here and points at this file.

**Version**: 1.1.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
