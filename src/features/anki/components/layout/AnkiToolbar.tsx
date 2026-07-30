import { useState } from 'react';
import { Download, ListChecks, Sparkles } from 'lucide-react';
import { AnkiHelpButton, AnkiHelpDialog } from '@/features/anki/components/help/AnkiHelpDialog';
import { TxtImportButton } from '@/features/anki/components/import/TxtImportButton';
import { Button } from '@/components/ui/primitives';

interface AnkiToolbarProps {
  dueCount: number;
  showAiPanel: boolean;
  transferCount: number;
  onStartReview: () => void;
  onToggleAiPanel: () => void;
  onTxtFile: (file: File) => void;
  onExport: () => void;
  onTransferToJetpunk: () => void;
}

export function AnkiToolbar({
  dueCount,
  showAiPanel,
  transferCount,
  onStartReview,
  onToggleAiPanel,
  onTxtFile,
  onExport,
  onTransferToJetpunk,
}: AnkiToolbarProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cartes de révision
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold">Anki</h1>
            <AnkiHelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="accent" size="sm" onClick={onStartReview}>
            <Sparkles className="h-3.5 w-3.5" />
            Réviser ({dueCount})
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onToggleAiPanel}>
            <Sparkles className="h-3.5 w-3.5" />
            {showAiPanel ? 'Masquer IA' : 'IA depuis Docs'}
          </Button>
          <TxtImportButton onFile={onTxtFile} />
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Exporter .txt
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={transferCount === 0}
            onClick={onTransferToJetpunk}
            title="Créer une liste JetPunk (catégorie ← thème du deck Parent::Liste)"
          >
            <ListChecks className="h-3.5 w-3.5" />
            Vers JetPunk
          </Button>
        </div>
      </div>
      <AnkiHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
