import { X } from 'lucide-react';
import { RELEASE_HISTORY } from '@/features/settings/lib/release-history';
import { Button } from '@/components/ui/primitives';

interface UpdateHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UpdateHistoryDialog({ open, onClose }: UpdateHistoryDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-history-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mises à jour
            </p>
            <h2 id="update-history-title" className="font-display text-xl font-semibold">
              Historique
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-8 overflow-y-auto px-5 py-6">
          {RELEASE_HISTORY.map((release) => (
            <section key={release.version} className="space-y-3">
              <h3 className="font-display text-lg font-semibold">{release.version}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {release.changes.map((change) => (
                  <li key={`${release.version}-${change.keyword}-${change.description}`}>
                    <span className="font-medium text-foreground">{change.keyword}</span>
                    {' : '}
                    {change.description}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
