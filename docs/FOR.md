# Pages made for one person

`src/web/public/for/<name>/<page>/` holds one-off pages built for one person and sent to
them as a link: a plan, a guide, something made for them. The first is
`/for/jan/jet-lag/`.

They differ from client sections (`docs/SECTIONS.md`) in the one way that matters: they
are written in this repository, by whoever works on the site. So they need none of a
section's isolation, and they wear the snackbyte brand.

## Rules

1. **One folder per page**, at `for/<name>/<page>/index.html`, with any script it needs
   beside it. `<name>` is the person's first name, lowercase. There is no index page at
   `/for/` or `/for/<name>/`; both answer 404, so nobody can browse who has a page.
2. **Standalone HTML**, copied verbatim into `dist/`: no build step, no import from `src/`.
3. **The brand comes from `/brand/brand.css`**, which `scripts/copy-brand-assets.mjs`
   writes from `@snackbyte/brand` at build: the font, the tokens and the base rules. The
   page writes no brand value of its own — no hex, no font name — and its `<style>` only
   arranges tokens. `tests/app/for-pages.test.ts` checks every page under `for/`.
4. **`noindex, nofollow`, never linked from the homepage.** The person has the link; nobody
   else needs it.
5. **Personal data: first name only**, and only what the person needs on the page. No
   flight numbers, ages or addresses. Anything they enter stays in their browser.
6. **Logic that changes with their answers lives in a module beside the page**, pure
   where it can be, and is tested in `tests/app/`.
7. **It lands as a chore**: a pull request into `dev`, the gate green, reviewed by the
   owner. If it is time-sensitive, say so, so the promotion to `main` follows the merge.
