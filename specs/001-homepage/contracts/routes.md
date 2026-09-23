# Contract: what the site answers

The site's external surface. Anything not listed here is a 404.

| Path                                    | Answers with                     | Status  | Notes                                                                    |
| --------------------------------------- | -------------------------------- | ------- | ------------------------------------------------------------------------ |
| `/`                                     | The homepage, prerendered        | 200     | The only page linked from anywhere.                                      |
| `/style/`                               | The style guide page             | 200     | `noindex`. Unlinked; reached by URL. Untouched by this feature.          |
| `/work/<slug>/`                         | A client section's landing page  | 200     | Generated from the section's manifest at build. `noindex`. Never linked. |
| `/work/<slug>/<page>/`                  | A section's page                 | 200     | Standalone HTML owned by the section's contributor.                      |
| `/favicon.svg`                          | The theme-following tile         | 200     | From the brand package.                                                  |
| `/favicon.ico`, `/apple-touch-icon.png` | Icons                            | 200     | From the brand package.                                                  |
| `/social.png`                           | The link-preview card, 800 × 800 | 200     | From the brand package. Referenced by the Open Graph tags.               |
| `/api/health`                           | Health JSON                      | 200     | Used by the platform, not by a person.                                   |
| `/api/version`                          | Version JSON                     | 200     | Used by the version chip outside production.                             |
| anything else                           | The not-found page, prerendered  | **404** | New in this feature. Previously answered with the homepage and 200.      |

## Metadata contract

Both prerendered pages carry:

- a `<title>` in which the name is lowercase;
- a description that matches what the page actually says;
- `theme-color` for each colour scheme;
- the icon links above.

The homepage additionally carries Open Graph and Twitter card tags pointing at
`/social.png`, sized 800 × 800, so that a shared link previews compactly rather than as a
banner. The not-found page carries `noindex` and no card — it is not a page anyone should
be sharing.

## What the site never does

- Sets a cookie, or stores anything about a visitor.
- Links a client section from the homepage, or exposes that one exists.
- Redirects. Every path above is served directly.
