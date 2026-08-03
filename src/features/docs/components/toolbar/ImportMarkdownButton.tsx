import { useRef, type ChangeEvent } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import {
  readMarkdownFile,
  type MarkdownImportResult,
} from '@/features/docs/lib/import-markdown';

interface ImportMarkdownButtonProps {
  onImported: (result: MarkdownImportResult) => void;
  onError: (message: string) => void;
}

export function ImportMarkdownButton({ onImported, onError }: ImportMarkdownButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const result = await readMarkdownFile(file);
      onImported(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Échec de l'import Markdown.");
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/x-markdown"
        className="hidden"
        onChange={handleChange}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <FileText className="h-4 w-4" />
        Importer depuis l&apos;ordinateur
      </Button>
    </>
  );
}
