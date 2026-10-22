# Contract: what the site answers, with this feature

Adds to `specs/001-homepage/contracts/routes.md`, which still holds for every other path.

| Path | Answers with | Status | Notes |
| --- | --- | --- | --- |
| `/privacy` | The privacy policy | 200 | The address given to Google. Permanent. Indexable on production. |
| `/privacy/` | The same page | 200 | Served directly, not redirected. Canonical is `/privacy`. |
| `/terms` | The terms of service | 200 | The address given to Google. Permanent. Indexable on production. |
| `/terms/` | The same page | 200 | Served directly, not redirected. Canonical is `/terms`. |
| `/` | The homepage, prerendered | 200 | Now also links `/privacy` and `/terms`, under the contact line. |

## Metadata contract

Each page carries:

- a `<title>` with the name lowercase: `snackbyte privacy policy`, `snackbyte terms of
  service`;
- a description that matches what it says;
- `<link rel="canonical">` to `https://snackbyte.io/privacy` or `https://snackbyte.io/terms`;
- the favicon link and `/kit/page.css`, nothing else from this site and nothing from
  another host but what the kit itself loads (the brand's font);
- no robots meta. Staging adds `X-Robots-Tag: noindex` to every response, these included.

## What these pages never do

- Redirect, at either address form.
- Run a script, set a cookie, or store anything about a reader.
- Move. The text changes; the URL does not.
