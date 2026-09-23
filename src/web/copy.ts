import { copy as brand } from '@snackbyte/brand';

/**
 * Every word this page says, in one place, so the voice can be read and tested
 * without hunting through components.
 *
 * Brand-level words — the name, the headline, the place — are not written here. They
 * come from the brand guide via the package, because they belong to the brand rather
 * than to this page. Changing one means changing the guide.
 */
export const page = {
  /** The brand's own words, passed through so a component imports only this module. */
  name: brand.name,
  headline: brand.headline,
  place: brand.place,

  /**
   * What snackbyte does, for whom. Names Bishop so the first screen carries the place
   * without the footer having to be visible.
   */
  claim:
    'snackbyte builds small software for the people and organisations around Bishop, California — a theatre, a crew, a shop — and for anyone who needs a tool that does not exist yet.',

  /**
   * The work, described by what it does for the people who use it. Deliberately not
   * linked, and no client is named: each of these is someone else's to name, and adding
   * a name later never requires taking one down.
   */
  work: [
    {
      title: "Registration for a school's after-school music program.",
      line: 'Families enrol their children, staff see who is in which class, and nobody re-types a spreadsheet.',
    },
    {
      title: 'An AI that edits wedding films.',
      line: "It is being taught to watch a day's raw footage, in picture and in sound, and cut it into the film a videographer would have made.",
    },
    {
      title: 'A call board for a community theatre.',
      line: 'Cast and crew pick their name and see when they are called, and when they are done.',
    },
  ],

  /** The only address, and the only link on the page. */
  contact: {
    lead: 'Something you need built?',
    address: 'jeff@snackbyte.io',
  },

  /** The not-found page. */
  notFound: {
    line: 'There is nothing at this address.',
    home: 'Back to the start',
  },
} as const;
