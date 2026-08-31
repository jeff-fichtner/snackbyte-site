// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error — plain JS build script, no types
import { renderSection, buildSections } from '../../scripts/build-sections.mjs';

const section = {
  title: 'Playhouse 395',
  blurb: 'Bishop’s community theatre.',
  pages: [
    { path: 'roadmap', title: 'Schedule Map', blurb: 'What could grow.', status: 'Proposal' },
    {
      path: 'call-board',
      title: 'Call Board',
      blurb: 'Your times.',
      status: 'Running',
      locked: true,
    },
  ],
};

describe('client section index', () => {
  it('links every page in the manifest', () => {
    const html = renderSection(section);
    expect(html).toContain('href="roadmap/"');
    expect(html).toContain('href="call-board/"');
    expect(html).toContain('Schedule Map');
  });

  it('marks locked pages and leaves open ones unmarked', () => {
    const html = renderSection(section);
    expect(html.match(/class="lock"/g)).toHaveLength(1);
  });

  it('is not indexable — sections are shared by link, not listed', () => {
    expect(renderSection(section)).toContain('noindex');
  });

  it('escapes manifest text rather than trusting it as markup', () => {
    const html = renderSection({ ...section, title: '<script>x</script>' });
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('builds only directories that carry a manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'sections-'));
    mkdirSync(join(root, 'with-manifest'));
    mkdirSync(join(root, 'without-manifest'));
    writeFileSync(join(root, 'with-manifest', 'section.json'), JSON.stringify(section));
    const built = buildSections(root);
    expect(built).toEqual(['with-manifest']);
    expect(existsSync(join(root, 'without-manifest', 'index.html'))).toBe(false);
    expect(readFileSync(join(root, 'with-manifest', 'index.html'), 'utf8')).toContain(
      'Playhouse 395',
    );
  });
});
