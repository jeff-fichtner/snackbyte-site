# Feature Specification: The activity view

**Feature Branch**: `backlog-activity-view` (numbered when picked up)

**Created**: 2026-09-22

**Status**: Stub — backlog. Direction captured, nothing designed.

## What this is

A surface on this site — its own page, or a band on the homepage — showing the owner's
work over time the way a commit graph does: a grid of days, intensity per day, no
labels. A collapsed, public, anonymous shadow of what the console shows privately.

The appeal is that it is **evidence that cannot go stale**. Every other way of showing
the work is a claim written once: it ages, it needs maintaining, and a stranger has to
take it on trust. A graph that fills itself in is none of those things, is nobody's
client data, and demonstrates the work is real without describing it.

## Where the data comes from

Slate (`snackbyte-lane-engine`) is the only place that knows what the owner worked on,
because it already reads the systems of record. This page would derive from it.

**That is a dependency, not a feature request.** Slate has no public surface and nothing
in its roadmap says it should. Anything needed there is a separate unit in that
repository, raised on its own terms — this page does not get to plan that work.

## What it collides with, and would have to answer

These are the expensive things to rediscover after building it.

- **Slate discarded the grade on purpose.** Its `DECISIONS.md` 29 removed the evaluator,
  the per-lane rule and the per-card verdict, and its stance became _it reports; it does
  not score_. A contribution graph is a score wearing a grid: a quiet fortnight reads as
  failure. Slate stopped making that claim to an audience of one; this would restart it
  to an audience of strangers. **The question: what is one cell counting, and whose
  number is it?** "Productivity" is not an answer.
- **Anonymised is not the same as safe.** Strip every label and the cadence remains —
  when the owner works, when they stop, how long a gap ran. That is a real disclosure
  about a person.
- **A quiet period is the normal case.** The page has to be honest when nothing is
  happening, and still not read as abandonment. That is a design problem, not a copy
  problem, and it is the one most likely to sink the idea.
- **Slate's colour grammar already exists** and should be inherited rather than
  reinvented: its `DECISIONS.md` 32 — "the page is an instrument, and it reads
  temperature; hue means heat and nothing else."
- **Principle V of this repository**: nothing is linked that is not finished. A graph
  that breaks its feed is worse than no graph.

## Why it is not in the homepage

The homepage (`specs/001-homepage/`) shows the work in words instead. That is
deliberate: words ship now, cannot break, and need no public surface from another
product. This remains the better answer to the same problem and is why it is written
down rather than dropped.

## Where it came from

Wanted for the homepage, 2026-09-22, and never recorded anywhere before that
conversation — the idea existed only in the owner's head. First logged in
`snackbyte-lane-engine` by mistake and moved here: it is a surface on this site that
consumes Slate, not a feature of Slate.
