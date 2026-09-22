import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/web/App';
import { Mark } from '../../src/web/Logo';

describe('the holding page', () => {
  const html = renderToString(<App />);

  it('carries the name, lowercase, and the headline', () => {
    expect(html).toContain('>snackbyte<');
    expect(html).not.toContain('Snackbyte');
    expect(html).toContain('Software that knows where it ends.');
  });

  it('says where things stand, and links nothing', () => {
    expect(html).toContain('Coming soon.');
    expect(html).not.toContain('href=');
  });
});

describe('the mark', () => {
  it('is eight cells, four ink then four sky, filled from the theme', () => {
    const svg = renderToString(<Mark />);
    const fills = [...svg.matchAll(/fill:var\(--(ink|sky)\)/g)].map((m) => m[1]);
    expect(fills).toEqual(['ink', 'ink', 'ink', 'ink', 'sky', 'sky', 'sky', 'sky']);
  });
});
