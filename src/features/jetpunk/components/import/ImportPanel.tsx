import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button, Textarea } from '@/components/ui/primitives';

interface ImportPanelProps {
  paste: string;
  onPasteChange: (value: string) => void;
  onImportPaste: () => void;
  onImportFile: (file: File) => void;
  onClose: () => void;
}

export function ImportPanel({
  paste,
  onPasteChange,
  onImportPaste,
  onImportFile,
  onClose,
}: ImportPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="mb-5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Import
          </p>
          <h3 className="font-display text-lg font-semibold">Ajouter des listes</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Fichier <code className="text-foreground">.json</code> (format export Hub) ou
            collage JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Fermer
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onImportFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Fichier .json
        </Button>
      </div>

      <Textarea
        value={paste}
        onChange={(e) => onPasteChange(e.target.value)}
        className="mt-3 min-h-[140px] font-mono text-xs"
        placeholder='{ "version": 1, "lists": [ … ] }'
      />
      <Button
        type="button"
        className="mt-3"
        disabled={!paste.trim()}
        onClick={onImportPaste}
      >
        <Upload className="h-4 w-4" />
        Importer le JSON
      </Button>
    </aside>
  );
}
