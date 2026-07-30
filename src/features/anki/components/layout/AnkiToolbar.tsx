import { useEffect, useState } from 'react';
import { Download, ListChecks, Sparkles } from 'lucide-react';
import { AnkiHelpButton, AnkiHelpDialog } from '@/features/anki/components/help/AnkiHelpDialog';
import { TxtImportButton } from '@/features/anki/components/import/TxtImportButton';
import { Button } from '@/components/ui/primitives';

interface AnkiToolbarProps {
  selectedDeck: string | null;
  dueCount: number;
  showAiPanel: boolean;
  transferCount: number;
  onRenameDeck: (nextName: string) => boolean;
  onStartReview: () => void;
  onToggleAiPanel: () => void;
  onTxtFile: (file: File) => void;
  onExport: () => void;
  onTransferToJetpunk: () => void;
}

export function AnkiToolbar({
  selectedDeck,
  dueCount,
  showAiPanel,
  transferCount,
  onRenameDeck,
  onStartReview,
  onToggleAiPanel,
  onTxtFile,
  onExport,
  onTransferToJetpunk,
}: AnkiToolbarProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [draftName, setDraftName] = useState(selectedDeck ?? '');

  useEffect(() => {
    setDraftName(selectedDeck ?? '');
  }, [selectedDeck]);

  const commitRename = () => {
    if (!selectedDeck) return;
    const ok = onRenameDeck(draftName);
    if (!ok) setDraftName(selectedDeck);
  };

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-3">
          {selectedDeck ? (
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'Escape') {
                  setDraftName(selectedDeck);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Nom du deck"
              aria-label="Nom du deck"
              className="min-w-0 flex-1 bg-transparent font-display text-2xl font-semibold outline-none placeholder:text-muted-foreground/50"
            />
          ) : (
            <h1 className="min-w-0 flex-1 font-display text-2xl font-semibold">
              Tous les decks
            </h1>
          )}
          <AnkiHelpButton onClick={() => setHelpOpen(true)} />
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
