import { Button, Dialog } from '@/components/ui/primitives';
import { ReviewActions } from '@/features/anki/components/review/ReviewActions';
import { ReviewCardFace } from '@/features/anki/components/review/ReviewCardFace';
import { ReviewProgress } from '@/features/anki/components/review/ReviewProgress';
import type { SrsGrade } from '@/features/anki/lib/srs/grades';
import type { AnkiCard } from '@/types';

interface ReviewSessionProps {
  current: AnkiCard | null;
  remaining: number;
  reviewedCount: number;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (grade: SrsGrade) => void;
  onClose: () => void;
}

export function ReviewSession({
  current,
  remaining,
  reviewedCount,
  revealed,
  onReveal,
  onGrade,
  onClose,
}: ReviewSessionProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      closeOnBackdrop={false}
      titleId="review-session-title"
      eyebrow="Révision SRS"
      title="Session en cours"
      bodyClassName="flex flex-col gap-4"
      // Grade buttons stay pinned at the bottom, within thumb reach, however long the card is.
      footer={
        current ? (
          <ReviewActions
            card={current}
            revealed={revealed}
            onReveal={onReveal}
            onGrade={onGrade}
          />
        ) : undefined
      }
    >
      <ReviewProgress remaining={remaining} reviewedCount={reviewedCount} />

      {current ? (
        <ReviewCardFace
          question={current.question}
          answer={current.answer}
          deck={current.deck}
          mnemonic={current.mnemonic}
          revealed={revealed}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold">Session terminée</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {reviewedCount > 0
              ? `${reviewedCount} carte${reviewedCount > 1 ? 's' : ''} revue${reviewedCount > 1 ? 's' : ''}.`
              : 'Aucune carte due pour le moment.'}
          </p>
          <Button type="button" className="mt-6" onClick={onClose}>
            Fermer
          </Button>
        </div>
      )}
    </Dialog>
  );
}
