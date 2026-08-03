import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface PlateauHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const P = 'text-muted-foreground';

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

        <div className="space-y-10 overflow-y-auto px-5 py-6 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">À quoi sert le Plateau</h2>
            <p className={P}>
              Le Plateau génère un <span className="text-foreground">quiz IA</span> à partir de
              tes notes Google Docs, de tes cartes Anki ou de tes listes JetPunk.
            </p>
            <p className={P}>
              Tu révises ainsi le contenu que tu as déjà saisi dans le Hub, sous forme de
              questions variées.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Avant de lancer</h2>
            <p className={P}>
              Une <span className="text-foreground">clé API Gemini</span> est indispensable.
            </p>
            <p className={P}>
              Renseigne-la dans Paramètres, puis vérifie que le modèle répond bien.
            </p>
            <p className={P}>
              Choisis ensuite le <span className="text-foreground">nombre</span> de questions et
              la <span className="text-foreground">difficulté</span>.
            </p>
            <p className={P}>
              Tu peux cibler <span className="text-foreground">toutes les ressources</span> du
              Hub, ou seulement certains documents, decks Anki ou listes JetPunk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Types de questions</h2>
            <p className={P}>
              Coche les <span className="text-foreground">types de questions</span> que tu veux
              voir apparaître.
            </p>
            <p className={P}>
              QCM, réponse libre, vrai / faux ou listes, selon ce qui te convient.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Pendant et après la partie</h2>
            <p className={P}>Réponds question par question.</p>
            <p className={P}>
              Le score se met à jour au fur et à mesure, pour que tu suives ta progression en
              direct.
            </p>
            <p className={P}>
              En fin de partie, tu obtiens un bilan et tu peux{' '}
              <span className="text-foreground">rejouer</span>, ou ouvrir la source d’une
              question.
            </p>
            <p className={P}>
              L’historique en bas mémorise tes scores et limite les répétitions d’une session à
              l’autre.
            </p>
          </section>

          <section className="space-y-4 rounded-xl bg-secondary/40 px-4 py-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Astuce</h2>
            <p className={P}>
              Plus tes notes et listes sont précises, meilleures sont les questions.
            </p>
            <p className={P}>
              Un deck Anki ou une liste JetPunk ciblée donne souvent un meilleur quiz que
              « Toutes les ressources ».
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
