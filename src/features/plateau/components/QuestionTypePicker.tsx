import {
  ALL_QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  toggleQuestionType,
} from '@/features/plateau/lib/question-types';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/types';

interface QuestionTypePickerProps {
  selected: QuestionType[];
  onChange: (types: QuestionType[]) => void;
}

export function QuestionTypePicker({ selected, onChange }: QuestionTypePickerProps) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium">Types de questions</p>
      <div className="flex flex-wrap gap-2">
        {ALL_QUESTION_TYPES.map((type) => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(toggleQuestionType(selected, type))}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'border-quiz-accent bg-quiz-accent/15 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {QUESTION_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
