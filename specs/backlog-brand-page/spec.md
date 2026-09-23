# Feature Specification: The brand page

**Feature Branch**: `backlog-brand-page` (numbered when picked up)

**Created**: 2026-09-22

**Status**: Stub — backlog. Direction captured, nothing designed.

## What this is

The page that replaces `/style`. Today that URL holds the style guide: a reference
document, complete, every token and rule on it, built so it could be shown to friends.
What replaces it is **stripped, and about the brand rather than the style** — where the
mark and the palette came from, not the specification of them.

The reference does not disappear. The `snackbyte-brand` guide is already the authority
and already readable by anyone. What `/style` stops being is a second copy of it.

## The tone, in the owner's words

> "A byte is 8 bits, 2 nibbles. Are you hungry yet?"
>
> "The logo and the colour palette — literally made out of the Owens Valley."

That is the register: leading, a little playful, the joke landing on the name. It is
**not** the homepage's register, which explains and does not wink, and it is not the
current page's register, which is a specification. A visitor should finish it amused and
slightly better informed, not equipped to implement anything.

Written down because the tone is the expensive part to rediscover. Every fact it needs
is already in the guide.

## What it would carry

- The name decoded — byte, nibble, snack — and the mark as the literal drawing of it.
- The palette as the valley: alkali, granite, shale, sage, sky, bitterbrush. Where each
  name comes from, somewhere a reader can picture.
- The bite, which is the one part of the mark that is not a rule.
- Little else. Every table, every hex value and every MUST belongs in the guide.

## What it must not become

- A second copy of the guide. If a value appears here it is read from the brand package,
  and it is there because the story needs it, not for reference.
- Linked from the homepage. Principle V holds: reached by URL, `noindex`.

## Open

- Whether it keeps the `/style` path or takes its own.
- Whether it is one screen or a scroll.
- Whether the valley appears in pictures or only in words, and if pictures, whose.

## Why it is not being done now

The homepage (`specs/001-homepage/`) is written for a stranger deciding in ten seconds
whether snackbyte is real. This page is for someone who already decided and got curious.
Different reader, different register, different unit of work.
