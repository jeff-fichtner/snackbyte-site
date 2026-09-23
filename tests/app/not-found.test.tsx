import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NotFound } from '../../src/web/NotFound';
import { page } from '../../src/web/copy';

const html = renderToString(<NotFound />);

describe('the not-found page', () => {
  it('says what happened and offers a way back', () => {
    expect(html).toContain(page.notFound.line);
    expect(html).toContain('href="/"');
  });

  it('carries the mark, so a visitor knows where they are', () => {
    expect(html).toContain('aria-label="snackbyte"');
  });

  it('is the only page that links home, and links nothing else', () => {
    expect([...html.matchAll(/<a\b/g)]).toHaveLength(1);
  });
});
