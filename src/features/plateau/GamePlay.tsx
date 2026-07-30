import { useEffect, useRef, useState } from 'react';
import { ListAnswerPanel } from '@/features/plateau/components/ListAnswerPanel';
import type {
  PlateauAnswerRecord,
  PlateauGameResult,
} from '@/features/plateau/lib/game-result';
import { scoreFromAnswers } from '@/features/plateau/lib/game-result';
import {
  answersMatch,
  findMatchingListItem,
  QUESTION_TYPE_LABELS,
} from '@/features/plateau/lib/question-types';
import { Button, Input } from '@/components/ui/primitives';
import type { GeneratedQuestion } from '@/types';

interface GamePlayProps {
  questions: GeneratedQuestion[];
  soundEnabled: boolean;
  onFinish: (result: PlateauGameResult) => void;
  onAbort: () => void;
}

function questionDuration(question: GeneratedQuestion): number {
  return question.type === 'liste' ? 45 : 30;
}

export function GamePlay({ questions, soundEnabled, onFinish, onAbort }: GamePlayProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [remaining, setRemaining] = useState(30);
  const recordsRef = useRef<PlateauAnswerRecord[]>([]);
  const startedAtRef = useRef(Date.now());
  const recordedIndexRef = useRef<number | null>(null);

  const current = questions[index];
  const listItems = current?.answers ?? [];
  const isList = current?.type === 'liste';
  const useOptions = Boolean(
    current &&
      (current.type === 'qcm' || current.type === 'vrai_faux') &&
      current.options &&
      current.options.length >= 2
  );

  useEffect(() => {
    if (!current || revealed) return;
    setRemaining(questionDuration(current));
    const timer = window.setInterval(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [index, revealed, current]);

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
      // ignore
    }
  };

  const appendRecord = (record: PlateauAnswerRecord) => {
    if (recordedIndexRef.current === index) return;
    recordedIndexRef.current = index;
    recordsRef.current = [...recordsRef.current, record];
  };

  const settle = (ok: boolean, userAnswer: string) => {
    if (!current || revealed) return;
    appendRecord({ question: current, correct: ok, userAnswer });
    setSelected(userAnswer);
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

  useEffect(() => {
    if (remaining > 0 || revealed || !current) return;
    if (isList) {
      const ok = foundItems.length === listItems.length && listItems.length > 0;
      settle(ok, foundItems.join(', ') || '—');
      return;
    }
    settle(false, selected ?? (typed.trim() || '—'));
    // settle intentionally closes over latest answer fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, revealed, current, isList, foundItems.length, listItems.length]);

  const checkAnswer = (value: string) => {
    if (revealed || !current || isList) return;
    settle(answersMatch(value, current.answer), value);
  };

  const submitListGuess = () => {
    if (revealed || !current || !isList || !typed.trim()) return;
    const match = findMatchingListItem(typed, listItems, new Set(foundItems));
    setTyped('');
    if (!match) {
      playTone(false);
      return;
    }
    const next = [...foundItems, match];
    setFoundItems(next);
    playTone(true);
    if (next.length >= listItems.length) {
      settle(true, next.join(', '));
    }
  };

  const finish = () => {
    const answers = recordsRef.current;
    onFinish({
      score: scoreFromAnswers(answers),
      total: questions.length,
      elapsedSec: Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
      answers,
    });
  };

  const goNext = () => {
    if (index + 1 >= questions.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTyped('');
    setFoundItems([]);
    setRevealed(false);
    setWasCorrect(false);
    recordedIndexRef.current = null;
  };

  if (!current) return null;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} / {questions.length}
          <span className="ml-2 text-xs">· {QUESTION_TYPE_LABELS[current.type]}</span>
        </span>
        <span>
          Score {score} · Série {streak} · {Math.max(remaining, 0)}s
        </span>
      </div>

      <h2 className="font-display text-xl font-semibold leading-snug">{current.question}</h2>

      {useOptions ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {current.options!.map((option) => {
            const isCorrect = answersMatch(option, current.answer);
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
      ) : null}

      {current.type === 'libre' ? (
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
      ) : null}

      {isList ? (
        <ListAnswerPanel
          items={listItems}
          foundItems={foundItems}
          revealed={revealed}
          typed={typed}
          onTypedChange={setTyped}
          onSubmit={submitListGuess}
        />
      ) : null}

      {revealed ? (
        <div className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm">
          <p className="font-medium">
            {wasCorrect
              ? 'Bonne réponse !'
              : isList
                ? `Éléments : ${listItems.join(', ')}`
                : `Réponse : ${current.answer}`}
          </p>
          <p className="mt-1 text-muted-foreground">{current.explanation}</p>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={goNext}>
              {index + 1 >= questions.length ? 'Voir les résultats' : 'Question suivante'}
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
