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
      path: 'archive',
      title: 'Archive',
      blurb: 'Past weeks.',
      status: 'Running',
      locked: true,
    },
    {
      url: 'https://rehearsal.playhouse395.com/',
      title: 'Call Board',
      blurb: 'Your times.',
      status: 'Live',
    },
  ],
};

describe('client section index', () => {
  it('links every page in the manifest', () => {
    const html = renderSection(section);
    expect(html).toContain('href="roadmap/"');
    expect(html).toContain('href="archive/"');
    expect(html).toContain('Schedule Map');
  });

  it('sends a url page straight to its own host, with no local page in between', () => {
    const html = renderSection(section);
    expect(html).toContain('href="https://rehearsal.playhouse395.com/"');
    expect(html).not.toContain('href="call-board/"');
    expect(html).toMatch(/class="ext"/);
  });

  it('refuses a page that names neither a path nor a url', () => {
    expect(() =>
      renderSection({ ...section, pages: [{ title: 'Nowhere', blurb: '', status: '' }] }),
    ).toThrow(/neither/);
  });

  it('refuses a page that names both, rather than silently picking one', () => {
    const both = {
      path: 'here',
      url: 'https://elsewhere.test/',
      title: 'Both',
      blurb: '',
      status: '',
    };
    expect(() => renderSection({ ...section, pages: [both] })).toThrow(/both/);
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

  it('renders exactly as before when nothing is marked new', () => {
    const html = renderSection(section);
    expect(html).not.toContain('class="fresh"');
    expect(html).not.toContain('Everything else');
  });

  it('lifts new pages into their own block above the rest, each listed once', () => {
    const withNew = {
      ...section,
      pages: [
        section.pages[0],
        { ...section.pages[1], new: true, image: 'archive/cover.jpg' },
        { ...section.pages[2], new: true },
      ],
    };
    const html = renderSection(withNew);
    const fresh = html.indexOf('class="fresh"');
    const rest = html.indexOf('Everything else');
    expect(fresh).toBeGreaterThan(-1);
    expect(rest).toBeGreaterThan(fresh);
    // the new pages sit in the new block, the old one below it, and nobody appears twice
    expect(html.indexOf('href="archive/"')).toBeLessThan(rest);
    expect(html.indexOf('href="https://rehearsal.playhouse395.com/"')).toBeLessThan(rest);
    expect(html.indexOf('href="roadmap/"')).toBeGreaterThan(rest);
    expect(html.match(/href="archive\/"/g)).toHaveLength(1);
    expect(html.match(/class="badge"/g)).toHaveLength(2);
    // a new page with an image shows it; one without still renders, just without a picture
    expect(html).toContain('src="archive/cover.jpg"');
    expect(html.match(/<img /g)).toHaveLength(1);
  });

  it('refuses a "new" that is not true or false, rather than guessing', () => {
    const bad = { ...section, pages: [{ ...section.pages[0], new: 'yes' }] };
    expect(() => renderSection(bad)).toThrow(/new/);
  });

  it('refuses an image path that leaves the section or is absolute', () => {
    for (const image of ['../other/x.jpg', '/x.jpg', 'https://elsewhere.test/x.jpg']) {
      const bad = { ...section, pages: [{ ...section.pages[0], new: true, image }] };
      expect(() => renderSection(bad), image).toThrow(/image/);
    }
  });

  it('fails the build when a new page names an image that is not there', () => {
    const root = mkdtempSync(join(tmpdir(), 'sections-'));
    mkdirSync(join(root, 'client'));
    const manifest = {
      ...section,
      pages: [{ ...section.pages[0], new: true, image: 'roadmap/missing.jpg' }],
    };
    writeFileSync(join(root, 'client', 'section.json'), JSON.stringify(manifest));
    expect(() => buildSections(root)).toThrow(/missing\.jpg/);
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
