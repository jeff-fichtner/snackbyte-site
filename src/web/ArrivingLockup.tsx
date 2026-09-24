import { useId } from 'react';
import { copy, geometry } from '@snackbyte/brand';

/**
 * The lockup, arriving. The mark's eight cells are treated as the eight bits of a byte and
 * step through the name one character at a time — each letter's code, most significant bit
 * first — while the wordmark types itself in step. Then every cell fills, and the bite is
 * taken out of the last one.
 *
 * Every lowercase letter's first nibble is 0110 or 0111, so the ink half barely moves and
 * the sky half does the talking: the two nibbles behave differently because that is how
 * the encoding works.
 *
 * It is CSS only, rendered into the page at build, so it plays from first paint with no
 * script and cannot delay the words. At rest, and under reduced motion, it is exactly the
 * mark. Nothing here is a brand value: the geometry and the name come from the package, and
 * the sequence is derived from the name.
 */

/** How long each letter is shown, then how long the full byte holds before the bite. */
const LETTER_MS = 140;
const HOLD_MS = 160;
const BITE_MS = 320;
/** How visible a cell is when its bit is 0: present, so the byte keeps its shape. */
const OFF = 0.16;

/** The eight bits of a character's code, most significant first. */
const bitsOf = (ch: string) =>
  Array.from({ length: 8 }, (_, i) => (ch.charCodeAt(0) >> (7 - i)) & 1);

export function ArrivingLockup() {
  const id = useId().replace(/:/g, '');
  const letters = [...copy.name];
  const { cell, radius, gap, seam, bite } = geometry;

  // the row's cell positions, derived exactly as the mark itself is
  const step = cell + gap;
  const secondNibble = 3 * step + cell + seam;
  const xs = Array.from({ length: 8 }, (_, i) =>
    i < 4 ? i * step : secondNibble + (i - 4) * step,
  );
  const width = xs[7] + cell;

  const typed = letters.length * LETTER_MS;
  const total = typed + HOLD_MS;
  const at = (ms: number) => `${((ms / total) * 100).toFixed(3)}%`;

  const css = [
    // one keyframe set per cell: its bit in each letter, then on for good
    ...xs.map((_, i) => {
      const frames = letters
        .map((ch, k) => `${at(k * LETTER_MS)}{fill-opacity:${bitsOf(ch)[i] ? 1 : OFF}}`)
        .join('');
      return `@keyframes a${id}c${i}{${frames}${at(typed)}{fill-opacity:1}100%{fill-opacity:1}}`;
    }),
    `.a${id}>rect{animation-duration:${total}ms;animation-timing-function:steps(1,end);animation-fill-mode:both}`,
    ...xs.map((_, i) => `.a${id} .c${i}{animation-name:a${id}c${i}}`),
    `@keyframes a${id}bite{from{transform:scale(0)}to{transform:scale(1)}}`,
    `.a${id} .bite{transform-box:fill-box;transform-origin:center;animation:a${id}bite ${BITE_MS}ms cubic-bezier(.3,1.6,.5,1) ${total}ms both}`,
    `@keyframes a${id}letter{from{opacity:0}to{opacity:1}}`,
    // steps(1,start) jumps at the start of the window and holds. steps(1,end) jumps exactly at
    // its end, and a finished animation's time can round to just short of that boundary —
    // which is how the last letter once stayed invisible after every other one appeared.
    `.a${id}name>span{animation:a${id}letter 1ms steps(1,start) both}`,
    ...letters.map(
      (_, k) => `.a${id}name>span:nth-child(${k + 1}){animation-delay:${k * LETTER_MS}ms}`,
    ),
    `@media (prefers-reduced-motion:reduce){.a${id}>rect,.a${id} .bite,.a${id}name>span{animation:none}}`,
  ].join('\n');

  return (
    <div className="lockup">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <svg
        className={`mark a${id}`}
        viewBox={`0 0 ${width} ${cell}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={copy.name}
      >
        <defs>
          <mask
            id={`bite${id}`}
            maskUnits="userSpaceOnUse"
            x={-cell}
            y={-2 * cell}
            width={width + 3 * cell}
            height={cell * 5}
          >
            <rect x={-cell} y={-2 * cell} width={width + 3 * cell} height={cell * 5} fill="white" />
            <circle className="bite" cx={xs[7] + bite.cx} cy={bite.cy} r={bite.r} fill="black" />
          </mask>
        </defs>
        {xs.map((x, i) => (
          <rect
            key={i}
            className={`c${i}`}
            x={x}
            y={0}
            width={cell}
            height={cell}
            rx={radius}
            style={{ fill: i < 4 ? 'var(--ink)' : 'var(--sky)' }}
            mask={i === 7 ? `url(#bite${id})` : undefined}
          />
        ))}
      </svg>
      <span className={`wordmark a${id}name`}>
        {letters.map((ch, k) => (
          <span key={k}>{ch}</span>
        ))}
      </span>
    </div>
  );
}
