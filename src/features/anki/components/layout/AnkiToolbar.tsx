import { useEffect, useState } from 'react';
import { Download, ListChecks, MoreHorizontal, Sparkles } from 'lucide-react';
import { AnkiHelpButton, AnkiHelpDialog } from '@/features/anki/components/help/AnkiHelpDialog';
import { TxtImportButton } from '@/features/anki/components/import/TxtImportButton';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

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
  /** Below sm, secondary actions sit behind a "…" toggle; kept open while the AI panel is shown. */
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || showAiPanel;

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
          <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">Titre :</span>
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
              className="min-w-0 flex-1 bg-transparent font-display text-xl font-semibold outline-none sm:text-2xl placeholder:text-muted-foreground/50"
            />
          ) : (
            <h1 className="min-w-0 flex-1 font-display text-xl font-semibold sm:text-2xl">
              Tous les decks
            </h1>
          )}
          <AnkiHelpButton onClick={() => setHelpOpen(true)} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="accent" size="sm" className="h-10 md:h-8" onClick={onStartReview}>
            <Sparkles className="h-3.5 w-3.5" />
            Réviser ({dueCount})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-10 sm:hidden"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={showMore}
            aria-controls="anki-toolbar-more"
            aria-label={showMore ? 'Masquer les autres actions' : 'Autres actions'}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {/* Its own row below sm when expanded; plain items of the toolbar from sm up. */}
          <div
            id="anki-toolbar-more"
            className={cn('w-full flex-wrap gap-1.5 sm:contents', showMore ? 'flex' : 'hidden')}
          >
            <Button type="button" variant="secondary" size="sm" className="h-10 md:h-8" onClick={onToggleAiPanel}>
              <Sparkles className="h-3.5 w-3.5" />
              {showAiPanel ? 'Masquer' : 'Générer par IA'}
            </Button>
            <TxtImportButton onFile={onTxtFile} />
            <Button type="button" variant="outline" size="sm" className="h-10 md:h-8" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              Exporter .txt
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 md:h-8"
              disabled={transferCount === 0}
              onClick={onTransferToJetpunk}
              title="Créer une liste JetPunk (catégorie ← thème du deck Parent::Liste)"
            >
              <ListChecks className="h-3.5 w-3.5" />
              Vers JetPunk
            </Button>
          </div>
        </div>
      </div>
      <AnkiHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
