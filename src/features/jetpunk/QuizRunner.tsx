import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input } from '@/components/ui/primitives';

interface QuizRunnerProps {
  durationSec: number;
  answers: string[];
  onClose: (score: number) => void;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function QuizRunner({ durationSec, answers, onClose }: QuizRunnerProps) {
  const [remaining, setRemaining] = useState(durationSec);
  const [input, setInput] = useState('');
  const [found, setFound] = useState<string[]>([]);
  const closedRef = useRef(false);

  const remainingAnswers = useMemo(() => {
    const foundSet = new Set(found.map(normalize));
    return answers.filter((answer) => !foundSet.has(normalize(answer)));
  }, [answers, found]);

  const finish = (score: number) => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose(score);
  };

  useEffect(() => {
    if (remaining <= 0 || remainingAnswers.length === 0) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining, remainingAnswers.length]);

  useEffect(() => {
    if (remaining <= 0 || remainingAnswers.length === 0) {
      finish(found.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, remainingAnswers.length, found.length]);

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;

  const tryAnswer = () => {
    const guess = normalize(input);
    if (!guess) return;
    const match = remainingAnswers.find((answer) => normalize(answer) === guess);
    if (match) {
      setFound((prev) => [...prev, match]);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quiz chronométré
            </p>
            <h3 className="font-display text-xl font-semibold">
              {found.length} / {answers.length}
            </h3>
          </div>
          <p className="font-mono text-lg tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            tryAnswer();
          }}
        >
          <Input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez une réponse…"
          />
          <Button type="submit">Valider</Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {found.map((answer) => (
            <span
              key={answer}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground"
            >
              {answer}
            </span>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-5 w-full"
          onClick={() => finish(found.length)}
        >
          Terminer
        </Button>
      </div>
    </div>
  );
}
