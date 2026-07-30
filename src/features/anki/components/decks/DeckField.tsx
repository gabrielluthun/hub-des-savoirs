import { useId } from 'react';
import { Input } from '@/components/ui/primitives';

interface DeckFieldProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

export function DeckField({ value, onChange, suggestions = [] }: DeckFieldProps) {
  const listId = useId();

  return (
    <>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Histoire ou Histoire::Capétiens…"
        list={listId}
      />
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  );
}
