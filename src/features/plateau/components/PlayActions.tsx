import { Button } from '@/components/ui/primitives';

interface PlayActionsProps {
  revealed: boolean;
  isLast: boolean;
  onSkip: () => void;
  onNext: () => void;
  onAbort: () => void;
}

/** Skip while answering; next / abort after reveal. */
export function PlayActions({
  revealed,
  isLast,
  onSkip,
  onNext,
  onAbort,
}: PlayActionsProps) {
  if (!revealed) {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={onSkip}>
          Passer
        </Button>
        <Button type="button" variant="ghost" onClick={onAbort}>
          Abandonner
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" onClick={onNext}>
        {isLast ? 'Voir les résultats' : 'Question suivante'}
      </Button>
      <Button type="button" variant="ghost" onClick={onAbort}>
        Abandonner
      </Button>
    </div>
  );
}
