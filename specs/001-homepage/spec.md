# Feature Specification: The homepage

**Feature Branch**: `001-homepage`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "The real homepage for snackbyte.io — replacing the holding page. What a stranger who was handed a link or a business card needs to see in ten seconds: who snackbyte is, what it does, that the work is real, and how to reach Jeff if they want to. Governed by the constitution at .specify/memory/constitution.md; brand comes from @snackbyte/brand. Client sections are never linked. Open questions to surface as clarifications rather than assume: whether there is contact and in what form, whether any work is listed and which, and whether /style stays reachable."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - The stranger with a link (Priority: P1)

Someone has been handed `snackbyte.io` — on a business card, in an email signature, by a
person at a theatre meeting, or as a QR code on something printed. They open it on a
phone, probably standing up, and give it about ten seconds. They want to know: is this a
real thing, what does it do, and does the person behind it seem competent.

**Why this priority**: this is the only audience the page has. Everyone else — a peer, a
future client, the owner himself — is reading the same screen with more context. If this
visitor leaves able to describe snackbyte to someone else in one sentence, the page has
worked; nothing else on it matters as much.

**Independent Test**: show the page to a person who has never heard of snackbyte for ten
seconds, take it away, and ask them what it does and who it is for. Delivers value on its
own: this story alone is a complete, shippable homepage.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on a phone, **When** the page finishes loading,
   **Then** the name, what snackbyte does, and where it is are all visible without
   scrolling.
2. **Given** a visitor who reads only the largest line of text, **When** they stop
   reading, **Then** they have a true statement about what snackbyte does — not a slogan
   that could belong to any software company.
3. **Given** a visitor with a slow connection, **When** the page first paints, **Then**
   the words are already there rather than arriving after a delay.
4. **Given** a visitor whose device is set to dark mode, **When** the page loads,
   **Then** it is dark, and every piece of text is legible against its background.

---

### User Story 2 - The visitor who wants to make contact (Priority: P2)

A visitor decides snackbyte might be able to help them — with a theatre's scheduling, a
small organisation's tool, a piece of software they cannot buy off a shelf. They want to
say so. Today there is no way to do that from the page at all.

**Why this priority**: it converts interest into a conversation, which is the only action
the page can usefully produce. It is P2 rather than P1 because a visitor who cannot
contact from the page has usually been handed the link _by_ Jeff and already has another
route to him; the page failing story 1 loses them entirely, while failing story 2 only
costs a small number of inbound messages.

**Independent Test**: from the homepage alone, a visitor can initiate contact and knows
what will happen when they do. Testable by following the affordance to its end.

**Acceptance Scenarios**:

1. **Given** a visitor who wants to get in touch, **When** they look at the page,
   **Then** there is exactly one obvious way to do so.
2. **Given** a visitor who uses that route, **When** they act on it, **Then** nothing
   asks them to create an account, accept tracking, or fill in more than they offered.

---

### User Story 3 - The visitor who wants evidence (Priority: P3)

A visitor believes the claim and wants to see that the work exists — that this is not a
page describing an intention. They look for something concrete: a thing built, for
someone real, that is running.

**Why this priority**: it deepens trust for a minority of visitors, and it is the part of
the page most likely to be wrong or stale, because the work it would point at is
client work bound by the section contract or personal projects that are not finished.
Shipping the page without it is viable; shipping it wrong is worse than shipping it
empty.

**Independent Test**: a visitor can name one real thing snackbyte has built after reading
the page.

**Acceptance Scenarios**:

1. **Given** a visitor reading the page, **When** they reach the end, **Then** anything
   presented as work is genuinely finished and genuinely snackbyte's to show.
2. **Given** work is shown, **When** a visitor looks at it, **Then** it is described in
   terms of what it does for the people who use it, not in terms of its technology.
3. **Given** a described piece of work, **When** a visitor looks for a link to it,
   **Then** there is none, and its absence does not read as an omission.

---

### Edge Cases

- **A visitor arrives from a printed QR code** in bright sunlight on a phone held at
  arm's length. The largest text must survive that.
- **A visitor's device requests reduced motion.** Any motion on the page must honour
  that, and the page must be complete without it.
- **The link is pasted into a message, a chat app, or a social post.** The preview that
  appears must be the brand's own card, with the name and the claim, rather than a
  fallback icon.
- **A search engine indexes the page.** It must find a real title and description that
  match what the page says.
- **Someone reaches a URL that does not exist** on the site. They must land somewhere
  that is recognisably snackbyte and offers a way back, not a bare server error.
- **A visitor uses a keyboard only.** Every interactive element must be reachable and
  visibly focused.
- **The page is opened years from now** with no maintenance in between. Nothing on it
  may have quietly become untrue — no "coming soon", no dated claim, no count that
  drifts.

## Requirements _(mandatory)_

### Functional Requirements

**What the page says**

- **FR-001**: The page MUST state what snackbyte does in language a non-technical reader
  understands, without naming a technology.
- **FR-002**: The page MUST identify snackbyte as a real, located business — the place it
  works from is part of what makes it credible.
- **FR-003**: The page MUST NOT claim anything that is not true at the moment it is read,
  and MUST NOT contain a status that goes stale on its own (such as "coming soon" or a
  count of things built).
- **FR-004**: Every word on the page MUST follow the voice recorded in the brand guide,
  including the rule that the name is lowercase everywhere.
- **FR-005**: The page MUST carry the brand's primary lockup, and MUST take every colour,
  space, type step and mark from the brand package rather than restating any of them.

**What the page contains**

- **FR-006**: The page MUST fit its core message — name, what it does, where it is — in
  one screen at a phone size, without scrolling.
- **FR-007**: The page MUST offer exactly one way to make contact: a published email
  address, presented as a link that opens the reader's mail client with nothing
  pre-filled but the recipient. No form, no scheduling link, no third-party service.
- **FR-007a**: That address MUST be a real, monitored address on the snackbyte domain,
  and MUST carry the brand and nothing else — no role word, no environment, no
  department. It is a string a stranger reads and types.
- **FR-008**: The page MUST show that the work is real by describing it in words — a
  small number of concrete things built, named by what they do for the people who use
  them. It MUST NOT link any of them, and MUST NOT name a client without that client's
  agreement.
- **FR-008a**: Anything described MUST be running at the time it is described, and the
  description MUST be true of it today. Nothing planned, and no description that only
  becomes true once the work is finished.
- **FR-008b**: Each description MUST name the product — what it does for the person who
  uses it — rather than the machinery that produces it.
- **FR-008c**: The work described MUST span more than one kind of client, so that a
  reader can place what snackbyte does rather than inferring it is only one thing.
- **FR-008b**: The work described MUST span more than one kind of client, so that a
  reader can place what snackbyte does rather than inferring it is only one thing.
- **FR-009**: The page MUST NOT link to any client section, and MUST NOT expose the
  existence of one.
- **FR-010**: `/style` MUST remain reachable at its URL, unlinked from the homepage and
  `noindex`, exactly as it is today. This feature MUST NOT link it, change it, or remove
  it.

**How the page behaves**

- **FR-011**: The page MUST follow the reader's system theme, with no control to change
  it, and MUST be legible in both.
- **FR-012**: The page's text MUST be present in the document as it is delivered, not
  assembled after loading.
- **FR-013**: The page MUST be usable by keyboard alone, with a visible focus indicator
  on every interactive element, and MUST honour a request for reduced motion.
- **FR-014**: Every piece of text MUST meet a contrast ratio of at least 4.5:1 against
  its background (3:1 for text at 24px and above), in both themes.
- **FR-015**: When the page's URL is shared, it MUST produce a preview showing the
  brand's card, the name, and the page's own description.
- **FR-016**: A request for a URL that does not exist MUST return a page in the brand
  that offers a route to the homepage, and MUST report itself as not found.

### Key Entities

Not applicable — the page holds no data and stores nothing about its visitors.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A person who has never heard of snackbyte can, after ten seconds on the
  page, state in their own words what it does and who it is for.
- **SC-002**: On a phone at 390px wide, the name, the claim and the location are all
  visible without scrolling, in both themes.
- **SC-003**: The page's meaningful content is visible within two seconds on a
  mid-range phone over a typical mobile connection.
- **SC-004**: Every text element passes its contrast threshold in both themes, verified
  rather than assumed.
- **SC-005**: A visitor who wants to make contact can begin doing so in one action from
  the page, without creating an account or accepting tracking.
- **SC-008**: Mail sent to the published address reaches a mailbox that is read, verified
  by sending one.
- **SC-006**: The page contains no statement that will become untrue through the passage
  of time alone.
- **SC-007**: Sharing the URL in a message produces a preview carrying the brand's card
  and the page's own words.

## Assumptions

- **The audience is a stranger, not a peer.** The page is written for a theatre board
  member or a small-business owner rather than for another developer. Where the two
  would want different words, the stranger wins.
- **There is no navigation.** The site is one page plus deliberately-unlinked pages;
  a header menu would imply a site that does not exist.
- **Nothing is collected.** The page has no analytics, no cookies, no consent banner, and
  stores nothing about a visitor. This follows from having nothing to measure and no
  funnel to optimise.
- **English only.** No localisation is in scope.
- **The brand is settled and external.** Colour, type, spacing, the marks and the voice
  come from `@snackbyte/brand`; this feature consumes them and decides none of them. If
  the page needs a value the brand does not have, that is a change to the guide, not to
  this page.
- **The type and spacing scales get their real test here.** They are recorded as a first
  cut; this page running on them is what settles them or sends them back.
- **The holding page is replaced, not extended.** "Coming soon." is retired by this work.
- **Contact is a published address, decided 2026-09-22.** A form was rejected as the only
  thing on the page that could break silently, and a scheduling link as presuming a
  meeting. Some address-scraping spam is accepted as the cost; swapping to a form later
  is a contained change, whereas withdrawing a form is not.
- **`/style` and client sections continue to exist** at their URLs and are untouched by
  this feature.
- **`/style` is slated for replacement** by a different page — the brand's story rather
  than its reference. That is its own unit, backlogged at
  `specs/backlog-brand-page/`, and nothing here depends on it.

## Out of Scope

- Client sections, their contract, and anything under `work/` — governed separately.
- A blog, a writing section, or anything requiring ongoing publication.
- Subdomain apps (`rehearsal.playhouse395.com` and its siblings) and any navigation to
  them.
- Analytics, tracking, A/B testing, or any form of visitor measurement.
- A content management system, or any way to edit the page without a commit.
- Paper surfaces — business cards, letterhead, email signature — tracked in the brand
  guide's rollout list.
- **A live, anonymised activity graph** of the owner's work, in the manner of a commit
  graph, as the page's evidence. Wanted, and deliberately not built here: it would derive
  from Slate, which has no public surface, and it collides with that product's stance
  that it reports rather than scores. Backlogged at `specs/backlog-activity-view/` with
  what it collides with, so it is not rediscovered from scratch.
