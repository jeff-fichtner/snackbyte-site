import { Lockup } from './Logo';
import { VersionChip } from './VersionChip';
import { page } from './copy';

/** The homepage: who snackbyte is, what it does, and how to reach it. */
export function App() {
  return (
    <>
      <main className="page">
        <section className="opening">
          <Lockup />
          <h1 className="headline">{page.headline}</h1>
          <p className="claim">{page.claim}</p>
          <p className="based">{page.based}</p>
        </section>

        <section className="contact">
          <p>
            {page.contact.lead}{' '}
            <a href={`mailto:${page.contact.address}`}>{page.contact.address}</a>
          </p>
        </section>
      </main>
      <VersionChip />
    </>
  );
}
