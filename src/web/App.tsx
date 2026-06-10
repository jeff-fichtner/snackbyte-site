import { Logo } from './Logo';
import { VersionChip } from './VersionChip';

const INDIGO = '#2E3192';

/** The Snackbyte homepage — a minimal, on-brand coming-soon holding page. */
export function App() {
  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          textAlign: 'center',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: INDIGO,
          background: 'radial-gradient(120% 120% at 50% 10%, #ffffff 0%, #eef0fb 100%)',
          padding: '2rem',
        }}
      >
        <Logo style={{ width: 'min(420px, 80vw)', height: 'auto' }} />
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            lineHeight: 1.6,
            color: '#4b5563',
          }}
        >
          Building something good.
        </p>
        <p
          style={{
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: INDIGO,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: INDIGO,
            }}
          />
          Coming soon
        </p>
      </main>
      <VersionChip />
    </>
  );
}
