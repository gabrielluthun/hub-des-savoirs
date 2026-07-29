import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [remaining, setRemaining] = useState(durationSec);
  const [input, setInput] = useState('');
  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [summary, setSummary] = useState<{
    result: QuizResult;
    previousBest: number | null;
  } | null>(null);
  const endedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const foundIdsRef = useRef(foundIds);
  const remainingRef = useRef(remaining);

  foundIdsRef.current = foundIds;
  remainingRef.current = remaining;

  const score = foundIds.size;
  const total = playableItems.length;
  const allFound = score >= total && total > 0;
  const playing = summary === null;

  const endQuiz = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    const timeLeft = remainingRef.current;
    const elapsedSec = timeLeft <= 0 ? durationSec : Math.max(0, durationSec - timeLeft);
    const next: QuizResult = {
      score: foundIdsRef.current.size,
      total,
      durationSec,
      elapsedSec,
      foundIds: [...foundIdsRef.current],
    };
    setSummary({ result: next, previousBest });
    onFinish(next);
  };

  useEffect(() => {
    if (!playing) return;
    inputRef.current?.focus();
  }, [playing]);

  useEffect(() => {
    if (!playing || remaining <= 0 || allFound) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, remaining, allFound]);

  useEffect(() => {
    if (!playing) return;
    if (remaining <= 0 || allFound) {
      endQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, remaining, allFound]);

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
    setRemaining(durationSec);
    setInput('');
    setFoundIds(new Set());
  };

  if (summary) {
    return (
      <Stats
        title={title}
        items={items}
        result={summary.result}
        previousBest={summary.previousBest}
        recentAttempts={recentAttempts}
        onReplay={handleReplay}
        onClose={onClose}
      />
    );
  }

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quiz chronométré
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
              {minutes}:{seconds.toString().padStart(2, '0')}
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
          <Button type="button" variant="ghost" onClick={endQuiz}>
            Terminer
          </Button>
        </div>
      </footer>
    </div>
  );
}
