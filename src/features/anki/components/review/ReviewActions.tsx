import { Button } from '@/components/ui/primitives';
import { SRS_GRADE_LABELS, type SrsGrade } from '@/features/anki/lib/srs/grades';
import { formatIntervalHint } from '@/features/anki/lib/srs/schedule';
import type { AnkiCard } from '@/types';

interface ReviewActionsProps {
  card: AnkiCard;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (grade: SrsGrade) => void;
}

const GRADES: SrsGrade[] = ['again', 'ok', 'easy'];

export function ReviewActions({ card, revealed, onReveal, onGrade }: ReviewActionsProps) {
  if (!revealed) {
    return (
      <Button type="button" className="w-full" onClick={onReveal}>
        Afficher la réponse
      </Button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {GRADES.map((grade) => (
        <Button
          key={grade}
          type="button"
          variant={grade === 'again' ? 'destructive' : grade === 'easy' ? 'accent' : 'secondary'}
          onClick={() => onGrade(grade)}
          className="flex h-auto flex-col gap-0.5 py-3"
        >
          <span>{SRS_GRADE_LABELS[grade]}</span>
          <span className="text-[10px] font-normal opacity-80">
            {formatIntervalHint(grade, card)}
          </span>
        </Button>
      ))}
    </div>
  );
}
