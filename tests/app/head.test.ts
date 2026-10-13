// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { color, copy } from '@snackbyte/brand';
import { fillHead } from '../../src/web/head';
import { page } from '../../src/web/copy';

const src = fileURLToPath(new URL('../../src', import.meta.url));
const read = (file: string) => readFileSync(join(src, 'web', file), 'utf8');

describe('the pages’ heads', () => {
  it('take every value from the brand and the copy', () => {
    const index = fillHead(read('index.html'));
    expect(index).not.toContain('%head:');
    expect(index).toContain(`<title>${copy.name}</title>`);
    expect(index).toContain(`name="description" content="${page.claim} ${page.based}"`);
    expect(index).toContain(`property="og:description" content="${copy.headline}"`);
    expect(index).toContain(`content="${color.ground.day}"`);
    expect(index).toContain(`content="${color.ground.night}"`);

    const notFound = fillHead(read('404.html'));
    expect(notFound).not.toContain('%head:');
    expect(notFound).toContain(`name="description" content="${page.notFound.line}"`);
    expect(notFound).toContain(`content="${color.ground.day}"`);
    expect(notFound).toContain(`content="${color.ground.night}"`);
  });

  it('fails the build on a value it does not have, naming it', () => {
    expect(() => fillHead('<title>%head:nope%</title>')).toThrow('%head:nope%');
  });
});

describe('no brand value is written in this repository', () => {
  it('has no colour literal anywhere in the app source', () => {
    // Client sections under public/ are their own documents, outside the brand.
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (path !== join(src, 'web', 'public')) walk(path);
        } else if (/\.(ts|tsx|html|css)$/.test(entry.name)) {
          files.push(path);
        }
      }
    };
    walk(src);

    const hits = files.flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/#[0-9a-f]{3,8}\b/gi)].map(
        (m) => `${relative(src, file)}: ${m[0]}`,
      ),
    );
    expect(files.length).toBeGreaterThan(5);
    expect(hits).toEqual([]);
  });
});
