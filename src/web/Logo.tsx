import { marks } from '@snackbyte/brand';

/**
 * The mark: one row, two nibbles, a bite. The geometry comes from the brand package,
 * which carries a role per shape rather than a colour, so one SVG serves day and night.
 */
export function Mark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={marks.row.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="snackbyte"
      {...props}
    >
      {marks.row.shapes.map((s, i) => (
        <path key={i} d={s.d} style={{ fill: s.role === 'sky' ? 'var(--sky)' : 'var(--ink)' }} />
      ))}
    </svg>
  );
}

/** The primary lockup: the row above the name. Sized by `--lockup-size` on the element. */
export function Lockup({ className = '' }: { className?: string }) {
  return (
    <div className={`lockup ${className}`.trim()}>
      <Mark className="mark" />
      <span className="wordmark">snackbyte</span>
    </div>
  );
}
