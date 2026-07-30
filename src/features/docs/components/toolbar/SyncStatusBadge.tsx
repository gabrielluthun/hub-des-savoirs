import { cn } from '@/lib/utils';
import type { DocSyncStatus } from '@/features/docs/lib/doc-sync';

const LABELS: Record<DocSyncStatus, string> = {
  unsynced: 'Non synchronisé',
  in_sync: 'À jour',
  local_modified: 'Modifié localement',
};

interface SyncStatusBadgeProps {
  status: DocSyncStatus;
  lastImportedAt?: string;
  className?: string;
}

export function SyncStatusBadge({ status, lastImportedAt, className }: SyncStatusBadgeProps) {
  const title =
    lastImportedAt && status !== 'unsynced'
      ? `Dernier import : ${new Date(lastImportedAt).toLocaleString('fr-FR')}`
      : undefined;

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        status === 'in_sync' && 'bg-quiz-accent/15 text-quiz-accent',
        status === 'local_modified' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        status === 'unsynced' && 'bg-secondary text-muted-foreground',
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
