import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useEndOnVisibilityHidden } from '@/features/jetpunk/hooks/useEndOnVisibilityHidden';
import { useQuizClock } from '@/features/jetpunk/hooks/useQuizClock';
import { Stats, type QuizResult } from '@/features/jetpunk/Stats';
import { Button, Input } from '@/components/ui/primitives';
import type { JetPunkHistoryEntry, JetPunkItem } from '@/types';

interface QuizRunnerProps {
  title: string;
  durationSec: number;
  items: JetPunkItem[];
  previousBest: number | null;
  recentAttempts: JetPunkHistoryEntry[];
  onFinish: (result: QuizResult) => void;
  onClose: () => void;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function formatClock(totalSec: number): string {
  const safe = Math.max(0, totalSec);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function QuizRunner({
  title,
  durationSec,
  items,
  previousBest,
  recentAttempts,
  onFinish,
  onClose,
}: QuizRunnerProps) {
  const playableItems = useMemo(
    () => items.filter((item) => item.answer.trim()),
    [items]
  );
  const [input, setInput] = useState('');
  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [summary, setSummary] = useState<{
    result: QuizResult;
    previousBest: number | null;
    interruptedByFocus: boolean;
  } | null>(null);
  const endedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const foundIdsRef = useRef(foundIds);
  const endQuizRef = useRef<(interruptedByFocus?: boolean) => void>(() => {});
  foundIdsRef.current = foundIds;

  const score = foundIds.size;
  const total = playableItems.length;
  const allFound = score >= total && total > 0;
  const playing = summary === null;

  const clock = useQuizClock({
    durationSec,
    playing,
    allFound,
    onTimedOut: () => endQuizRef.current(false),
  });

  const endQuiz = (interruptedByFocus = false) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const next: QuizResult = {
      score: foundIdsRef.current.size,
      total,
      durationSec: clock.untimed ? 0 : durationSec,
      elapsedSec: clock.elapsedSec,
      foundIds: [...foundIdsRef.current],
    };
    if (interruptedByFocus) {
      toast.message('Quiz interrompu : tu as quitté l’onglet.');
    }
    setSummary({ result: next, previousBest, interruptedByFocus });
    onFinish(next);
  };
  endQuizRef.current = endQuiz;

  useEndOnVisibilityHidden(playing, () => endQuiz(true));

  useEffect(() => {
    if (!playing) return;
    inputRef.current?.focus();
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    if (allFound) endQuiz(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, allFound]);

  const tryMatch = (raw: string) => {
    const guess = normalize(raw);
    if (!guess) return false;

    const match = playableItems.find(
      (item) => !foundIds.has(item.id) && normalize(item.answer) === guess
    );
    if (!match) return false;

    setFoundIds((prev) => new Set(prev).add(match.id));
    setInput('');
    return true;
  };

  const handleReplay = () => {
    endedRef.current = false;
    setSummary(null);
    setInput('');
    setFoundIds(new Set());
    clock.reset();
  };

  if (summary) {
    return (
      <Stats
        title={title}
        items={items}
        result={summary.result}
        previousBest={summary.previousBest}
        recentAttempts={recentAttempts}
        interruptedByFocus={summary.interruptedByFocus}
        onReplay={handleReplay}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {clock.untimed ? 'Quiz sans chrono' : 'Quiz chronométré'}
            </p>
            <h2 className="truncate font-display text-lg font-semibold sm:text-xl">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="font-display text-xl font-semibold tabular-nums">
              {score} / {total}
            </p>
            <p className="font-mono text-xl tabular-nums">
              {clock.untimed
                ? formatClock(clock.elapsedSec)
                : formatClock(clock.remaining)}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-3 w-full max-w-5xl">
          <Input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => {
              const next = e.target.value;
              setInput(next);
              tryMatch(next);
            }}
            placeholder="Tapez une réponse…"
            className="h-12 text-base"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="w-12 px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Indice</th>
                <th className="px-3 py-2.5">Réponse</th>
              </tr>
            </thead>
            <tbody>
              {playableItems.map((item, index) => {
                const found = foundIds.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className="border-t border-border even:bg-card/40"
                  >
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {item.prompt.trim() || '—'}
                    </td>
                    <td
                      className={
                        found
                          ? 'px-3 py-2 font-medium text-foreground'
                          : 'px-3 py-2 text-transparent select-none'
                      }
                    >
                      {found ? item.answer : '\u00a0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl justify-center">
          <Button type="button" variant="ghost" onClick={() => endQuiz(false)}>
            Terminer
          </Button>
        </div>
      </footer>
    </div>
  );
}
