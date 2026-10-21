# Feature Specification: Privacy policy and terms of service

**Feature Branch**: `002-privacy-terms`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "snackbyte's privacy policy and terms of service, at https://snackbyte.io/privacy and https://snackbyte.io/terms. Source: cross-repo request #cba6aa from snackbyte-auth (2026-10-20), needed now: Google's OAuth brand verification for the "snackbyte" Google OAuth clients needs a privacy policy URL and a terms of service URL on an authorized domain, and Google requires the homepage named on the consent screen to link to that exact privacy policy URL. The pages are the company's; they say what snackbyte does with what its sign-in obtains, state only what is true now, in the brand's voice, and the owner reads both texts before anything is merged or published. Production is the target, not only staging." (The full description, with every fact, is the request text and the conversation of 2026-10-20; the facts are carried into the requirements below.)

## The decision this feature rests on

**Recorded 2026-10-20, confirmed by the owner in conversation:** snackbyte's privacy
policy and terms of service are the company's, on snackbyte.io. They cover the snackbyte
products a person reaches through the snackbyte Google client, and say what snackbyte
does with what that sign-in obtains.

The sign-in itself is performed by nod, snackbyte's identity product. That is how the
information is obtained, not what the policy is about. Whether nod ever carries a policy
of its own does not change this one.

Google treats a change to the privacy policy link on a verified app as a brand change,
which sends the app back through verification. The two URLs are therefore permanent:
once given to Google they do not move, and what changes is the text behind them.

## Clarifications

### Session 2026-10-21

- Q: What address does the privacy policy give for privacy questions? → A:
  `privacy@snackbyte.io`, created by the owner on 2026-10-21 to deliver to them (FR-014).
- Q: Which commitments beyond the facts does the privacy policy make? → A: all three —
  no selling and no advertising; ask and be told, ask and have it deleted; the page
  changes before the practice does. The page does not say how a deletion is done
  (FR-013).
- Q: What legal choices do the terms make? → A: the common small-company pattern, which
  limits what snackbyte owes and adds nothing it must do: California law; the courts of
  Inyo County, no arbitration; as is and as available; no indirect or consequential
  losses, total liability capped at the greater of twelve months' payments and $100;
  changes posted with a new date, no promise of advance notice; severability and entire
  agreement. No uptime, notice or refund promises. The warranty and liability terms get
  their own headings instead of the conventional capitals, which the voice rules out
  (FR-017, FR-017a). Described to the owner as common practice, not legal advice.
- Q: Where is the company, on legal paper? → A: nowhere: "snackbyte is Snackbyte LLC, a
  California limited liability company." The principal office on file is the registered
  agent's address in Sacramento, which is not where snackbyte is; Bishop stays the brand's
  line on the homepage; the venue stays Inyo County (FR-005, FR-016).
- Q: Is the privacy policy approved as written? → A: yes, by the owner on 2026-10-21, as
  in commit 650e600 (FR-021).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Google can verify the snackbyte app (Priority: P1)

Someone at Google reviews the "snackbyte" OAuth app before it may show its name and logo
on the consent screen. They open the app's homepage, follow its link to the privacy
policy, check that the link is the one the consent screen names, read how the app
accesses, uses, stores and shares Google user data, and open the terms of service.

**Why this priority**: it is why the request exists. Until it passes, Google does not
show snackbyte's logo on the consent screen people see when they sign in. Everything else
in this feature serves it.

**Independent Test**: from outside snackbyte's network, request both URLs on production
and the homepage; both answer directly with the page, and the homepage carries a link to
exactly `https://snackbyte.io/privacy`.

**Acceptance Scenarios**:

1. **Given** the production site, **When** anyone requests `https://snackbyte.io/privacy`
   or `https://snackbyte.io/terms`, **Then** the page answers directly, with no redirect
   and no sign-in.
2. **Given** the homepage, **When** a reviewer looks for the privacy policy, **Then** it
   links to pages that resolve to `https://snackbyte.io/privacy` and
   `https://snackbyte.io/terms`.
3. **Given** the privacy policy, **When** a reviewer looks for how Google user data is
   handled, **Then** it says which data snackbyte asks Google for, what is kept, for how
   long, where, and who receives it.

---

### User Story 2 - A person learns what snackbyte keeps about them (Priority: P1)

A person is about to sign in to a snackbyte product with their Google account, or has
already, and wants to know what that means. They reach the privacy policy from Google's
consent screen or from the site, and want plain answers: what is taken from their Google
account, what is kept, for how long, who sees it, and who to ask.

**Why this priority**: the policy has to be true for this reader, not only acceptable to
a reviewer. A policy that passes verification and misleads a person is the worse outcome.

**Independent Test**: give the page to someone who has never heard of snackbyte. In two
minutes they can say what is taken from their Google account, what is kept and for how
long, and where to write to have it deleted.

**Acceptance Scenarios**:

1. **Given** a person who signs in through Google, **When** they read the policy,
   **Then** they learn that only their account id, email address and whether it is
   verified, name and picture are asked for, and nothing else in their Google account.
2. **Given** the same person, **When** they look for passwords, **Then** the policy
   says no password is stored, ever.
3. **Given** a person who wants to know how long sign-in records last, **When** they
   read the policy, **Then** it says what is true today, including that the deletion of
   older sign-in records is not yet built.
4. **Given** a person with a question, **When** they reach the end, **Then** they find
   an address to write to about privacy and one for security problems.

---

### User Story 3 - A person reads the terms they use snackbyte under (Priority: P2)

A person who signs in to a snackbyte product, or is asked to by a consent screen, wants
to know what they are agreeing to: who the agreement is with, what they may and may not
do, and what snackbyte does and does not promise.

**Why this priority**: Google asks for the link and a person may follow it, but the
privacy policy is what verification reads closely. The terms matter; they are second.

**Independent Test**: the page answers at `https://snackbyte.io/terms`; a reader can name
the company the terms are with, two things they may not do, and the law that governs.

**Acceptance Scenarios**:

1. **Given** the terms, **When** a reader looks for who they are dealing with, **Then**
   they find Snackbyte LLC, a California limited liability company.
2. **Given** the terms, **When** a reader looks for what snackbyte promises, **Then**
   it says what it does and what it does not, in the same voice as the rest of the site.

---

### User Story 4 - A visitor learns what this site keeps (Priority: P3)

A visitor to snackbyte.io who never signs in to anything wants to know whether the site
tracks them.

**Why this priority**: the policy is on this site and covers it; the answer is short.

**Independent Test**: the policy says, truthfully, that the site sets no cookies, runs no
analytics, loads its typeface from Google Fonts, and keeps request logs for 30 days.

**Acceptance Scenarios**:

1. **Given** a visitor, **When** they read the part about this site, **Then** they find
   what the server logs, how long it is kept, and that nothing they set in a page is
   sent anywhere.

---

### Edge Cases

- **A fact changes after publication** — the deletion job for sign-in records ships, a
  provider other than Google is added, an app starts using what the sign-in sends. The
  policy is then wrong until it is changed. The URLs stay; the text and its date change
  before, or with, the change in practice. The facts come from another repository, so
  that repository says when they change (see Assumptions).
- **A product is planned but not live.** Slate and FichtnerHof are designed as apps of
  the snackbyte tenant; neither signs anyone in today. The policy must not describe what
  they do with sign-in data, because they do nothing with it yet.
- **The staging site serves the same pages.** Staging is marked not to be indexed, as it
  is for every page; Google is given the production URLs only.
- **A trailing slash.** A visitor who types `/privacy/` or `/terms/` reaches the same
  page, directly, without a redirect.
- **Reading at phone width or at night.** The pages are long text; they read at phone
  width and in both themes, as Principle VII requires of every page.

## Requirements _(mandatory)_

### Functional Requirements

**Where the pages are**

- **FR-001**: The privacy policy MUST answer at `https://snackbyte.io/privacy` and the
  terms of service at `https://snackbyte.io/terms` on production, each directly with the
  page and a success status, with no redirect, no sign-in and no script needed to read it.
  The trailing-slash form of each MUST answer the same way.
- **FR-002**: The homepage MUST link to both pages with links that resolve, on production,
  to exactly those addresses (a link relative to the site, so staging links stay on
  staging).
- **FR-003**: Both pages MUST be indexable on production, unlike the pages that are
  shared by hand (`/style`, `/for/`, client sections). Each carries a title in which the
  name is lowercase and a description that matches what it says.
- **FR-004**: Both pages MUST wear the brand as every other page on the site does, from
  the brand's own source; neither may carry a brand value of its own (Principle I).

**What the privacy policy says** — each statement true on the day it is published

- **FR-005**: It MUST say whose policy it is and what it covers: snackbyte, which is
  Snackbyte LLC, a California limited liability company; this site, and the snackbyte
  products a person reaches by signing in with the snackbyte Google client.
- **FR-006**: About this site, it MUST say: no cookies are set and no analytics run; the
  typeface is loaded from Google Fonts, so the browser asks Google for it; the server
  logs each request — IP address, page, what the browser says it is, the time — and
  those logs are deleted after 30 days; a choice a page remembers stays in the browser
  and is never sent to the server.
- **FR-007**: About signing in, it MUST say: sign-in is through Google today, by OpenID
  Connect, performed by nod, snackbyte's identity product; no password is stored, ever;
  Google is asked for the account id, the email address and whether Google verified it,
  the name and the picture, and nothing else in the Google account.
- **FR-008**: About what is kept, it MUST say that a separate record is kept for each
  tenant (the organisation whose apps a person signs in to), holding: an id snackbyte
  makes for the person (their snackbyte id), which is what an app knows them by, and
  whether the account is active; for each account a person signs in with, the provider,
  the provider's id for it, the email and whether the provider verified it, and the name
  and picture the provider sent; the person's email addresses, each marked verified or
  not; and each sign-in — the person's snackbyte id, the tenant, the app, the provider,
  the IP address, whether it succeeded, and when.
- **FR-009**: About how long, it MUST say: records of a person have no set end and are
  kept until the person asks for them to be deleted (FR-013); sign-in records are set to
  be kept a year, but the job that deletes older ones is not built, so until it is they
  are not deleted; a sign-in in progress is held for minutes, its verifier encrypted; a
  session and its tokens last as long as the session; the identity servers' request logs
  are deleted after 30 days.
- **FR-010**: About cookies on the sign-in pages, it MUST say: one keeps a person signed
  in (`__Host-session`) and one carries a sign-in while it happens; both are strictly
  necessary; the sign-in pages run no tracking and no analytics and load nothing from any
  other host.
- **FR-011**: About what an app receives, it MUST say: the person's snackbyte id, never
  their Google id; which provider they used; and their primary verified email address,
  name and picture, which an app the tenant has not marked as its own asks consent for
  first. It MUST NOT describe what any app does with them beyond that, while no app does
  anything more (see Edge Cases).
- **FR-012**: About where and who, it MUST say: the data is held in Google Cloud, in
  Cloud SQL in the us-central1 region of the United States; provider credentials,
  signing keys and cookie keys are encrypted with Google Cloud Key Management Service;
  and who receives the data: the app a person signs in to (FR-011) and Google Cloud,
  which holds it for snackbyte, and no one else.
- **FR-013**: It MUST make these commitments, and no others: (a) snackbyte does not
  sell what it keeps and does not use it for advertising; (b) a person may ask what is
  kept about them and be told, and ask for it to be deleted and have it deleted; (c) if
  what is kept, or who sees it, changes, the page changes first. It MUST NOT say how a
  deletion is carried out.
- **FR-014**: It MUST give `privacy@snackbyte.io` for privacy questions and
  `security@snackbyte.io` for security problems.
- **FR-015**: It MUST NOT promise anything that is not true on the day it is published —
  no deletion after a year, no practice of an app that is not live — and MUST NOT make a
  statement about children's use, which no fact supports either way.

**What the terms say**

- **FR-016**: The terms MUST say who they are between (a person and Snackbyte LLC, a
  California limited liability company) and what they cover (the same products as
  the privacy policy, and this site); how an account works (a person signs in with an
  account from a provider such as Google, and is responsible for what is done with it);
  what a person may not do (break the law with the products; reach accounts or data that
  are not theirs; disrupt or overload the products); that what a person puts into a
  product stays theirs and is used only to run the product for them; that the products,
  their code and the snackbyte name and mark are snackbyte's; that a person may stop at
  any time and snackbyte may end access for a breach of the terms or stop offering a
  product; and where to report a security problem.
- **FR-017**: The terms MUST state the owner's legal choices, and add nothing snackbyte
  must do: California law governs; disputes are heard in the courts of Inyo County,
  California, with no arbitration clause; the products are provided as they are and as
  available, with no implied warranties, as far as the law allows; snackbyte is not
  liable for indirect or consequential losses, and its total liability is limited to
  the greater of what the person paid in the twelve months before the claim and $100,
  as far as the law allows; changed terms are posted with a new date, and using a
  product after that accepts them; if one term fails the rest stand; these terms and
  the privacy policy are the whole agreement. The warranty and liability terms each sit
  under their own heading, in sentence case, never in capitals.
- **FR-017a**: The terms MUST NOT promise availability or uptime, advance notice of
  changes, or refunds.

**Both pages**

- **FR-018**: Each page MUST carry the date its text last changed; a change to the text
  changes the date. The URLs never change.
- **FR-019**: Every word MUST be in the brand's voice (the guide's § Voice): say what it
  does, then what it does not; short declaratives; sentence case and plain verbs; no
  adjectives that sell. The name is `snackbyte`, lowercase; the legal name `Snackbyte
LLC` appears where the pages say who the company is, and nowhere else.
- **FR-020**: Each factual statement in the privacy policy MUST trace to a recorded
  source — snackbyte-auth's schema or record, or a configuration read on a stated date —
  kept with this feature, not on the page.
- **FR-021**: The owner MUST read and approve both texts, as they will be published,
  before anything is merged or published.

### Key Entities

- **The privacy policy**: one page; the company's statement of what it takes, keeps,
  shares and for how long, with the date it last changed. Its URL is permanent.
- **The terms of service**: one page; the agreement between a person and Snackbyte LLC
  for the same products, with the date it last changed. Its URL is permanent.
- **The fact register**: each statement the privacy policy makes, with its source and
  the date it was read. Kept with this feature; it is what a later change is checked
  against.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On production, both URLs and their trailing-slash forms answer with the
  page on the first request, from outside snackbyte's network, with no redirect.
- **SC-002**: The homepage carries links to exactly `https://snackbyte.io/privacy` and
  `https://snackbyte.io/terms`.
- **SC-003**: Every factual statement in the privacy policy has a recorded source; none
  is without one.
- **SC-004**: A first-time reader can say, within two minutes of opening the privacy
  policy, what is taken from their Google account, how long sign-in records are kept,
  and where to write to have their data deleted.
- **SC-005**: Google accepts both URLs when the owner submits the app for brand
  verification (observed by the owner; outside this repository's control).
- **SC-006**: The owner's approval of both texts is recorded before the merge.

## Assumptions

- **One consent screen.** The snackbyte.io and snackbyte.dev clients live in one Google
  Cloud project, snackbyte-auth, which has one consent screen; one pair of URLs serves
  both clients.
- **The homepage Google is given is snackbyte.io.** snackbyte-auth enters the homepage,
  privacy and terms URLs on the consent screen and verifies the domains; that is its
  side of the work, not this repository's.
- **Facts as of 2026-10-20.** The sign-in facts are snackbyte-auth's, from its schema
  and record on that date; the site and logging facts were read from the live
  configuration the same day. When a fact changes, snackbyte-auth, or whoever changes
  it, files a request here, and the page changes first.
- **Not legal advice.** The texts are drafted to be true and plain. Whether a lawyer
  reads them before publication is the owner's choice.
- **No cookie notice.** The site sets no cookie, and the sign-in pages' cookies are
  strictly necessary, so no consent banner is needed and none is added.
- **Staging.** The pages deploy to staging like every other page and are not indexed
  there; Google is given production URLs only.
