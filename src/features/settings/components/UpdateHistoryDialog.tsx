import { RELEASE_HISTORY } from '@/features/settings/lib/release-history';
import { Dialog } from '@/components/ui/primitives';

interface UpdateHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UpdateHistoryDialog({ open, onClose }: UpdateHistoryDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      titleId="update-history-title"
      eyebrow="Mises à jour"
      title="Historique"
      size="md"
      bodyClassName="space-y-8"
    >
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
    </Dialog>
  );
}
