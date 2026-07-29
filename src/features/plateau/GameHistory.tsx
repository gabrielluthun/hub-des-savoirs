import type { GameHistoryEntry } from '@/types';

interface GameHistoryProps {
  entries: GameHistoryEntry[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
}

export function GameHistory({ entries }: GameHistoryProps) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Dernières parties
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune partie jouée pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {entry.score}/{entry.total}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(entry.playedAt)}</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {entry.difficulty}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
