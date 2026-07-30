import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface TxtImportButtonProps {
  onFile: (file: File) => void;
}

export function TxtImportButton({ onFile }: TxtImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <FileText className="h-3.5 w-3.5" />
        Importer .txt
      </Button>
    </>
  );
}
