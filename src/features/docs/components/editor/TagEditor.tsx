import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/primitives';
import { addTag, formatTagLabel, removeTag } from '@/features/docs/lib/tags';

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = addTag(tags, draft);
    if (next.length !== tags.length) {
      onChange(next);
    }
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

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground"
          >
            {formatTagLabel(tag)}
            <button
              type="button"
              onClick={() => onChange(removeTag(tags, tag))}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label={`Retirer le tag ${formatTagLabel(tag)}`}
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
          placeholder={tags.length === 0 ? 'Ajouter un tag…' : 'Tag…'}
          className="h-8 min-w-[120px] flex-1 border-dashed text-xs"
        />
      </form>
      <p className="text-[10px] text-muted-foreground">
        Utilisez la touche <kbd>Entrée</kbd> ou <kbd>Virgule</kbd> pour valider.
      </p>
    </div>
  );
}
