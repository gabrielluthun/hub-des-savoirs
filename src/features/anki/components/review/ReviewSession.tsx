import { X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Révision SRS
            </p>
            <h2 className="font-display text-xl font-semibold">Session en cours</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ReviewProgress remaining={remaining} reviewedCount={reviewedCount} />

        {current ? (
          <>
            <ReviewCardFace
              question={current.question}
              answer={current.answer}
              deck={current.deck}
              mnemonic={current.mnemonic}
              revealed={revealed}
            />
            <ReviewActions
              card={current}
              revealed={revealed}
              onReveal={onReveal}
              onGrade={onGrade}
            />
          </>
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
      </div>
    </div>
  );
}
