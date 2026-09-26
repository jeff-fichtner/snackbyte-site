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
  /** Where the work is done. Not who it is for — the work goes wherever it is wanted. */
  based: brand.based,

  /** What snackbyte does, and for whom: anyone, anywhere, who needs a thing that is not sold. */
  claim: 'snackbyte builds neat tools that haven’t been made yet.',

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
