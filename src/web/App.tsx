import { ArrivingLockup } from './ArrivingLockup';
import { VersionChip } from './VersionChip';
import { page } from './copy';

/** The homepage: who snackbyte is, what it does, and how to reach it. */
export function App() {
  return (
    <>
      <main className="page">
        <section className="opening">
          <ArrivingLockup />
          <h1 className="headline">{page.headline}</h1>
          {/* One statement: what snackbyte does, then where it is. The address is the
              claim's second sentence, not a caption under it. */}
          <p className="claim">{`${page.claim} ${page.based}`}</p>
        </section>

        <section className="contact">
          <p>
            {page.contact.lead}{' '}
            <a href={`mailto:${page.contact.address}`}>{page.contact.address}</a>
          </p>
          {/* Quiet, under the one thing the page asks for. Google's verification of the
              sign-in looks for the privacy policy here, at the address it was given. */}
          <p className="legal">
            <a href="/privacy">{page.legal.privacy}</a>
            <a href="/terms">{page.legal.terms}</a>
          </p>
        </section>
      </main>
      <VersionChip />
    </>
  );
}
