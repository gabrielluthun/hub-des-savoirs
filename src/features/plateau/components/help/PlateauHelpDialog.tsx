import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface PlateauHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PlateauHelpDialog({ open, onClose }: PlateauHelpDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plateau-help-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Premiers pas
            </p>
            <h2 id="plateau-help-title" className="font-display text-xl font-semibold">
              Comment ça marche ?
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
          <section className="space-y-2">
            <p className="text-muted-foreground">
              Le Plateau génère un <span className="text-foreground">quiz IA</span> à partir de
              tes notes Google Docs, cartes Anki ou listes JetPunk.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Avant de lancer</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Une <span className="text-foreground">clé API Gemini</span> est requise
                (Paramètres).
              </li>
              <li>
                Choisis le <span className="text-foreground">nombre</span> de questions et la{' '}
                <span className="text-foreground">difficulté</span>.
              </li>
              <li>
                Sélectionne la <span className="text-foreground">source</span> : tout le Hub, ou
                seulement certains docs / decks / listes.
              </li>
              <li>
                Coche les <span className="text-foreground">types de questions</span> voulus
                (QCM, réponse libre, etc.).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Pendant & après</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Réponds question par question ; le score se met à jour en direct.
              </li>
              <li>
                En fin de partie, tu vois le bilan et tu peux{' '}
                <span className="text-foreground">rejouer</span> ou ouvrir la source d’une
                question.
              </li>
              <li>
                L’historique en bas mémorise tes scores. Les faits récents sont évités pour
                limiter les répétitions.
              </li>
            </ul>
          </section>

          <section className="rounded-xl bg-secondary/40 px-3.5 py-3 text-muted-foreground">
            <p className="font-medium text-foreground">Astuce</p>
            <p className="mt-1">
              Plus tes notes et listes sont précises, meilleures sont les questions. <br /> Un deck Anki
              ou une liste JetPunk ciblée donne souvent un meilleur quiz que de sélectionner « Toutes les ressources ».
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

interface PlateauHelpButtonProps {
  onClick: () => void;
}

export function PlateauHelpButton({ onClick }: PlateauHelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
    >
      <CircleHelp className="h-4 w-4" aria-hidden />
      Comment ça marche ?
    </button>
  );
}

export function PlateauHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PlateauHelpButton onClick={() => setOpen(true)} />
      <PlateauHelpDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
