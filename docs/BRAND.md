# snackbyte brand

The record of how snackbyte looks, sounds, and why. Decided 2026-09-21. The readable
version, with the reasoning, is the live page at <https://snackbyte.io/style/>
(unlinked, `noindex`); this file is the part a build can consume.

**Where this lives, and where it is going.** The brand is one thing and every
app is a consumer of it, so it will become its own npm package (working name
`@snackbyte/style`, spun from `snackbyte-npm-base`) when the first importer
appears — the homepage rebuild. Until then it lives here, in the first
consumer, written as that package's future README so the move is a `git mv`.
The exploration that led here is `artifacts/brand-directions.html`, whose
published versions are the three rounds of options that were eliminated.

## The idea

Bounded pieces, and the seam between them. snackbyte makes small, whole tools,
each doing one job and knowing only what it needs. The name says it: a byte is
eight bits, the smallest whole unit; a byte is two nibbles of four, a bounded
piece inside a bounded piece; a snack is a portion complete on its own. The
mark is a byte, drawn as two nibbles, with a bite out of it.

## Tokens

Seven roles. Each has a day value and a night value; nothing else changes
between themes. Ground and ink swap; the accents lift enough to read. Every
text role passes 4.5:1 on its ground in both themes.

| Role            | Day                 | Night            | Use                                                    |
| --------------- | ------------------- | ---------------- | ------------------------------------------------------ |
| `--ground`      | Alkali `#ECEDEA`    | Basalt `#2A2724` | Page and surface background; the tile.                 |
| `--ink`         | Granite `#45423E`   | Alkali `#ECEDEA` | Text; the first nibble.                                |
| `--muted`       | Shale `#6B6762`     | Ash `#A8A49D`    | Secondary text, captions.                              |
| `--sky`         | `#38639A`           | `#7FA7D3`        | Accent; the second nibble. Links, statuses, focus.     |
| `--sage`        | `#8B9B86`           | `#9DAE98`        | Marks and surfaces only. 2.9:1 on Alkali — never text. |
| `--sage-text`   | Sagebrush `#5F6E5A` | Sage `#9DAE98`   | Sage where it must carry words.                        |
| `--bitterbrush` | `#D2A93A`           | `#DDB447`        | Held in reserve. Never text.                           |
| `--rule`        | `#cfd1cb`           | `#4a4642`        | Hairlines and borders.                                 |

Sky by day was nudged from `#3F6FA3` to `#38639A` to pass as small text. The
names are the Owens Valley's: the dry lake, the Sierra, the valley floor, the
May bloom, the tablelands north of Bishop.

Theme selection, as shipped on `/style`: day is the default; night applies
under `prefers-color-scheme: dark` unless `html[data-theme="light"]`, and
always under `html[data-theme="dark"]`.

## Geometry

Both forms of the mark are built from four numbers and nothing else, in one
unit:

| Name | Value | Where                                                                      |
| ---- | ----- | -------------------------------------------------------------------------- |
| cell | 10    | Every cell is 10 × 10 with corner radius 2.                                |
| gap  | 3     | Between cells within a nibble.                                             |
| seam | 7     | Between the two nibbles — in the row, and between the rows of the stack.   |
| bite | r 8   | A circle removed, centred 1 unit outside the last cell's top-right corner. |

Cells fill from `--ink` (first nibble) and `--sky` (second nibble). The bite
is a mask, not a fill, so it shows whatever is behind the mark.

### The row (the logo)

viewBox `0 0 105 10`. Cells at x = 0, 13, 26, 39 (ink) and 56, 69, 82, 95
(sky), y = 0. Bite: circle at (106, −1), r 8.

### The stack (the icon)

viewBox `0 0 49 27`. Sky row at y = 0, ink row at y = 17 (cell 10 + seam 7),
cells at x = 0, 13, 26, 39. Bite: circle at (50, −1), r 8. Sky is on top so
the bite stays at the top right, exactly where the row has it, full size and
outward-facing; read top to bottom it is a horizon.

### The tile

viewBox `0 0 64 64`, a square of `--ground` with corner radius 14, the stack
translated to (7.5, 18.5). For app icons and favicons. It follows the theme:
Alkali by day, Basalt at night. The reference SVG, with a media query so the
favicon follows the OS theme, is `src/web/public/style/icon.svg`.

## Lockups

Two, and the only thing that decides between them is height.

- **Above** (primary): the row above the name, left edges aligned on ink, the row
  three quarters of the name's ink width, one seam between them. Posters, the site,
  anywhere with room.
- **Beside** (low-height alternative): the row to the left of the name, standing on
  the baseline exactly as tall as the x-height, one seam before the name. Letterhead,
  headers, the top of `/style`.

Both derive from the font metrics, so they hold at any size; `scripts/build-brand-assets.mjs`
is the reference implementation and `brand/` holds the cut files.

The stack is for square places only and is never set beside the name.

## Type

Bricolage Grotesque, one family at two optical sizes. The wordmark is always
lowercase `snackbyte`: weight 800, `opsz` 96, letter-spacing −0.045em.
Headlines take the display cut (800, `opsz` 96, tight tracking); anything
read at length takes the text cut (400, `opsz` 12–14). Sentence case
everywhere; no small caps, no tracked-out labels.

Loaded from Google Fonts on `/style`:
`Bricolage+Grotesque:opsz,wght@12..96,300..800`.

## Voice

Extracted from the docs, which were already sounding like this.

- **Say what it does, then what it doesn't.** "It reports; it does not score." "It
  stores no passwords." The negative clause is the signature move: the seam, in prose.
  Every tool gets one.
- **Short declaratives, semicolons doing logic.** No adjectives that sell. "A console
  over the systems you already use" is a complete pitch with no praise in it.
- **Name from the concept, never the domain.** Slate, Grimoire, Cue; spells, lanes;
  lit, banked, out. A product's name is what it means, not what it handles.
- **Explain before you show.** The concept comes before the code; the style page opens
  with the idea before the mark. The site does the same.
- **Specific over general.** Bishop's community theatre. The 395. Two WEN 56360iX
  generators. A real noun beats a category.
- **Sentence case, plain verbs, one job per sentence.** No all-caps, no "Submit," no
  exclamation marks. Dry humour allowed, rare, never signalled.
- **Two registers, one voice.** The site explains; the tools just say. Same rules,
  fewer of them.
- **The name is lowercase, always.** `snackbyte` in the wordmark and in prose, including
  as the first word of a sentence. The only exception is the legal name (Snackbyte LLC)
  on legal and financial paper.

**The headline:** "Software that knows where it ends." Under it: "snackbyte builds
tools for the community around Bishop, California. Each one does one job, knows only
what it needs, and stops there." "Building something good" is retired.

## Rules

- The row is for wide places; the stack is for square places.
- Above the name whenever there is room; beside it when there is not.
- Cells of ten, gaps of three, a seam of seven, a bite of radius eight.
- The bite is always at the end, always at the top right, always full size.
- Ground and ink swap at night; the accents lift.
- Sage and Bitterbrush are for marks and surfaces, not for words.
- One family, two optical sizes, sentence case.
- The name is lowercase, always; say what it does, then what it doesn't.

## Not yet decided

The type scale and the spacing scale (both to be built from the seam unit). The
downstream surfaces: printed QR codes (`snackbyte-links`
already prints the old mark), business cards, letterhead, email signature,
social. A PNG favicon set for browsers without SVG favicons.

## The old brand

Retired 2026-09-21: the interlocking knot mark, Montserrat wordmark, indigo
`#2E3192` and grey `#B3B3B3` (both Illustrator default swatches). Source files
remain in the designer deliverables (`Snackbyte logo_E`, Jan 2026) outside the
repo; `src/web/Logo.tsx` still carries it until the homepage is rebuilt.
