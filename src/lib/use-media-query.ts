import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query, e.g. `useMediaQuery('(min-width: 1280px)')`.
 * Re-renders when the match changes (window resize, rotation, zoom).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
