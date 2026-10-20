# Pages made for one person

`src/web/public/for/<name>/<page>/` holds one-off pages built for one person and sent to
them as a link: a plan, a guide, something made for them. The first is
`/for/jan/jet-lag/`.

They differ from client sections (`docs/SECTIONS.md`) in the one way that matters: they
are written in this repository, by whoever works on the site. Like every hosted page, they
look like snackbyte because they link the page kit.

## Rules

1. **One folder per page**, at `for/<name>/<page>/index.html`, with any script it needs
   beside it. `<name>` is the person's first name, lowercase. There is no index page at
   `/for/` or `/for/<name>/`; both answer 404, so nobody can browse who has a page.
2. **Standalone HTML**, copied verbatim into `dist/`: no build step, no import from `src/`.
3. **The look comes from the page kit, `/kit/page.css`**, which
   `scripts/copy-brand-assets.mjs` writes at build: the brand's font, tokens and base rules
   from `@snackbyte/brand`, then the site's components from `src/web/kit/page.css`. Link it
   and nothing else. The page writes no colour or font of its own — no hex, `rgb()`,
   `hsl()` or font name — and its `<style>`, if it has one, only lays out its own parts with
   tokens. `tests/app/for-pages.test.ts` checks every page under `for/`.
   - What the kit gives you — plain HTML styled, the components, the tokens, exhibits — is
     in `docs/SECTIONS.md` § The page kit. One list, for both kinds of page.
   - Need something the kit doesn't have? Add it to the kit, generically named, rather than
     to the page. The kit only grows: never rename or remove a class.
4. **`noindex, nofollow`, never linked from the homepage.** The person has the link; nobody
   else needs it.
5. **Personal data: first name only**, and only what the person needs on the page. No
   flight numbers, ages or addresses. Anything they enter stays in their browser.
6. **Logic that changes with their answers lives in a module beside the page**, pure
   where it can be, and is tested in `tests/app/`.
7. **It lands as a chore**: a pull request into `dev`, the gate green, reviewed by the
   owner. If it is time-sensitive, say so, so the promotion to `main` follows the merge.
