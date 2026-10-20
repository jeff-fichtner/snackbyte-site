/**
 * Jan's jet lag plan: her answers on the page, turned into a dated plan.
 *
 * buildPlan is pure — answers in, cards out — so every combination can be tested without a
 * browser. mount wires it to the page: it remembers her answers on her device only, and once
 * they are in, folds the questions away so a return visit opens on the plan.
 */

// The trip: AZ1312 Bologna to Rome at 6:30, then AZ620 Rome to LAX, both confirmed as her
// flights. AZ620's times are ITA's winter schedule (09:10 out, 14:30 in, as last winter),
// which starts Oct 25 — not read from her ticket.
export const TRIP = {
  hoursBehind: 8, // Italy on CET from Oct 25, California on PDT until Nov 1
  wakeWednesday: 4 * 60, // Italy time; up around 4 for the 6:30 flight from Bologna
  romeDeparts: 9 * 60 + 10, // Italy time
  laxLands: 14 * 60 + 30, // California time
  outOfLax: 90, // minutes from landing to the curb: passport control and bags
  driveToBishop: 330, // minutes, LAX to Bishop in Wednesday's late-afternoon traffic
  sunset: 18 * 60, // Los Angeles and Bishop at the end of October, near enough
};

// Her body clock, estimated from her usual wake time. It is at its lowest about two hours
// before she would normally wake. Light in the six hours before that low point pushes the
// clock later, which is the way it has to go; light after it pushes the wrong way. Flying
// west, the low point moves about an hour and a half later each day.
export const BODY = {
  lowBeforeWake: 120,
  lightWindow: 360,
  shiftPerDay: 90,
};

const DAY = 24 * 60;

const range = (from, to, step) =>
  Array.from({ length: (to - from) / step + 1 }, (_, i) => from + i * step);

export const BEDTIMES = range(20 * 60, 24 * 60, 30);
export const WAKE_TIMES = range(4 * 60 + 30, 9 * 60, 30);

const CHOICES = {
  coffee: ['yes', 'no'],
  melatonin: ['yes', 'no'],
  thursday: ['busy', 'free'],
  after: ['drive', 'stay'],
};

/** A time of day, in minutes after midnight, as people write it: 9pm, 10:30pm, midnight. */
export function clock(minutes) {
  const m = ((minutes % DAY) + DAY) % DAY;
  if (m === 0) return 'midnight';
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 < 12 ? 'am' : 'pm';
  return mm === 0 ? `${h}${suffix}` : `${h}:${String(mm).padStart(2, '0')}${suffix}`;
}

/**
 * Answers as the plan reads them. Anything that isn’t one of the page's own values reads as
 * unanswered: stored answers can outlive a change to the page, and a stale one should drop
 * out rather than steer the plan.
 */
export function normalize(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const time = (v, allowed) => {
    const n = Number(v);
    return v !== null && v !== '' && allowed.includes(n) ? n : null;
  };
  const pick = (key) => (CHOICES[key].includes(src[key]) ? src[key] : null);
  return {
    bedtime: time(src.bedtime, BEDTIMES),
    wake: time(src.wake, WAKE_TIMES),
    coffee: pick('coffee'),
    melatonin: pick('melatonin'),
    thursday: pick('thursday'),
    after: pick('after'),
  };
}

/** Whether every question has an answer. */
export function isComplete(raw) {
  return Object.values(normalize(raw)).every((v) => v !== null);
}

/**
 * Her body clock's low point on California time, `day` days after landing (0 is Wednesday),
 * to the nearest half hour. Counted from noon, so an evening low point reads as one: 12:30am
 * comes back as 24:30, not 0:30.
 */
export function lowPoint(wake, day) {
  const m = wake - BODY.lowBeforeWake - TRIP.hoursBehind * 60 + day * BODY.shiftPerDay;
  const half = Math.round(m / 30) * 30;
  const wrapped = ((half % DAY) + DAY) % DAY;
  return wrapped < 12 * 60 ? wrapped + DAY : wrapped;
}

/** Landing night's bedtime: her usual, but not past 10 after a day that began at 4 in Italy. */
const LANDING_LATEST = 22 * 60;
const EARLIEST_BED = 20 * 60;

/** Bedtime on California time, `day` days after landing, or null when she hasn't said. */
function bedOn(a, day) {
  if (day === 0) return a.bedtime === null ? LANDING_LATEST : Math.min(a.bedtime, LANDING_LATEST);
  return a.bedtime;
}

/**
 * Light for one day at home: outside for the part of her window that has daylight, then
 * bright lights indoors until the low point or bed, whichever comes first. Null when her
 * wake time is unknown.
 */
function light(a, day, outside) {
  if (a.wake === null) return null;
  const low = lowPoint(a.wake, day);
  const start = low - BODY.lightWindow;
  const lines = [];
  if (start < TRIP.sunset) lines.push(outside(start));
  else lines.push('Late-afternoon daylight still helps a little; the evening light indoors matters more.');
  const bed = bedOn(a, day);
  const until = bed === null ? low : Math.min(low, bed);
  if (until > TRIP.sunset) {
    lines.push(
      until === bed
        ? 'After dark, keep the lights bright until bed.'
        : `After dark, keep the lights bright until about ${clock(until)}, then dim them.`,
    );
  }
  return lines;
}

const LIGHT_WHY =
  'The times come from your usual wake time. Your body clock is at its lowest about two hours before you would normally wake; light in the six hours before that pushes it later, which is the way it has to go, and light after it pushes it back. The low point moves about an hour and a half later each day, so the times do too.';

/** The plan, one card per stretch of days. */
export function buildPlan(raw) {
  const a = normalize(raw);
  const coffee = a.coffee === 'yes';
  const melatonin = a.melatonin === 'yes';
  const usual = a.bedtime === null ? 'your usual time' : `your usual ${clock(a.bedtime)}`;
  const early =
    (a.bedtime !== null && a.bedtime <= 21 * 60) || (a.wake !== null && a.wake <= 5 * 60 + 30);
  const late =
    !early && ((a.bedtime !== null && a.bedtime >= 23 * 60) || (a.wake !== null && a.wake >= 8 * 60));

  // Tuesday night, before the 4am start: seven hours if her usual bedtime allows it. A late
  // sleeper won't fall asleep at 9, so she is told the short night is fine instead.
  const tuesdayLatest = TRIP.wakeWednesday - 7 * 60 + DAY;
  let tuesday = `Tuesday: bed by ${clock(tuesdayLatest)}.`;
  if (a.bedtime !== null && a.bedtime <= tuesdayLatest) {
    tuesday = `Tuesday: bed at your usual ${clock(a.bedtime)}.`;
  } else if (a.bedtime !== null && a.bedtime > LANDING_LATEST) {
    tuesday =
      'Tuesday: bed as early as you’ll actually fall asleep. A short night is fine; the first half of the flight makes it up.';
  }

  const before = {
    id: 'before',
    title: 'Before you fly',
    when: 'Sunday to Tuesday, October 25–27 · Italy',
    general: 'Go to bed an hour later each night for two or three nights.',
    you: [
      `Skip that. Wednesday starts around ${clock(TRIP.wakeWednesday)}.`,
      tuesday,
      'Spend the evenings outside; it helps a little.',
      ...(coffee ? ['Keep your usual coffee. Cutting back now adds headaches to jet lag.'] : []),
      ...(melatonin ? ['Buy melatonin now. Italian pharmacies sell 1 mg tablets.'] : []),
      'Italy’s clocks go back an hour on Sunday the 25th. Your phone handles it, and it makes the jump home 8 hours instead of 9.',
    ],
    why: 'Flying west, your body has to run later. Staying up later starts that early, but a 4am start undoes it and costs sleep you’ll need.',
  };

  const flight = {
    id: 'flight',
    title: 'The flight',
    when: 'Wednesday, October 28 · Bologna to Rome to Los Angeles',
    general: 'Set your watch to California time when you board, and eat and sleep by it.',
    you: [
      `Switch it when you board in Rome. The flight leaves about ${clock(TRIP.romeDeparts)} there, which is ${clock(TRIP.romeDeparts - TRIP.hoursBehind * 60)} in California.`,
      'Sleep in the first half if you can; it’s night in California. From the second meal on, stay awake.',
      'Water, and little or no alcohol.',
      'Walk the aisle every hour or two while you’re awake, and flex your ankles in your seat.',
      ...(coffee ? ['Coffee with the second meal is fine; it’s morning in California.'] : []),
    ],
    why: 'Sleeping when it’s night where you’re going keeps the switch simple, and being awake for the last stretch makes a normal bedtime reachable. Moving every hour or two lowers the risk of a blood clot on a long flight.',
  };

  const curb = TRIP.laxLands + TRIP.outOfLax;
  const home = curb + TRIP.driveToBishop;
  // Arriving at California minute `home` on Wednesday is minute home + 8h on Italy's
  // Wednesday, counted from the same midnight she woke after.
  const awake = Math.round((home + TRIP.hoursBehind * 60 - TRIP.wakeWednesday) / 60);

  let landingBed = `Bed by ${clock(LANDING_LATEST)}; not before ${clock(EARLIEST_BED)}.`;
  if (a.bedtime !== null && a.bedtime <= EARLIEST_BED) {
    landingBed = `Bed at your usual ${clock(a.bedtime)}.`;
  } else if (a.bedtime !== null && a.bedtime <= LANDING_LATEST) {
    landingBed = `Bed at your usual ${clock(a.bedtime)}; not before ${clock(EARLIEST_BED)}.`;
  } else if (a.bedtime !== null) {
    landingBed = `Bed by ${clock(LANDING_LATEST)} tonight, earlier than your usual ${clock(a.bedtime)}.`;
  }

  const [landingOutside, landingIndoors] = light(a, 0, (start) =>
    start > curb
      ? `Walk outside from about ${clock(start)} until sunset, about ${clock(TRIP.sunset)}. This does more than anything else on the page.`
      : `Walk outside until sunset, about ${clock(TRIP.sunset)}. This does more than anything else on the page.`,
  ) ?? [
    `Walk outside until sunset, about ${clock(TRIP.sunset)}. This does more than anything else on the page.`,
  ];

  const stay = {
    title: 'Stay near LAX',
    you: [
      `Stay near the airport. You’ll be out of LAX by about ${clock(curb)}.`,
      landingOutside,
      `Dinner around ${clock(TRIP.sunset)}.`,
      ...(landingIndoors ? [landingIndoors] : []),
      landingBed,
      ...(coffee ? ['No coffee after you land.'] : []),
    ],
  };

  const drive = {
    title: 'Drive home Wednesday',
    warn: `This is the riskiest part of the trip. You’d leave LAX around ${clock(curb)} into rush hour and reach Bishop around ${clock(home)}: ${clock(home + TRIP.hoursBehind * 60)} on your body clock, after about ${awake} hours awake, with most of 395 in the dark. It isn’t advised. Stay in LA tonight and drive home Thursday morning.`,
    you: [
      ...(coffee
        ? ['Coffee right before you leave LAX. It may cost some sleep; staying awake on 395 matters more.']
        : []),
      'Swap drivers every hour.',
      `At the first yawn, heavy eyes or drift in the lane, stop. ${coffee ? 'A 20-minute nap does more than another coffee.' : 'A 20-minute nap is the fix.'} Mojave and Lone Pine have places to stop.`,
      'Straight to bed when you get home.',
    ],
  };

  const landing = {
    id: 'landing',
    title: 'Landing',
    when: `Wednesday, October 28, about ${clock(TRIP.laxLands)} · Los Angeles`,
    general: 'Stay up until a normal bedtime, and get outside in the late afternoon.',
    you: [],
    why:
      'Late-afternoon light is the strongest signal that it’s earlier than your body thinks. Being tired tonight is fine; it’s why you’ll sleep.' +
      (a.wake === null ? '' : ` ${LIGHT_WHY}`),
  };
  if (a.after === 'stay') {
    landing.you = stay.you;
  } else if (a.after === 'drive') {
    landing.you = drive.you;
    landing.warn = drive.warn;
    // One tap to take the advice, without reopening the questions.
    landing.action = { label: 'Stay near LAX instead', name: 'after', value: 'stay' };
  } else {
    landing.you = ['Two ways to do this day. Question 5 picks one.'];
    landing.branches = [stay, drive];
  }

  const nights = {
    id: 'nights',
    title: 'Nights one to three',
    when: 'Wednesday to Friday',
    general: `Expect to wake around 2 to 4am. At 3am in California your body thinks it’s ${clock(3 * 60 + TRIP.hoursBehind * 60)} in Italy.`,
    you: [
      'Stay in bed with the lights off and the phone away. It gets shorter each night.',
      ...(early
        ? ['Early risers tend to feel this direction the most. Expect the early wake-ups for most of the week.']
        : []),
      ...(late
        ? ['Late sleepers tend to adjust fastest going west. The early wake-ups should be short.']
        : []),
      'Use a nightlight for the bathroom, not the overhead light.',
      `If you’re wide awake after half an hour, get up in dim light and keep it quiet until ${a.wake === null ? 'your usual time' : clock(a.wake)}.`,
      ...(melatonin
        ? [
            'Melatonin, 0.5 to 1 mg at bedtime, nights one to three. On blood thinners, blood pressure or diabetes medicine? Ask your doctor first.',
          ]
        : []),
      'No Tylenol PM, Advil PM or Benadryl. They’re the same drug, and at night it causes falls and confusion.',
    ],
    why:
      'Bright light in the small hours pushes your clock the wrong way.' +
      (melatonin
        ? ' Melatonin at bedtime helps you stay asleep. Start low; more isn’t much better, and it lingers into the morning.'
        : ''),
  };

  const thursdayLight = light(a, 1, (start) =>
    `Outside from about ${clock(Math.max(start, 12 * 60))} until sunset, about ${clock(TRIP.sunset)}.`,
  ) ?? [`Outside from about 3pm until sunset, about ${clock(TRIP.sunset)}.`];

  const thursday = {
    id: 'thursday',
    title: 'First day back',
    when: `Thursday, October 29 · ${a.after === 'stay' ? 'Los Angeles to Bishop' : 'Bishop'}`,
    general: 'A real breakfast at breakfast time, high in protein. Outside in the late afternoon. One short nap at most.',
    you: [
      `${a.wake === null ? 'Breakfast at California breakfast time.' : `Breakfast by ${clock(a.wake + 60)}.`} Eggs or yogurt are good; the time matters more than the protein.`,
      ...(a.after === 'stay'
        ? ['Leave after breakfast; mornings are your sharpest time this week. You’ll be in Bishop by early afternoon.']
        : []),
      ...thursdayLight,
      ...(a.thursday === 'busy'
        ? ['Put anything that matters before noon. You’ll fade from mid-afternoon.']
        : []),
      ...(a.thursday === 'free'
        ? ['Nap if you need to: once, 30 minutes at most, before 3pm.']
        : []),
      ...(coffee ? ['Morning coffee as usual. Last cup by 2pm.'] : []),
      `Bed at ${usual}.`,
    ],
    why:
      'Flying west has one shape: alert mornings, a slump from mid-afternoon, sleepy by early evening. Light in that late window pushes the slump later each day. A long or late nap takes from tonight’s sleep.' +
      (a.wake === null ? '' : ` ${LIGHT_WHY}`),
  };

  const weekend = {
    id: 'weekend',
    title: 'Friday and Saturday',
    when: 'October 30–31 · Bishop',
    general: 'Keep doing what Thursday did.',
    you: [
      `Breakfast on time, outside late in the afternoon, bed at ${usual}.`,
      'The early wake-ups should be shorter each night.',
    ],
    why: 'Your body moves about an hour and a half toward California each day. Light, meals and bedtime on California time keep it moving.',
  };

  const sunday = {
    id: 'sunday',
    title: 'Clocks go back',
    when: 'Sunday, November 1',
    general: 'California’s clocks go back an hour at 2am.',
    you: [
      `Go to bed at ${usual} on the new clock.`,
      'Expect to wake an hour early for a day or two. It’s one more hour in the direction you’re already going.',
      'Most of the jet lag should be behind you by early next week.',
    ],
    why: 'Going back an hour is a small step west. Your body is already making that kind of step, so it adds a day of early mornings and little else.',
  };

  return [before, flight, landing, nights, thursday, weekend, sunday];
}

const el = (doc, tag, className, text) => {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function renderLines(doc, lines) {
  const list = el(doc, 'ul', 'you');
  for (const line of lines) list.append(el(doc, 'li', '', line));
  return list;
}

function renderCard(doc, card) {
  const node = el(doc, 'section', 'card');
  node.id = card.id;
  node.append(el(doc, 'h2', '', card.title), el(doc, 'p', 'when', card.when));

  const general = el(doc, 'p', 'general');
  general.append(el(doc, 'span', 'label', 'Generally'), doc.createTextNode(card.general));
  node.append(general, el(doc, 'p', 'label', 'For you'));

  if (card.warn) node.append(el(doc, 'p', 'warn', card.warn));
  if (card.action) {
    const button = el(doc, 'button', 'primary', card.action.label);
    button.type = 'button';
    button.dataset.name = card.action.name;
    button.dataset.value = card.action.value;
    node.append(button);
  }
  node.append(renderLines(doc, card.you));
  for (const branch of card.branches ?? []) {
    const block = el(doc, 'div', 'branch');
    block.append(el(doc, 'h3', '', branch.title));
    if (branch.warn) block.append(el(doc, 'p', 'warn', branch.warn));
    block.append(renderLines(doc, branch.you));
    node.append(block);
  }

  const why = el(doc, 'details');
  why.append(el(doc, 'summary', '', 'Why'), el(doc, 'p', '', card.why));
  node.append(why);
  return node;
}

/**
 * Her answers as she gave them, one line per question, in the page's own words: each
 * picker's label and chosen option, each choice's short name and the button she tapped.
 */
function describe(form) {
  const lines = [];
  for (const fieldset of form.querySelectorAll('fieldset')) {
    for (const select of fieldset.querySelectorAll('select')) {
      const label = select.closest('label')?.firstChild?.textContent.trim();
      const picked = select.value === '' ? 'not answered' : select.selectedOptions[0].textContent;
      lines.push(`${label}: ${picked}`);
    }
    const checked = fieldset.querySelector('input[type="radio"]:checked');
    if (fieldset.dataset.short) {
      const picked = checked ? checked.nextElementSibling.textContent : 'not answered';
      lines.push(`${fieldset.dataset.short}: ${picked}`);
    }
  }
  return lines;
}

const KEY = 'for-jan-jet-lag';

function load(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(KEY) ?? 'null');
    return { answers: normalize(raw), saved: raw?.saved === true };
  } catch {
    return { answers: normalize(null), saved: false };
  }
}

function persist(storage, answers, saved) {
  try {
    storage?.setItem(KEY, JSON.stringify({ ...answers, saved }));
  } catch {
    // Storage full or blocked: the answers just won't be remembered next visit.
  }
}

function fillTimes(select, times) {
  for (const t of times) {
    const option = select.ownerDocument.createElement('option');
    option.value = String(t);
    option.textContent = clock(t);
    select.append(option);
  }
}

function read(form) {
  const data = new FormData(form);
  return normalize(Object.fromEntries(data.entries()));
}

function apply(form, answers) {
  for (const [name, value] of Object.entries(answers)) {
    if (value === null) continue;
    const field = form.elements.namedItem(name);
    if (field) field.value = String(value);
  }
}

function need(doc, id) {
  const node = doc.getElementById(id);
  if (!node) throw new Error(`mount: the page has no #${id}`);
  return node;
}

/**
 * Wires the page: fills the time pickers, restores saved answers, and renders the plan on
 * every change. Saving folds the questions into a summary with a way back; a visit that
 * finds them saved, or all answered, opens folded.
 */
export function mount(doc, storage) {
  const form = need(doc, 'answers');
  const plan = need(doc, 'plan');
  const summary = need(doc, 'summary');
  const summaryList = need(doc, 'summary-list');
  const saveButton = need(doc, 'save');
  const changeButton = need(doc, 'change');

  fillTimes(form.elements.namedItem('bedtime'), BEDTIMES);
  fillTimes(form.elements.namedItem('wake'), WAKE_TIMES);
  const stored = load(storage);
  apply(form, stored.answers);
  let saved = stored.saved || isComplete(stored.answers);

  const render = () => {
    const answers = read(form);
    persist(storage, answers, saved);
    plan.replaceChildren(...buildPlan(answers).map((card) => renderCard(doc, card)));
  };
  const fold = () => {
    form.hidden = saved;
    summary.hidden = !saved;
    changeButton.setAttribute('aria-expanded', String(!saved));
    if (saved) summaryList.replaceChildren(...describe(form).map((line) => el(doc, 'li', '', line)));
  };

  form.addEventListener('change', render);
  // A button in the plan answers one question on the spot: the answer is saved and the plan
  // redrawn where she is, and the questions stay as they were, folded or open.
  plan.addEventListener('click', (event) => {
    const button = event.target.closest?.('button[data-name]');
    if (!button) return;
    const card = button.closest('.card')?.id;
    form.elements.namedItem(button.dataset.name).value = button.dataset.value;
    render();
    fold();
    const redrawn = card ? doc.getElementById(card) : null;
    if (redrawn) {
      redrawn.tabIndex = -1;
      redrawn.focus({ preventScroll: true });
      redrawn.scrollIntoView?.({ block: 'start' });
    }
  });
  saveButton.addEventListener('click', () => {
    saved = true;
    render();
    fold();
    summary.scrollIntoView?.({ block: 'start' });
  });
  changeButton.addEventListener('click', () => {
    saved = false;
    render();
    fold();
    // Focus the questions as a whole, not the first picker: on a phone, focusing a picker
    // opens it, and she may not want to change her bedtime at all.
    form.focus({ preventScroll: true });
    form.scrollIntoView?.({ block: 'start' });
  });
  render();
  fold();
}
