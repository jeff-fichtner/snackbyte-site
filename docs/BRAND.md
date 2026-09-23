# snackbyte brand

**The brand moved out of this repository on 2026-09-22.** It is one thing that every
snackbyte app consumes, so it is no longer owned by its first consumer.

- **The guide** — <https://github.com/jeff-fichtner/snackbyte-brand>. The authority:
  values as data (`tokens.json`), the same facts with the reasoning (`GUIDE.md`), the
  voice, and the rollout list. A brand decision is made there.
- **The implementation** — <https://github.com/jeff-fichtner/snackbyte-brand-render>.
  Compresses the guide into CSS, TypeScript and SVG, and publishes `@snackbyte/brand`.
  It holds no values.
- **The readable version** — <https://snackbyte.io/style/>, served from this repo.
- **The exploration that led here** — `artifacts/brand-directions.html`, whose published
  versions are the rounds of options that were eliminated.

This site consumes the package: `tokens.css` and `base.css` in `src/web/main.tsx`, the
mark's path data in `src/web/Logo.tsx`, and the favicons and link-preview card copied
into `public/` at build by `scripts/copy-brand-assets.mjs`. Page styling lives in
`src/web/app.css`.

To change a brand value, change it in the guide — not here. See the guide's README for
the three steps.
