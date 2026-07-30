import { Historique } from '@/features/jetpunk/Historique';
import { ItemMissStats } from '@/features/jetpunk/components/ItemMissStats';
import {
  computeItemMissStats,
  type ItemMissStat,
} from '@/features/jetpunk/lib/item-stats';
import { Button } from '@/components/ui/primitives';
import type { JetPunkHistoryEntry, JetPunkItem } from '@/types';

export interface QuizResult {
  score: number;
  total: number;
  durationSec: number;
  elapsedSec: number;
  foundIds: string[];
}

interface StatsProps {
  title: string;
  items: JetPunkItem[];
  result: QuizResult;
  previousBest: number | null;
  recentAttempts: JetPunkHistoryEntry[];
  interruptedByFocus?: boolean;
  missStats?: ItemMissStat[];
  onReplay: () => void;
  onFocusReplay?: () => void;
  onClose: () => void;
}

function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function Stats({
  title,
  items,
  result,
  previousBest,
  recentAttempts,
  interruptedByFocus = false,
  missStats,
  onReplay,
  onFocusReplay,
  onClose,
}: StatsProps) {
  const playableItems = items.filter((item) => item.answer.trim());
  const foundSet = new Set(result.foundIds);
  const percent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const isNewBest =
    previousBest === null ? result.score > 0 : result.score > previousBest;
  const recordScore = isNewBest
    ? result.score
    : (previousBest ?? result.score);
  const completed = result.score === result.total && result.total > 0;
  const aggregateMissStats =
    missStats ?? computeItemMissStats(items, recentAttempts);
  const missedThisGame = playableItems.filter((item) => !foundSet.has(item.id));
  const canFocus =
    Boolean(onFocusReplay) &&
    (missedThisGame.length > 0 || aggregateMissStats.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Résultats
          </p>
          <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {interruptedByFocus ? (
            <p className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              Partie interrompue parce que l’onglet a été quitté. Le score actuel a été
              enregistré.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Score
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {result.score}/{result.total}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Réussite
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {percent}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Temps
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {formatDuration(result.elapsedSec)}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.durationSec > 0
                  ? `sur ${formatDuration(result.durationSec)}`
                  : 'mode sans chrono'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Record
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {recordScore}
                <span className="text-base text-muted-foreground">
                  /{result.total}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {previousBest === null
                  ? 'Première partie'
                  : isNewBest
                    ? 'Nouveau record'
                    : 'Meilleur score'}
              </p>
            </div>
          </div>

          {completed ? (
            <p className="text-sm text-muted-foreground">
              Liste complète en {formatDuration(result.elapsedSec)}.
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="w-12 px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Indice</th>
                  <th className="px-3 py-2.5">Réponse</th>
                  <th className="w-28 px-3 py-2.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {playableItems.map((item, index) => {
                  const found = foundSet.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-border even:bg-card/40"
                    >
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">{item.prompt.trim() || '—'}</td>
                      <td className="px-3 py-2 font-medium">{item.answer}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            found
                              ? 'text-xs font-medium text-emerald-500'
                              : 'text-xs font-medium text-destructive'
                          }
                        >
                          {found ? 'Trouvée' : 'Manquée'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ItemMissStats stats={aggregateMissStats} />

          {recentAttempts.length > 0 ? (
            <Historique
              entries={recentAttempts}
              title="Historique de cette liste"
              limit={8}
            />
          ) : null}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-2">
          <Button type="button" onClick={onReplay}>
            Rejouer
          </Button>
          {canFocus ? (
            <Button type="button" variant="secondary" onClick={onFocusReplay}>
              Focus manquées
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </footer>
    </div>
  );
}
