import { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui/primitives';
import type { GeneratedQuestion } from '@/types';

interface GamePlayProps {
  questions: GeneratedQuestion[];
  soundEnabled: boolean;
  onFinish: (score: number) => void;
  onAbort: () => void;
}

export function GamePlay({ questions, soundEnabled, onFinish, onAbort }: GamePlayProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [remaining, setRemaining] = useState(30);

  const current = questions[index];
  const useOptions = Boolean(current?.options && current.options.length >= 2);

  useEffect(() => {
    if (revealed) return;
    setRemaining(30);
    const timer = window.setInterval(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [index, revealed]);

  useEffect(() => {
    if (remaining <= 0 && !revealed) {
      setRevealed(true);
      setWasCorrect(false);
      setStreak(0);
    }
  }, [remaining, revealed]);

  const playTone = (ok: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = ok ? 880 : 220;
      gain.gain.value = 0.05;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore audio errors
    }
  };

  const checkAnswer = (value: string) => {
    if (revealed || !current) return;
    const ok = value.trim().toLowerCase() === current.answer.trim().toLowerCase();
    setSelected(value);
    setRevealed(true);
    setWasCorrect(ok);
    if (ok) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      playTone(true);
    } else {
      setStreak(0);
      playTone(false);
    }
  };

  if (!current) return null;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} / {questions.length}
        </span>
        <span>
          Score {score} · Série {streak} · {Math.max(remaining, 0)}s
        </span>
      </div>

      <h2 className="font-display text-xl font-semibold leading-snug">{current.question}</h2>

      {useOptions ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {current.options!.map((option) => {
            const isCorrect = option === current.answer;
            const isSelected = selected === option;
            let className =
              'rounded-xl border border-border px-4 py-3 text-left text-sm transition-colors';
            if (revealed && isCorrect) className += ' border-quiz-accent bg-quiz-accent/15';
            else if (revealed && isSelected && !isCorrect)
              className += ' border-destructive bg-destructive/10';
            else if (!revealed) className += ' hover:bg-secondary';
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => checkAnswer(option)}
                className={className}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            checkAnswer(typed);
          }}
        >
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Votre réponse…"
            disabled={revealed}
          />
          <Button type="submit" disabled={revealed || !typed.trim()}>
            Valider
          </Button>
        </form>
      )}

      {revealed ? (
        <div className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm">
          <p className="font-medium">
            {wasCorrect ? 'Bonne réponse !' : `Réponse : ${current.answer}`}
          </p>
          <p className="mt-1 text-muted-foreground">{current.explanation}</p>
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={() => {
                if (index + 1 >= questions.length) {
                  onFinish(score);
                } else {
                  setIndex((i) => i + 1);
                  setSelected(null);
                  setTyped('');
                  setRevealed(false);
                  setWasCorrect(false);
                }
              }}
            >
              {index + 1 >= questions.length ? 'Voir le score' : 'Question suivante'}
            </Button>
            <Button type="button" variant="ghost" onClick={onAbort}>
              Abandonner
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
