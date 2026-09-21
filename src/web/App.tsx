import { Lockup } from './Logo';
import { VersionChip } from './VersionChip';

/** The homepage, while the site is being built: the lockup, the headline, where things stand. */
export function App() {
  return (
    <>
      <main className="hold">
        <div className="stand">
          <Lockup />
          <h1 className="headline">Software that knows where it ends.</h1>
          <p className="soon">
            <span className="dot" aria-hidden="true" />
            Coming soon.
          </p>
        </div>
        <footer className="foot">
          <span>Bishop, California.</span>
          <a href="/style/">The style, so far.</a>
        </footer>
      </main>
      <VersionChip />
    </>
  );
}
