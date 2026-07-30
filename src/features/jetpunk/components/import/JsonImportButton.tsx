import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface JsonImportButtonProps {
  onFile: (file: File) => void;
  className?: string;
  label?: string;
}

/** Native file picker for Hub JetPunk JSON exports — same pattern as Anki .txt import. */
export function JsonImportButton({
  onFile,
  className,
  label = 'Importer une liste',
}: JsonImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        <Upload className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    </>
  );
}
