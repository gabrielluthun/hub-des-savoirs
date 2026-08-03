import { useEffect, useRef, useState } from 'react';

/**
 * Per-question countdown. Resets synchronously with `questionKey` so a leftover
 * 0s from the previous question cannot immediately timeout the next one.
 */
export function useQuestionTimer(params: {
  questionKey: number;
  durationSec: number;
  paused: boolean;
  onTimeout: () => void;
}): number {
  const [remaining, setRemaining] = useState(params.durationSec);
  const onTimeoutRef = useRef(params.onTimeout);
  const armedKeyRef = useRef<number | null>(null);

  onTimeoutRef.current = params.onTimeout;

  useEffect(() => {
    setRemaining(params.durationSec);
    armedKeyRef.current = params.questionKey;
  }, [params.questionKey, params.durationSec]);

  useEffect(() => {
    if (params.paused) return;

    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [params.questionKey, params.paused]);

  useEffect(() => {
    if (params.paused || remaining > 0) return;
    if (armedKeyRef.current !== params.questionKey) return;
    armedKeyRef.current = null;
    onTimeoutRef.current();
  }, [remaining, params.paused, params.questionKey]);

  return remaining;
}
