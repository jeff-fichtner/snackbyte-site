import { Lockup } from './Logo';
import { page } from './copy';

/**
 * The not-found page. The only page on the site that links the homepage — everywhere
 * else, a link is a claim that what is behind it is ready.
 */
export function NotFound() {
  return (
    <main className="page not-found">
      <section className="opening">
        <Lockup />
        <p className="claim">{page.notFound.line}</p>
        <p>
          <a href="/">{page.notFound.home}</a>
        </p>
      </section>
    </main>
  );
}
