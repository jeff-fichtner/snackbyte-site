# Feature Specification: The letters, in bits

**Feature Branch**: `backlog-letter-bits` (numbered when picked up)

**Created**: 2026-10-24

**Status**: Stub — backlog. Direction captured, nothing designed.

## What this is

Something a little cheeky on the homepage. When the lockup arrives, the mark's eight cells
step through the name one letter at a time, each letter's character code as eight bits,
while the wordmark types itself in step (`src/web/ArrivingLockup.tsx`). Most people watch
it once without knowing what it was.

Tapping a letter of the wordmark replays that letter's frame: the letter highlights, the
other letters dim, and the cells light up in its bits, exactly as the animation showed
when it spelled that letter. Someone who saw the animation and then taps a letter
finds out what they were looking at.

## The owner's words (2026-10-24)

> "If someone sees the animation then clicked on a letter they'd see what the animation
> showed when it spelled out that letter."

## What it rests on

- The frame for every letter already exists. `ArrivingLockup.tsx` derives each cell's
  state from the letter's code, most significant bit first (`bitsOf`), so the tap shows
  the same derivation, not a second copy of it.
- The homepage already hydrates (`main.tsx`), so a page with script is possible. The
  arrival itself is CSS only and must stay that way: it plays from first paint with no
  script and cannot delay the words.

## Open

- **Script.** This would be the homepage's first interactive part. It must not change
  what the page is without script: at rest, and under reduced motion, the mark is exactly
  the mark.
- **Keyboard and screen readers.** Each letter would become a control, but the wordmark
  must still read as the one word "snackbyte", not nine buttons.
- **Reduced motion.** Whether the frame appears without transition or the interaction is
  left out.
- **Back to rest.** How the mark returns to every cell filled, with its bite: a second
  tap, tapping elsewhere, or a timeout.
- **Register.** `specs/backlog-brand-page/` says the homepage "explains and does not
  wink", and this is a wink. Decide whether it fits as an easter egg nobody is told
  about, or whether it changes the homepage's register.

## Why it is not being done now

Parked by the owner on 2026-10-24 to capture the idea, with nothing designed.
