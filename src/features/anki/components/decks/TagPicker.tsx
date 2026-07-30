import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/primitives';
import { addTag, formatTagLabel, removeTag } from '@/features/anki/lib/tags';

interface TagPickerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagPicker({ tags, onChange, suggestions = [] }: TagPickerProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = addTag(tags, draft);
    if (next.length !== tags.length) onChange(next);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(removeTag(tags, tags[tags.length - 1]!));
    }
    if (event.key === ',' || event.key === ';') {
      event.preventDefault();
      commit();
    }
  };

  const unusedSuggestions = suggestions.filter((tag) => !tags.includes(tag)).slice(0, 6);

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs"
          >
            {formatTagLabel(tag)}
            <button
              type="button"
              onClick={() => onChange(removeTag(tags, tag))}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label={`Retirer ${formatTagLabel(tag)}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) commit();
          }}
          placeholder={tags.length === 0 ? 'Tags…' : 'Tag…'}
          className="h-8 min-w-[100px] flex-1 border-dashed text-xs"
        />
      </form>
      {unusedSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {unusedSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(addTag(tags, tag))}
              className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              + {formatTagLabel(tag)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
