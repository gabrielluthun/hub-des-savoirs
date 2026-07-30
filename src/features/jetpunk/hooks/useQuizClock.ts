import { useEffect, useRef, useState } from 'react';

export function useQuizClock(options: {
  durationSec: number;
  playing: boolean;
  allFound: boolean;
  onTimedOut: () => void;
}) {
  const { durationSec, playing, allFound, onTimedOut } = options;
  const untimed = durationSec <= 0;
  const [remaining, setRemaining] = useState(untimed ? 0 : durationSec);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);
  const onTimedOutRef = useRef(onTimedOut);
  onTimedOutRef.current = onTimedOut;

  const reset = () => {
    startedAtRef.current = Date.now();
    timedOutRef.current = false;
    setElapsedSec(0);
    setRemaining(untimed ? 0 : durationSec);
  };

  useEffect(() => {
    if (!playing) return;
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
      timedOutRef.current = false;
    }
  }, [playing]);

  useEffect(() => {
    if (!playing || allFound) return;

    const tick = window.setInterval(() => {
      const startedAt = startedAtRef.current ?? Date.now();
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setElapsedSec(elapsed);

      if (untimed) return;

      const left = Math.max(0, durationSec - elapsed);
      setRemaining(left);

      if (left <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        window.clearInterval(tick);
        onTimedOutRef.current();
      }
    }, 250);

    return () => window.clearInterval(tick);
  }, [playing, allFound, untimed, durationSec]);

  return {
    untimed,
    remaining,
    elapsedSec,
    reset,
  };
}
