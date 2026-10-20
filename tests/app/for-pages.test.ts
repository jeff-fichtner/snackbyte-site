import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { type } from '@snackbyte/brand';
// @ts-expect-error — plain JS page script, no types
import * as jetLag from '../../src/web/public/for/jan/jet-lag/plan.js';
// @ts-expect-error — plain JS build script, no types
import { brandStylesheet } from '../../scripts/copy-brand-assets.mjs';

const { buildPlan, clock, normalize, TRIP } = jetLag;

type Card = {
  id: string;
  when: string;
  general: string;
  you: string[];
  warn?: string;
  branches?: { title: string; you: string[]; warn?: string }[];
  why: string;
};

// From the repository root (vitest's root): jsdom replaces the URL global, which file paths can't use.
const FOR_DIR = join(process.cwd(), 'src/web/public/for');

const plan = (answers: Record<string, unknown> = {}): Card[] => buildPlan(answers);
const card = (cards: Card[], id: string): Card => {
  const found = cards.find((c) => c.id === id);
  if (!found) throw new Error(`no card ${id}`);
  return found;
};
/** Every word a card shows, branches included. */
const words = (c: Card): string =>
  [
    c.general,
    ...c.you,
    c.warn ?? '',
    ...(c.branches ?? []).flatMap((b) => [b.warn ?? '', ...b.you]),
    c.why,
  ].join('\n');
const all = (cards: Card[]): string => cards.map(words).join('\n');

describe('clock', () => {
  it('writes times the way people do', () => {
    expect(clock(21 * 60)).toBe('9pm');
    expect(clock(22 * 60 + 30)).toBe('10:30pm');
    expect(clock(70)).toBe('1:10am');
    expect(clock(24 * 60)).toBe('midnight');
    expect(clock(12 * 60)).toBe('12pm');
  });
});

describe('normalize', () => {
  it('drops values the page never offers, so a stale saved answer cannot steer the plan', () => {
    expect(normalize({ coffee: 'maybe', bedtime: '1234', after: 'stay' })).toEqual({
      bedtime: null,
      wake: null,
      coffee: null,
      melatonin: null,
      thursday: null,
      after: 'stay',
    });
    expect(normalize(null).coffee).toBeNull();
    expect(normalize({ bedtime: '1320' }).bedtime).toBe(1320);
  });
});

describe('the plan', () => {
  it('runs from the Italian evenings to the clock change, in order', () => {
    expect(plan().map((c) => c.id)).toEqual([
      'before',
      'flight',
      'landing',
      'nights',
      'thursday',
      'weekend',
      'sunday',
    ]);
  });

  it('pairs every step with the general rule and the reason', () => {
    for (const c of plan()) {
      expect(c.general, c.id).not.toBe('');
      expect(c.why, c.id).not.toBe('');
      expect(c.you.length, c.id).toBeGreaterThan(0);
    }
  });

  it('works out the travel day from the trip, not from hand-written times', () => {
    const cards = plan();
    expect(card(cards, 'flight').you[0]).toContain(`about ${clock(TRIP.romeDeparts)} there`);
    expect(card(cards, 'flight').you[0]).toContain('1:10am in California');
    expect(card(cards, 'landing').when).toContain('about 2:30pm');
    expect(card(cards, 'nights').general).toContain('11am in Italy');
  });

  describe('bedtime', () => {
    it('moves Tuesday earlier for the 4am start when her usual bedtime is later', () => {
      expect(card(plan({ bedtime: 23 * 60 }), 'before').you).toContain('Tuesday: bed by 9pm.');
    });

    it('keeps her usual Tuesday bedtime when it is already early enough', () => {
      expect(card(plan({ bedtime: 20 * 60 + 30 }), 'before').you).toContain(
        'Tuesday: bed at your usual 8:30pm.',
      );
    });

    it('uses her bedtime and wake time back home', () => {
      const cards = plan({ bedtime: 22 * 60, wake: 6 * 60 + 30, after: 'stay' });
      expect(card(cards, 'landing').you.join(' ')).toContain('Bed at your usual 10pm');
      expect(card(cards, 'thursday').you).toContain('Bed at your usual 10pm.');
      expect(card(cards, 'nights').you.join(' ')).toContain('keep it quiet until 6:30am');
    });

    it('reads sensibly before she has picked a time', () => {
      const text = all(plan());
      expect(text).toContain('your usual time');
      expect(text).not.toMatch(/null|undefined|NaN/);
    });
  });

  describe('coffee', () => {
    it('places coffee on the plan with a 2pm cutoff when she drinks it', () => {
      const cards = plan({ coffee: 'yes', after: 'stay' });
      expect(card(cards, 'thursday').you).toContain('Morning coffee as usual. Last cup by 2pm.');
      expect(words(card(cards, 'before'))).toContain('Keep your usual coffee');
      expect(words(card(cards, 'flight'))).toContain('Coffee with the second meal');
      expect(card(cards, 'landing').you).toContain('No coffee after you land.');
    });

    it('says nothing about coffee when she does not drink it', () => {
      for (const coffee of ['no', null]) {
        expect(all(plan({ coffee, after: 'drive' })), String(coffee)).not.toMatch(/coffee/i);
      }
    });

    it('puts a coffee before the drive, because staying awake on 395 matters more than sleep', () => {
      expect(card(plan({ coffee: 'yes', after: 'drive' }), 'landing').you[0]).toMatch(
        /^Coffee right before you leave LAX/,
      );
    });
  });

  describe('melatonin', () => {
    it('gives a low dose with the doctor check when she is open to it', () => {
      const nights = words(card(plan({ melatonin: 'yes' }), 'nights'));
      expect(nights).toContain('0.5 to 1 mg at bedtime');
      expect(nights).toContain('Ask your doctor first');
      expect(words(card(plan({ melatonin: 'yes' }), 'before'))).toContain('Buy melatonin now');
    });

    it('leaves melatonin out entirely when she is not', () => {
      expect(all(plan({ melatonin: 'no' }))).not.toMatch(/melatonin/i);
      expect(all(plan())).not.toMatch(/melatonin/i);
    });

    it('warns off the PM sleep aids whatever she answers', () => {
      for (const melatonin of ['yes', 'no', null]) {
        expect(words(card(plan({ melatonin }), 'nights'))).toContain('No Tylenol PM');
      }
    });
  });

  describe('after landing', () => {
    it('shows both ways to do the day until she picks one', () => {
      const landing = card(plan(), 'landing');
      expect(landing.branches?.map((b) => b.title)).toEqual([
        'Stay near LAX',
        'Drive home Wednesday',
      ]);
      expect(landing.warn).toBeUndefined();
    });

    it('says plainly what the Wednesday drive asks of her', () => {
      const landing = card(plan({ after: 'drive' }), 'landing');
      expect(landing.branches).toBeUndefined();
      expect(landing.warn).toContain('riskiest part of the trip');
      expect(landing.warn).toContain('reach Bishop around 9:30pm');
      expect(landing.warn).toContain('5:30am on your body clock');
      expect(landing.warn).toContain('about 26 hours awake');
      expect(landing.you).toContain('Swap drivers every hour.');
    });

    it('makes Thursday the drive day when she stays near LAX', () => {
      const thursday = card(plan({ after: 'stay' }), 'thursday');
      expect(thursday.when).toContain('Los Angeles to Bishop');
      expect(thursday.you.join(' ')).toContain('Leave after breakfast');
      expect(card(plan({ after: 'drive' }), 'thursday').when).toMatch(/· Bishop$/);
    });

    it('sends her outside before sunset on landing day when she stays', () => {
      expect(card(plan({ after: 'stay' }), 'landing').you.join(' ')).toContain(
        'Walk outside until sunset, about 6pm',
      );
    });
  });

  describe('Thursday', () => {
    it('front-loads a busy day and allows one short nap on a free one', () => {
      expect(card(plan({ thursday: 'busy' }), 'thursday').you.join(' ')).toContain('before noon');
      expect(card(plan({ thursday: 'free' }), 'thursday').you.join(' ')).toContain(
        '30 minutes at most, before 3pm',
      );
      expect(card(plan(), 'thursday').you.join(' ')).not.toMatch(/before noon|30 minutes/);
    });
  });
});

/** Every file under /for/, so the guards below cover pages added later. */
function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('every /for/ page', () => {
  const pages = filesUnder(FOR_DIR).filter((f) => f.endsWith('.html'));

  it('exists', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it('reads the brand from the stylesheet the build writes, and writes no brand value itself', () => {
    for (const page of pages) {
      expect(readFileSync(page, 'utf8'), page).toContain('href="/brand/brand.css"');
    }
    for (const file of filesUnder(FOR_DIR).filter((f) => /\.(html|js|css)$/.test(f))) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/i);
      expect(text, file).not.toContain(type.family);
    }
  });

  it('is shared by link, not listed', () => {
    for (const page of pages) {
      expect(readFileSync(page, 'utf8'), page).toContain('<meta name="robots" content="noindex');
    }
  });
});

describe('the brand stylesheet', () => {
  it('loads the font first, then the tokens, then the base rules', () => {
    const css: string = brandStylesheet();
    expect(
      css.startsWith(
        `@import url('https://fonts.googleapis.com/css2?family=${type.googleFonts}&display=swap');`,
      ),
    ).toBe(true);
    expect(css.indexOf('--ground')).toBeGreaterThan(0);
    expect(css.indexOf('.wordmark')).toBeGreaterThan(css.indexOf('--ground'));
  });
});
