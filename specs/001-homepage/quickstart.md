# Quickstart: working on the homepage

## Run it

```bash
nvm use                 # Node 24
npm install
npm run dev             # Vite plus the API, with the URL printed
```

The dev server does **not** run prerendering, section generation or the brand asset
copy. A change that looks right in dev can still ship a blank page, so anything being
handed over is checked against the build:

```bash
npm run build
PORT=8787 npm start
open http://localhost:8787/
```

## Change a word on the page

The page's own copy is in `src/web/copy.ts`. Brand-level words — the name, the headline,
the sentence under it, the place — are not there; they come from `@snackbyte/brand` and
changing one means changing the brand guide. See that repository's README.

Every word is bound by the guide's voice rules. The short version: say what it does then
what it doesn't; short declaratives; specific over general; sentence case; no adjectives
that sell; and the name is lowercase everywhere, including a sentence's first word.

## Change how it looks

`src/web/app.css` holds this page's layout and nothing else. Colours, spacing steps,
type steps and the wordmark's cut come from the package's `tokens.css` and `base.css`.

**Never write a brand value here** — no hex, no pixel value that should be a step, no
mark geometry. If the page needs a value the brand does not have, that is a change to the
guide.

## Check it

```bash
npm run check:all       # format, lint, typecheck, test — green at every step
```

Before handing anything over, additionally:

- serve the production build and request every route the change touches;
- read the page at 1280 and 390, in both themes;
- measure contrast on the real rendered colours;
- tab through it and confirm focus is visible;
- confirm the prerendered `dist/index.html` actually contains the words — not just that
  the component renders them.

## Add a page

Two steps, both required, or the build fails loudly: an entry in `src/web/prerender.ts`
so the markup is rendered, and a matching HTML shell so there is a placeholder to render
into. The not-found page is the worked example.
