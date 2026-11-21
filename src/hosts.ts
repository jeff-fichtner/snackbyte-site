/**
 * The names this site answers to.
 *
 * The site is the load balancer's default service, so a request for any name the load balancer
 * has no rule for lands here, and with a wildcard DNS record that is every unused name on
 * snackbyte.io and snackbyte.dev. Those names get the not-found page, never the homepage.
 *
 * The list is the site's own names, the same in every environment: the load balancer sends
 * production only snackbyte.io and www, and staging only snackbyte.dev and www, so accepting all
 * four everywhere changes nothing a visitor can reach. The local names are for the dev server and
 * the tests, and a request naming them can only come from someone setting the header by hand.
 */
const SERVED_HOSTS = new Set([
  'snackbyte.io',
  'www.snackbyte.io',
  'snackbyte.dev',
  'www.snackbyte.dev',
  'localhost',
  '127.0.0.1',
  '[::1]',
]);

/** Whether the site serves this host name (as Express gives it: no port, any case). */
export function servesHost(hostname: string | undefined): boolean {
  if (!hostname) return false;
  return SERVED_HOSTS.has(hostname.toLowerCase());
}

/**
 * The files the not-found page loads: its script and stylesheet under /assets/, and the icons.
 * An unknown host still gets these, so its not-found page renders as it does everywhere else.
 */
export function isNotFoundAsset(path: string): boolean {
  return (
    path.startsWith('/assets/') ||
    path === '/favicon.svg' ||
    path === '/favicon.ico' ||
    path === '/apple-touch-icon.png'
  );
}
