# Quickstart: Privacy policy and terms of service

## Change the words

Edit `src/web/legal/privacy.md` or `src/web/legal/terms.md`, change the date line, and,
for the privacy policy, the matching row in `specs/002-privacy-terms/facts.md`. The owner
approves the words before the change merges.

## Build and serve

```bash
npm run build
npm start
```

## Check the routes

With the server running on its configured port:

```bash
for p in /privacy /privacy/ /terms /terms/; do curl -s -o /dev/null -w "%{http_code} %{content_type} %{redirect_url} $p\n" "http://localhost:${PORT:?set PORT}$p"; done
curl -s "http://localhost:${PORT:?set PORT}/" | grep -o 'href="/\(privacy\|terms\)"'
```

Expected: four lines of `200 text/html; charset=utf-8` with an empty redirect, then the
two homepage links.

## Check production after promotion

```bash
for p in /privacy /privacy/ /terms /terms/; do curl -s -o /dev/null -w "%{http_code} %{redirect_url} $p\n" "https://snackbyte.io$p"; done
curl -s https://snackbyte.io/ | grep -o 'href="/\(privacy\|terms\)"'
curl -sI https://snackbyte.io/privacy | grep -i x-robots-tag
```

Expected: four `200` with no redirect, both links, and no `X-Robots-Tag` header.

## Look at it

Screenshots at 390 and 1280 px, day and night, from the built site served locally, with
headless Chrome. They are kept in `specs/002-privacy-terms/screenshots/`.
