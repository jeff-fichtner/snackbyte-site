# The privacy policy and the terms

`/privacy` and `/terms` are the company's: one privacy policy and one set of terms for
everything Snackbyte LLC runs as itself. Their words are `src/web/legal/privacy.md` and
`src/web/legal/terms.md`; `scripts/build-legal.mjs` renders them at build. The record behind
them, with the owner's decisions and every fact's source, is `specs/002-privacy-terms/`.

**The URLs never move.** `https://snackbyte.io/privacy` is the privacy link on Google's consent
screen for the snackbyte sign-in client, and Google sends an app back through verification when
that link changes. The text behind it changes; the address does not.

## Why one policy

Decided with the owner on 2026-10-21 and 2026-10-22, when the pages shipped.

- **One company.** nod, payments and the apps are all Snackbyte LLC's, run for its own purposes,
  so one company policy covers them.
- **One login.** Every app signs in through nod, and nod uses one Google client, whose consent
  screen holds this one privacy link. Google only ever sees nod. So the sign-in sections cover
  every app at once, playground or serious, and a new app changes nothing at Google.
- **Organised by what happens to data, not by app.** A common core (signing in), one section per
  shared service that handles people's data (payments, when it launches), and a line for an app
  only when it keeps personal data of its own beyond what it receives at sign-in.
- **General before named.** A check first covers an app with a general section, stating what
  any app of its kind keeps as a limit, and names an app only when it keeps something no general
  section can say. A general section may say an app keeps more than a given app does; the owner
  prefers that to a section per app (2026-10-30). It never says less.
- **Templates never appear.** `snackbyte-base` and `snackbyte-npm-base` hold no one's data.
- **Another organisation is responsible for its own people.** A school on its own nod tenant, or a
  client charging its customers through payments, needs its own privacy policy, and snackbyte a
  contract with it: one reusable agreement, written when the first organisation arrives.
- **Personal tools are not covered.** Slate's Calendar client, snackbyte-mail, snackbyte-macros,
  bed-generators and web-host are Internal or in Testing on Google. A product gets its section
  before its consent screen is published, and no other consent screen points at `/privacy` until
  that section exists; as written, the page says nothing else is asked of a Google account.

## The check

Run it when an app or service is about to be public, and when a public one starts doing
something new. A personal, Internal or Testing app never needs it.

| If it…                                                                           | the policy must say                                                         |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1. knows who someone is (signs them in)                                          | what is taken, kept, and who receives it. nod: covered                      |
| 2. takes money                                                                   | the payment provider as a recipient; purchases and receipts, and how long   |
| 3. keeps what people put in (accounts, content, uploads, answers)                | what it stores about a person beyond sign-in                                |
| 4. sends personal data to another company (payments, email, hosting, AI, errors) | who receives what. Google Cloud: covered                                    |
| 5. reaches into someone's other accounts (their Calendar, Drive, Gmail)          | what it reads or writes, with Google's limited-use wording for those scopes |
| 6. watches visitors (request logs, click tracking, analytics, cookies)           | what is logged or set, and for how long. snackbyte.io and nod: covered      |
| 7. sends people messages (receipts, sign-in mail, newsletters)                   | what is sent and how to stop it; a newsletter brings consent rules          |
| 8. is used by children or students                                               | usually the organisation's policy; perhaps an age line in the terms         |

An app that signs in through nod and keeps nothing beyond the policy's "What an app keeps" (a
session within 30 days, a sign-in for minutes, a record of first and last sign-in under the
snackbyte id, sign-in cookies only, request logs for 30 days, all in Google Cloud) needs no change
to the policy; the check records it under Checked. An app that keeps more gets a section of its
own.

If a row applies, file a request here (`ops request snackbyte-site "…"`) naming the row and the
facts, before the app is public or the change ships. The page changes first; the policy promises
so.

## Changing the words

1. Edit `src/web/legal/privacy.md` or `terms.md`, and set the `Last changed` line to the day the
   owner approves the new words.
2. For each factual statement added or changed in the privacy policy, add or change its row in
   `specs/002-privacy-terms/facts.md`: the statement, its source, and the date it was read.
3. The owner reads the words as they will be published and approves them in conversation before
   anything merges.
4. It lands as a chore: a pull request into `dev` with the gate green
   (`tests/app/legal-pages.test.ts` holds the name, the voice and the forbidden promises), then
   staging, then promotion to `main`.

## Checked

- **2026-10-22, snackbyte-links (`go.snackbyte.io`): applies; covered the same day** in the
  policy's "Short links" section. A public snackbyte host. Its server logs each request, kept 30
  days; it sets a cookie for an hour when someone unlocks a password-protected link; click
  tracking is planned in its spec 003 and is not built. Row 6 now, and row 3 when 003 ships.
- **2026-10-22, snackbyte-discord, becoming snackbyte-chat-automations: does not apply yet.** A
  private bot in chosen servers; its database holds routing and role configuration, no member
  data. Rows 3 and 4 apply when it opens to other communities.
- **2026-10-22, pxp-stripe-webhooks: not snackbyte's.** A client's magazine store; its buyers
  are the client's, covered by the client's privacy policy. Nothing here applies.
- **2026-10-30, Concourse (snackbyte-ops-view, `concourse.snackbyte.io`): covered by "What an
  app keeps", which this check added; not named.** Its sign-in page is public; only people on
  its access list get in. Rows 1, 3 and 6 apply within that section's limits; row 4 is Google
  Cloud alone. Its access list is the owner's own entries, not kept about anyone using it.
