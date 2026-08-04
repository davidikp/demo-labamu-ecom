import { useEffect, useState } from 'react';

const QUERY = '(max-width: 639px)'; // matches Tailwind's `sm` breakpoint (640px)

/**
 * Resolves whether "mobile" styling should apply, for sections/blocks with a
 * mobile/desktop field pair (columns_mobile, cards_visible_mobile, …).
 *
 * The builder's canvas "Mobile" preview is a fixed-width `<div>` inside the
 * real (wide) browser window, not an actual narrow viewport — so CSS media
 * queries like `sm:` always evaluate against the real window and never
 * reflect the preview toggle. Canvas.jsx passes the toggle's real value down
 * as `explicitIsMobile`; when that's given, it wins outright. Everywhere else
 * (the published storefront, PreviewLive, tests) — where there's no such fake
 * viewport, and the browser window IS the true viewport — this falls back to
 * `window.matchMedia`, which is correct there.
 */
const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export function useResponsiveMobile(explicitIsMobile) {
  const [matches, setMatches] = useState(() => (canMatchMedia() ? window.matchMedia(QUERY).matches : false));

  useEffect(() => {
    if (explicitIsMobile !== undefined || !canMatchMedia()) return undefined;
    const mql = window.matchMedia(QUERY);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [explicitIsMobile]);

  return explicitIsMobile !== undefined ? explicitIsMobile : matches;
}
