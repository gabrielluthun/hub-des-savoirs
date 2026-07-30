import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface JetpunkHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function JetpunkHelpDialog({ open, onClose }: JetpunkHelpDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jetpunk-help-title"
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
            <h2 id="jetpunk-help-title" className="font-display text-xl font-semibold">
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
              JetPunk, c’est un quiz de{' '}
              <span className="text-foreground">listes à retrouver</span> : tu tapes les
              réponses le plus vite possible. Seule la{' '}
              <span className="text-foreground">réponse</span> compte ; l’indice est juste
              là pour t’aider à te souvenir.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Créer une liste</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">+</span> dans la barre latérale crée une
                nouvelle liste.
              </li>
              <li>
                Donne-lui un <span className="text-foreground">nom</span> et une{' '}
                <span className="text-foreground">catégorie</span> (ex. Géographie).
              </li>
              <li>
                Ajoute des paires <span className="text-foreground">indice → réponse</span>{' '}
                (ex. Capitale du Japon → Tokyo).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Lancer un quiz</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Mode <span className="text-foreground">chronométré</span> (icône timer) :
                choisis une durée, puis{' '}
                <span className="text-foreground">Démarrer</span>.
              </li>
              <li>
                Mode <span className="text-foreground">sans chrono</span> (∞) : tu joues sans
                limite de temps. Quitter l’onglet termine la partie.
              </li>
              <li>
                Tape les réponses ; elles sont acceptées dès qu’elles correspondent (sans
                tenir compte des majuscules / accents). Pour un nom de personne, le nom de
                famille seul suffit (Hugo, ou de Gaulle), mais pas pour les rois / reines (titres
                ou numéros : Louis XIV…). Si plusieurs réponses partagent le même nom de
                famille, toutes sont validées d’un coup.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Focus & stats</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Focus</span> relance uniquement les
                éléments souvent manqués (disponible après quelques parties).
              </li>
              <li>
                L’historique et les stats de manques apparaissent sous la liste une fois que
                tu as joué.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Import / export</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Importer une liste</span> : choisis un
                fichier <code className="text-foreground">.json</code> au format export Hub.
              </li>
              <li>
                <span className="text-foreground">Tout exporter</span> /{' '}
                <span className="text-foreground">Exporter cette liste</span> : sauvegarde en
                JSON pour réimport plus tard.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Vers Anki</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Le bouton <span className="text-foreground">Vers Anki</span> copie la liste
                active en cartes de révision (indice → question, réponse → réponse).
              </li>
              <li>
                La catégorie et le nom de la liste deviennent le deck Anki{' '}
                <span className="text-foreground">Catégorie::Liste</span> (ex.
                Géographie::Capitales).
              </li>
              <li>C’est une copie : ta liste JetPunk reste en place.</li>
              <li>
                Les questions déjà présentes dans Anki sont ignorées
                pour éviter les doublons.
              </li>
            </ul>
          </section>

          <section className="rounded-xl bg-secondary/40 px-3.5 py-3 text-muted-foreground">
            <p className="font-medium text-foreground">Astuce</p>
            <p className="mt-1">
              Une liste sans aucune réponse jouable ne peut pas démarrer : remplis au moins
              un champ « Réponse » avant de lancer le quiz.
            </p>
          </section>
        </div>

        <div className="border-t border-border px-5 py-3">
          <Button type="button" className="w-full" onClick={onClose}>
            C’est clair
          </Button>
        </div>
      </div>
    </div>
  );
}

interface JetpunkHelpButtonProps {
  onClick: () => void;
}

export function JetpunkHelpButton({ onClick }: JetpunkHelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
    >
      <CircleHelp className="h-4 w-4" aria-hidden />
      Comment ça marche ?
    </button>
  );
}

/** Floating help control — only mount inside JetPunk view. */
export function JetpunkHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed bottom-4 right-4 z-40">
        <div className="pointer-events-auto">
          <JetpunkHelpButton onClick={() => setOpen(true)} />
        </div>
      </div>
      <JetpunkHelpDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
