import { Download, Sparkles } from 'lucide-react';
import { TxtImportButton } from '@/features/anki/components/import/TxtImportButton';
import { Button } from '@/components/ui/primitives';

interface AnkiToolbarProps {
  dueCount: number;
  showAiPanel: boolean;
  onStartReview: () => void;
  onToggleAiPanel: () => void;
  onTxtFile: (file: File) => void;
  onExport: () => void;
}

export function AnkiToolbar({
  dueCount,
  showAiPanel,
  onStartReview,
  onToggleAiPanel,
  onTxtFile,
  onExport,
}: AnkiToolbarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cartes de révision
        </p>
        <h1 className="font-display text-2xl font-semibold">Anki — Éditeur & Export</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Format .txt : Question;Réponse;Deck (;Mnémotechnique;Tags optionnels).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="accent" onClick={onStartReview}>
          <Sparkles className="h-4 w-4" />
          Réviser ({dueCount})
        </Button>
        <Button type="button" variant="secondary" onClick={onToggleAiPanel}>
          <Sparkles className="h-4 w-4" />
          {showAiPanel ? 'Masquer IA' : 'IA depuis Docs'}
        </Button>
        <TxtImportButton onFile={onTxtFile} />
        <Button type="button" variant="outline" onClick={onExport}>
          <Download className="h-4 w-4" />
          Exporter .txt
        </Button>
      </div>
    </div>
  );
}
