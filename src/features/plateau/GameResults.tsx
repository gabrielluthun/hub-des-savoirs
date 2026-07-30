import {
  isNewScoreRecord,
  type PlateauGameResult,
  type PlateauScoreMark,
} from '@/features/plateau/lib/game-result';
import { QUESTION_TYPE_LABELS } from '@/features/plateau/lib/question-types';
import {
  resolveSourceLink,
  sourceLinkLabel,
  type PlateauSourceLink,
} from '@/features/plateau/lib/resolve-source';
import { Button } from '@/components/ui/primitives';
import type { AnkiCard, Difficulty, HubDocument, JetPunkList } from '@/types';

interface GameResultsProps {
  result: PlateauGameResult;
  difficulty: Difficulty;
  previousBest: PlateauScoreMark | null;
  docs: HubDocument[];
  cards: AnkiCard[];
  lists: JetPunkList[];
  onReplay: () => void;
  onClose: () => void;
  onOpenSource: (link: PlateauSourceLink) => void;
}

function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function GameResults({
  result,
  difficulty,
  previousBest,
  docs,
  cards,
  lists,
  onReplay,
  onClose,
  onOpenSource,
}: GameResultsProps) {
  const percent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const currentMark = { score: result.score, total: result.total };
  const isNewBest = isNewScoreRecord(currentMark, previousBest);
  const recordMark = isNewBest
    ? currentMark
    : (previousBest ?? currentMark);
  const mistakes = result.answers.filter((entry) => !entry.correct);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-quiz-accent">
            Résultats
          </p>
          <h2 className="font-display text-xl font-semibold sm:text-2xl">
            Le Maître du Quiz TV
          </h2>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Score"
              value={`${result.score}/${result.total}`}
            />
            <StatCard label="Réussite" value={`${percent}%`} />
            <StatCard
              label="Temps"
              value={formatDuration(result.elapsedSec)}
              hint={`Difficulté ${difficulty}`}
            />
            <StatCard
              label="Record"
              value={`${recordMark.score}/${recordMark.total}`}
              hint={
                previousBest === null
                  ? 'Première partie'
                  : isNewBest
                    ? 'Nouveau record'
                    : 'Meilleur taux'
              }
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="w-12 px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Question</th>
                  <th className="w-28 px-3 py-2.5">Type</th>
                  <th className="w-28 px-3 py-2.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {result.answers.map((entry, index) => (
                  <tr
                    key={`${entry.question.question}-${index}`}
                    className="border-t border-border even:bg-card/40"
                  >
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2">{entry.question.question}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {QUESTION_TYPE_LABELS[entry.question.type]}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          entry.correct
                            ? 'text-xs font-medium text-emerald-500'
                            : 'text-xs font-medium text-destructive'
                        }
                      >
                        {entry.correct ? 'OK' : 'Ratée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Relecture des erreurs
            </p>
            {mistakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune erreur — parfait.
              </p>
            ) : (
              <div className="space-y-3">
                {mistakes.map((entry, index) => {
                  const link = resolveSourceLink({
                    answer: entry.question.answer,
                    question: entry.question.question,
                    docs,
                    cards,
                    lists,
                  });
                  const expected =
                    entry.question.type === 'liste'
                      ? (entry.question.answers ?? [entry.question.answer]).join(
                          ', '
                        )
                      : entry.question.answer;
                  return (
                    <div
                      key={`miss-${index}-${entry.question.question}`}
                      className="rounded-xl border border-border px-4 py-3"
                    >
                      <p className="text-sm font-medium">{entry.question.question}</p>
                      <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Ta réponse :{' '}
                          </dt>
                          <dd className="inline">{entry.userAnswer || '—'}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-foreground">
                            Bonne réponse :{' '}
                          </dt>
                          <dd className="inline">{expected}</dd>
                        </div>
                        {entry.question.explanation ? (
                          <div>
                            <dt className="inline font-medium text-foreground">
                              Explication :{' '}
                            </dt>
                            <dd className="inline">{entry.question.explanation}</dd>
                          </div>
                        ) : null}
                      </dl>
                      {link ? (
                        <button
                          type="button"
                          onClick={() => onOpenSource(link)}
                          className="mt-3 text-xs font-medium text-quiz-accent hover:underline"
                        >
                          Voir la source · {sourceLinkLabel(link)}
                        </button>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Source d’origine introuvable automatiquement.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-2">
          <Button type="button" onClick={onReplay}>
            Rejouer
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </footer>
    </div>
  );
}
