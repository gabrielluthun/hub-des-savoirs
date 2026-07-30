import { useEffect, useRef } from 'react';

/**
 * Ends the quiz when the page/tab loses visibility (browser tab switch,
 * minimize, app switch — best-effort via the Page Visibility API).
 */
export function useEndOnVisibilityHidden(enabled: boolean, onHidden: () => void) {
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        onHiddenRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled]);
}
