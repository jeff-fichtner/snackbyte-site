# Privacy policy

Last changed October 21, 2026.

snackbyte is Snackbyte LLC, a California limited liability company. This policy covers this site and the snackbyte products you sign in to with Google. It says what we keep, why, for how long, and who sees it.

We don't sell what we keep, and we don't use it for advertising.

## This site

snackbyte.io sets no cookies and runs no analytics. It loads its typeface from Google Fonts, so your browser asks Google for the font.

Our server logs each request: your IP address, the page, what your browser says it is, and the time. We use the logs to keep the site running, and Google Cloud deletes them after 30 days.

A page that remembers a choice, such as a colour theme or answers you type, keeps it in your browser. It is never sent to us.

## Signing in with Google

Today you sign in to snackbyte's products with your Google account, through OpenID Connect. The part of snackbyte that does this is called nod. It stores no passwords, ever: Google checks who you are and tells us.

We ask Google for your account's id, your email address and whether Google has verified it, your name, and your picture. We ask for nothing else in your Google account.

We use what Google sends to sign you in, and to tell the app you sign in to who you are.

## What we keep

For each organisation whose apps you sign in to, which we call a tenant, we keep a separate record of you:

- **You:** an id we make for you, your snackbyte id, which is what an app knows you by; and whether your account is active.
- **Each account you sign in with:** the provider (Google, today), the provider's id for that account, your email address and whether the provider verified it, and the name and picture the provider sent.
- **Your email addresses,** each marked verified or not.
- **Each sign-in:** your snackbyte id, the tenant, the app, the provider, your IP address, whether it worked, and when.

While you sign in, we hold the sign-in's state, with its PKCE verifier encrypted. While you are signed in, we hold your session and its tokens. The sign-in servers also log each request, as this site's server does.

## How long we keep it

Your records have no set end. They are kept until you ask us to delete them.

Each tenant is set to keep sign-in records for a year. The job that deletes older ones is not built yet, so until it is, sign-in records are not deleted.

A sign-in in progress is held for minutes. A session and its tokens last as long as the session. The sign-in servers' request logs are deleted after 30 days.

## Cookies on the sign-in pages

Signing in sets two cookies: `__Host-session`, which keeps you signed in, and one that carries a sign-in while it happens. Both are strictly necessary. The sign-in pages run no tracking and no analytics, and load nothing from any other site.

## What an app receives

When you sign in to an app, it receives your snackbyte id, never your Google id, and which provider you used. It also receives your primary verified email address, your name and your picture; an app the tenant has not marked as its own asks you first.

## Where it is kept, and who sees it

It is held in Google Cloud, in Cloud SQL, in the us-central1 region of the United States. Provider credentials, signing keys and cookie keys are encrypted with Google Cloud Key Management Service.

The app you sign in to receives what is listed above, and Google Cloud holds all of it for us. No one else receives it.

## What you can ask

Ask what we keep about you, and we will tell you. Ask us to delete it, and we will.

## Changes

If what we keep, or who sees it, changes, this page changes first, and so does the date at the top.

## Contact

Privacy questions: [privacy@snackbyte.io](mailto:privacy@snackbyte.io). Security problems: [security@snackbyte.io](mailto:security@snackbyte.io).
