# Fact register: the privacy policy

Every factual statement the privacy policy makes, where it is true, and when that was
read. A change to a fact changes its row, the policy's sentence and the policy's date line
in one commit. Commitments (FR-013) are promises, not facts, and are listed last.

| # | Statement | Source | Read |
| --- | --- | --- | --- |
| F1 | snackbyte is Snackbyte LLC, a California company in Bishop, California | The LLC's California formation document and state notice (`~/snackbyte/legal/llc-formation/`); `@snackbyte/brand` `copy.based` | 2026-10-20 |
| F2 | snackbyte.io sets no cookies | This repository: no `Set-Cookie` and no `document.cookie` anywhere in `src/`; route contract 001, "What the site never does" | 2026-10-20 |
| F3 | snackbyte.io runs no analytics | This repository: no analytics or tag script in any page under `src/web/` | 2026-10-20 |
| F4 | The site loads its typeface from Google Fonts | `/kit/page.css` and the homepage's head import `fonts.googleapis.com`; the only other host any page loads from | 2026-10-20 |
| F5 | The server logs each request: IP address, page, user agent, time | A live Cloud Run request log entry for `snackbyte-site` in `snackbyte-apps` (fields `remoteIp`, `requestUrl`, `userAgent`, `timestamp`) | 2026-10-20 |
| F6 | Those logs are deleted after 30 days | `gcloud logging buckets list --project=snackbyte-apps`: `_Default` retention 30 days | 2026-10-20 |
| F7 | A choice a page remembers stays in the browser and is never sent | `/style` keeps the theme in `localStorage`; `/for/` pages keep answers in the browser (`docs/FOR.md` rule 5); no page posts them | 2026-10-20 |
| F8 | Sign-in is through Google today, by OpenID Connect, performed by nod | snackbyte-auth `README.md`, Status: "People sign in through Google" | 2026-10-20 |
| F9 | No password is stored, ever | snackbyte-auth `README.md`: "It stores no passwords" | 2026-10-20 |
| F10 | Google is asked for `openid email profile` and nothing else | snackbyte-auth `docs/ARCHITECTURE.md` line 252; `specs/004-sign-in/evidence/stage-i.md` | 2026-10-20 |
| F11 | A separate record per tenant: snackbyte id (the subject an app receives), status | Request #cba6aa, from snackbyte-auth's schema; README: "a person id never reused across tenants" | 2026-10-20 |
| F12 | Per provider account: provider, provider's id, email and whether verified, name and picture | Request #cba6aa, from snackbyte-auth's schema | 2026-10-20 |
| F13 | Email addresses, each marked verified or not | Request #cba6aa, from snackbyte-auth's schema | 2026-10-20 |
| F14 | Each sign-in: snackbyte id, tenant, app, provider, IP address, outcome, time | Request #cba6aa, from snackbyte-auth's schema | 2026-10-20 |
| F15 | Records of a person have no set end | snackbyte-auth: persons are disabled, not deleted (README, operator CLI); no deletion job exists | 2026-10-20 |
| F16 | Sign-in records are set to a year, and the deleting job is not built | Request #cba6aa | 2026-10-20 |
| F17 | A sign-in in progress lives minutes, its verifier encrypted | Request #cba6aa | 2026-10-20 |
| F18 | A session and its tokens last as long as the session | Request #cba6aa; README: "Refresh tokens rotate on use and die with the session" | 2026-10-20 |
| F19 | The identity servers' request logs are deleted after 30 days | `gcloud logging buckets list --project=snackbyte-auth`: `_Default` retention 30 days; services `broker` and `broker-staging` on Cloud Run | 2026-10-20 |
| F20 | Two cookies on the sign-in pages: `__Host-session` and the sign-in's own; strictly necessary | Request #cba6aa | 2026-10-20 |
| F21 | The sign-in pages run no tracking or analytics and load nothing from another host | Request #cba6aa; README: "Every stylesheet and font comes from the broker's own host" | 2026-10-20 |
| F22 | An app receives the snackbyte id, never the Google id, and the provider | Request #cba6aa; README: "The ID token's `sub` is our person id… it carries `idp`" | 2026-10-20 |
| F23 | It also receives primary verified email, name and picture; an app not marked first-party asks consent first | Request #cba6aa; README: "an app the tenant did not mark first-party asks their consent once" | 2026-10-20 |
| F24 | (Not stated on the page; it is why FR-011 keeps the page silent on what apps do.) No snackbyte product does more with what it receives, today | No product repository references nod's host or library; only a test app is registered (snackbyte-auth `specs/004-sign-in/spec.md`) | 2026-10-21 |
| F25 | Data is held in Google Cloud, Cloud SQL, us-central1 | Request #cba6aa | 2026-10-20 |
| F26 | Provider credentials, signing keys and cookie keys are encrypted with Cloud KMS | Request #cba6aa; README: "Secrets are sealed with the environment's key" | 2026-10-20 |
| F27 | No one but the app signed in to and Google Cloud receives the data | F22–F25; no other processor in snackbyte-auth's record | 2026-10-21 |
| F28 | Security problems go to security@snackbyte.io | Request #cba6aa | 2026-10-20 |
| F29 | Privacy questions go to privacy@snackbyte.io | The owner, 2026-10-21: address created to deliver to them | 2026-10-21 |
| F30 | What Google sends is used to sign you in and to tell the app you sign in to who you are | snackbyte-auth `README.md`, Sign-in: the broker checks Google's ID token and issues its own, whose `sub` is the person id | 2026-10-21 |
| F31 | The site's request logs are used to keep it running | Practice: they are read to diagnose outages (the 2026-10-21 staging investigation, request #3e4c6c) and for nothing else on record | 2026-10-21 |

## Commitments (promises, owner-approved 2026-10-21)

- C1: snackbyte does not sell what it keeps and does not use it for advertising.
- C2: a person may ask what is kept about them and be told, and have it deleted.
- C3: if what is kept, or who sees it, changes, the page changes first.
