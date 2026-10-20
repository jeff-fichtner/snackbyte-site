import { describe, it, expect, beforeEach } from 'vitest';
import pageHtml from '../../src/web/public/for/jan/jet-lag/index.html?raw';
// @ts-expect-error — plain JS page script, no types
import * as jetLag from '../../src/web/public/for/jan/jet-lag/plan.js';

// Jan's jet lag page in a real DOM: the answers rewrite the plan, and are remembered.
const { mount } = jetLag;

/** A storage double that can also refuse every call, as a blocked or full store does. */
function memoryStorage(refuse = false) {
  const data = new Map<string, string>();
  return {
    data,
    getItem(k: string) {
      if (refuse) throw new Error('blocked');
      return data.get(k) ?? null;
    },
    setItem(k: string, v: string) {
      if (refuse) throw new Error('blocked');
      data.set(k, v);
    },
  };
}

function choose(name: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (!input) throw new Error(`no ${name}=${value}`);
  input.checked = true;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function pick(name: string, value: number) {
  const select = document.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
  if (!select) throw new Error(`no select ${name}`);
  select.value = String(value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

const planText = () => document.getElementById('plan')?.textContent ?? '';

/** Loads the real page into the test document. Its module script does not run here; each test mounts. */
function loadPage() {
  document.documentElement.innerHTML = pageHtml
    .replace(/^<!doctype html>\s*<html[^>]*>/i, '')
    .replace(/<\/html>\s*$/i, '');
}

describe('the page', () => {
  beforeEach(loadPage);

  it('renders the whole plan before any answer', () => {
    mount(document, memoryStorage());
    expect(document.querySelectorAll('#plan .card')).toHaveLength(7);
    expect(planText()).toContain('Stay near LAX');
    expect(planText()).toContain('Drive home Wednesday');
  });

  it('fills the time pickers from the plan’s own times', () => {
    mount(document, memoryStorage());
    const bed = document.querySelector<HTMLSelectElement>('select[name="bedtime"]');
    expect(bed?.options[1].textContent).toBe('8pm');
    expect(bed?.options[bed.options.length - 1].textContent).toBe('midnight');
  });

  it('rewrites the plan as she answers', () => {
    mount(document, memoryStorage());
    expect(planText()).not.toContain('Last cup by 2pm');
    choose('coffee', 'yes');
    expect(planText()).toContain('Last cup by 2pm');
    choose('after', 'drive');
    expect(planText()).toContain('riskiest part of the trip');
    expect(planText()).not.toContain('Stay near the airport');
    pick('bedtime', 22 * 60);
    expect(planText()).toContain('your usual 10pm');
  });

  it('remembers her answers on her device and restores them', () => {
    const storage = memoryStorage();
    mount(document, storage);
    choose('melatonin', 'yes');
    choose('after', 'stay');
    expect(JSON.parse(storage.data.get('for-jan-jet-lag') ?? '{}')).toMatchObject({
      melatonin: 'yes',
      after: 'stay',
    });

    loadPage();
    mount(document, storage);
    expect(
      document.querySelector<HTMLInputElement>('input[name="after"][value="stay"]')?.checked,
    ).toBe(true);
    expect(planText()).toContain('0.5 to 1 mg');
  });

  it('still works when storage is blocked or missing', () => {
    mount(document, memoryStorage(true));
    choose('coffee', 'yes');
    expect(planText()).toContain('Last cup by 2pm');

    loadPage();
    mount(document, null);
    expect(document.querySelectorAll('#plan .card')).toHaveLength(7);
  });

  const answerAll = () => {
    pick('bedtime', 22 * 60);
    pick('wake', 6 * 60 + 30);
    choose('coffee', 'yes');
    choose('melatonin', 'no');
    choose('thursday', 'free');
    choose('after', 'stay');
  };
  const shown = (id: string) => !document.getElementById(id)?.hidden;
  const summaryLines = () =>
    [...document.querySelectorAll('#summary-list li')].map((li) => li.textContent);
  const click = (id: string) => document.getElementById(id)?.click();

  it('folds the questions into a summary when she saves, and opens them on Change', () => {
    mount(document, memoryStorage());
    expect(shown('answers')).toBe(true);
    expect(shown('summary')).toBe(false);

    answerAll();
    click('save');
    expect(shown('answers')).toBe(false);
    expect(shown('summary')).toBe(true);
    expect(summaryLines()).toEqual([
      'Bed: 10pm',
      'Up: 6:30am',
      'Coffee: Yes',
      'Melatonin: No',
      'Thursday: Free',
      'After landing: Stay near LAX',
    ]);
    expect(planText()).toContain('Last cup by 2pm');

    click('change');
    expect(shown('answers')).toBe(true);
    expect(shown('summary')).toBe(false);
    expect(document.getElementById('change')?.getAttribute('aria-expanded')).toBe('true');
    // Focus lands on the questions, never on a picker: on a phone that would pop it open.
    expect(document.activeElement).toBe(document.getElementById('answers'));
  });

  it('opens on the plan, answers folded, when she comes back after saving', () => {
    const storage = memoryStorage();
    mount(document, storage);
    choose('coffee', 'no');
    click('save');

    loadPage();
    mount(document, storage);
    expect(shown('answers')).toBe(false);
    expect(summaryLines()).toContain('Coffee: No');
    expect(summaryLines()).toContain('Bed: not answered');
  });

  it('opens folded when every question was answered, even without Save', () => {
    const storage = memoryStorage();
    mount(document, storage);
    answerAll();

    loadPage();
    mount(document, storage);
    expect(shown('answers')).toBe(false);
    expect(shown('summary')).toBe(true);
  });

  it('keeps the questions open on return when some are still unanswered and unsaved', () => {
    const storage = memoryStorage();
    mount(document, storage);
    choose('coffee', 'yes');

    loadPage();
    mount(document, storage);
    expect(shown('answers')).toBe(true);
    expect(shown('summary')).toBe(false);
  });

  it('fails loudly on a page without its form', () => {
    document.body.innerHTML = '<div id="plan"></div>';
    expect(() => mount(document, null)).toThrow(/#answers/);
  });
});
