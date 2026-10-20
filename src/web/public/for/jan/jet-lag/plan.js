/**
 * Jan's jet lag plan: her answers on the page, turned into a dated plan.
 *
 * buildPlan is pure — answers in, cards out — so every combination can be tested without a
 * browser. mount wires it to the page, and remembers her answers on her device only.
 */

// The trip. The Bologna leg is AZ1312 at 6:30. The Rome and LAX times are ITA's published
// winter schedule for AZ620, not her ticket.
export const TRIP = {
  hoursBehind: 8, // Italy on CET from Oct 25, California on PDT until Nov 1
  wakeWednesday: 4 * 60, // Italy time; up around 4 for the 6:30 flight from Bologna
  romeDeparts: 9 * 60 + 10, // Italy time
  laxLands: 14 * 60 + 30, // California time
  outOfLax: 90, // minutes from landing to the curb: passport control and bags
  driveToBishop: 330, // minutes, LAX to Bishop in Wednesday's late-afternoon traffic
  sunset: 18 * 60, // Los Angeles and Bishop at the end of October, near enough
};

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
  const m = ((minutes % 1440) + 1440) % 1440;
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

/** The plan, one card per stretch of days. */
export function buildPlan(raw) {
  const a = normalize(raw);
  const coffee = a.coffee === 'yes';
  const melatonin = a.melatonin === 'yes';
  const usual = a.bedtime === null ? 'your usual time' : `your usual ${clock(a.bedtime)}`;

  // Tuesday night: enough sleep before the 4am start, and never later than she'd go anyway.
  const tuesdayLatest = TRIP.wakeWednesday - 7 * 60 + 24 * 60;
  const tuesday =
    a.bedtime !== null && a.bedtime <= tuesdayLatest
      ? `Tuesday: bed at your usual ${clock(a.bedtime)}.`
      : `Tuesday: bed by ${clock(tuesdayLatest)}.`;

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

  const stay = {
    title: 'Stay near LAX',
    you: [
      `Stay near the airport. You’ll be out of LAX by about ${clock(curb)}.`,
      `Walk outside until sunset, about ${clock(TRIP.sunset)}. This does more than anything else on the page.`,
      `Dinner around ${clock(TRIP.sunset)}. Bed at ${usual}; 8pm at the earliest.`,
      ...(coffee ? ['No coffee after you land.'] : []),
    ],
  };

  const drive = {
    title: 'Drive home Wednesday',
    warn: `This is the riskiest part of the trip. You’d leave LAX around ${clock(curb)} into rush hour and reach Bishop around ${clock(home)}: ${clock(home + TRIP.hoursBehind * 60)} on your body clock, after about ${awake} hours awake, with most of 395 in the dark.`,
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
    why: 'Late-afternoon light is the strongest signal that it’s earlier than your body thinks. Being tired tonight is fine; it’s why you’ll sleep.',
  };
  if (a.after === 'stay') {
    landing.you = stay.you;
  } else if (a.after === 'drive') {
    landing.you = drive.you;
    landing.warn = drive.warn;
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

  const thursday = {
    id: 'thursday',
    title: 'First day back',
    when: `Thursday, October 29 · ${a.after === 'stay' ? 'Los Angeles to Bishop' : 'Bishop'}`,
    general: 'A real breakfast at breakfast time, high in protein. Outside in the late afternoon. One short nap at most.',
    you: [
      'Breakfast at California breakfast time. Eggs or yogurt are good; the time matters more than the protein.',
      ...(a.after === 'stay'
        ? ['Leave after breakfast; mornings are your sharpest time this week. You’ll be in Bishop by early afternoon.']
        : []),
      `Outside from about 3pm until sunset, about ${clock(TRIP.sunset)}.`,
      ...(a.thursday === 'busy'
        ? ['Put anything that matters before noon. You’ll fade from mid-afternoon.']
        : []),
      ...(a.thursday === 'free'
        ? ['Nap if you need to: once, 30 minutes at most, before 3pm.']
        : []),
      ...(coffee ? ['Morning coffee as usual. Last cup by 2pm.'] : []),
      `Bed at ${usual}.`,
    ],
    why: 'Flying west has one shape: alert mornings, a slump from mid-afternoon, sleepy by early evening. Light in that late window pushes the slump later each day. A long or late nap takes from tonight’s sleep.',
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

const KEY = 'for-jan-jet-lag';

function load(storage) {
  try {
    return normalize(JSON.parse(storage?.getItem(KEY) ?? 'null'));
  } catch {
    return normalize(null);
  }
}

function save(storage, answers) {
  try {
    storage?.setItem(KEY, JSON.stringify(answers));
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

/** Wires the page: fills the time pickers, restores saved answers, renders on every change. */
export function mount(doc, storage) {
  const form = doc.getElementById('answers');
  const plan = doc.getElementById('plan');
  if (!form) throw new Error('mount: the page has no #answers form');
  if (!plan) throw new Error('mount: the page has no #plan container');

  fillTimes(form.elements.namedItem('bedtime'), BEDTIMES);
  fillTimes(form.elements.namedItem('wake'), WAKE_TIMES);
  apply(form, load(storage));

  const render = () => {
    const answers = read(form);
    save(storage, answers);
    plan.replaceChildren(...buildPlan(answers).map((card) => renderCard(doc, card)));
  };
  form.addEventListener('change', render);
  render();
}
