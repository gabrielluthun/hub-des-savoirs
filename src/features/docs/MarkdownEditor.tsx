import { Textarea } from '@/components/ui/primitives';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-full min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-sm leading-relaxed focus:ring-0"
      placeholder="# Titre&#10;- Point 1&#10;- Point 2"
      spellCheck={false}
    />
  );
}
