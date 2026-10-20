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

  it('fails loudly on a page without its form', () => {
    document.body.innerHTML = '<div id="plan"></div>';
    expect(() => mount(document, null)).toThrow(/#answers/);
  });
});
