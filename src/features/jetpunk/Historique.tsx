import type { JetPunkHistoryEntry } from '@/types';

interface HistoriqueProps {
  entries: JetPunkHistoryEntry[];
  title?: string;
  limit?: number;
  emptyLabel?: string;
  /** When true, hide the whole block if there are no entries. */
  hideWhenEmpty?: boolean;
}

function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function Historique({
  entries,
  title = 'Historique',
  limit,
  emptyLabel = 'Aucune partie jouée pour le moment.',
  hideWhenEmpty = false,
}: HistoriqueProps) {
  const visible = limit ? entries.slice(0, limit) : entries;

  if (hideWhenEmpty && visible.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {visible.map((entry) => {
            const percent =
              entry.total > 0
                ? Math.round((entry.score / entry.total) * 100)
                : 0;
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium tabular-nums">
                    {entry.score}/{entry.total}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {percent}%
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.playedAt)}
                  </p>
                </div>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDuration(entry.elapsedSec)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
