# Brand assets

Every file here is generated from `scripts/build-brand-assets.mjs` — the four geometry
numbers and the palette recorded in `docs/BRAND.md`, plus the wordmark outlined from
Bricolage Grotesque at weight 800, optical size 96. Do not edit these by hand; change
the script and run:

```bash
npm run brand:assets
```

The font is fetched once into `.cache/fonts/` (gitignored, OFL). This folder moves with
the brand when it becomes its own package.

| File                                               | What                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `mark-row-{day,night}.svg`                         | The logo mark: one row, two nibbles, the bite. 105 × 10.                                               |
| `icon-stack-{day,night}.svg`                       | The icon: the same two nibbles stacked, sky over ink. 49 × 27.                                         |
| `tile-{day,night}.svg`                             | The icon on a 64 × 64 square of the ground colour, corner 14.                                          |
| `tile.svg`                                         | The tile with a media query: follows the OS theme. For SVG favicons.                                   |
| `row.json`, `stack.json`                           | The two forms as path data with a role per shape, for code that fills from tokens.                     |
| `wordmark-{day,night}.svg`                         | The name alone, outlined.                                                                              |
| `lockup-above-{day,night}.svg`                     | Primary lockup: the row over the name, three quarters its width, one seam apart.                       |
| `lockup-beside-{day,night}.svg`                    | Low-height lockup: the row on the baseline at x-height, one seam before the name.                      |
| `png/*-1200.png`, `png/*-2400.png`                 | The lockups and the row as PNG, for documents and mail that will not take SVG.                         |
| `png/social-{day,night}.png`                       | The 1200 × 630 card: lockup, headline, place. For banners that want a wide image.                      |
| `png/social-square-{day,night}.png`                | The 800 × 800 card: lockup and headline. What the site points Open Graph at, so previews stay compact. |
| `favicon/{day,night}/favicon.ico`                  | 16, 32 and 48, PNG-encoded.                                                                            |
| `favicon/{day,night}/favicon-*.png`                | The same three as PNG.                                                                                 |
| `favicon/{day,night}/apple-touch-icon-180.png`     | iOS home screen.                                                                                       |
| `favicon/{day,night}/icon-192.png`, `icon-512.png` | Android and web app manifest.                                                                          |
| `favicon/{day,night}/icon-maskable-512.png`        | Square-cornered, for platforms that apply their own mask.                                              |

The bite is a computed path, not a mask, so every file renders in any SVG consumer.
Day and night are the same geometry with the palette's day and night values; the
lockups have no background, so a night file is light marks on transparent.
