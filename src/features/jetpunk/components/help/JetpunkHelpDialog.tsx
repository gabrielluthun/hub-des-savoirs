import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface JetpunkHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const P = 'text-muted-foreground';

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

        <div className="space-y-10 overflow-y-auto px-5 py-6 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">À quoi sert JetPunk</h2>
            <p className={P}>
              JetPunk, c’est un quiz de{' '}
              <span className="text-foreground">listes à retrouver</span> : tu tapes les réponses
              le plus vite possible.
            </p>
            <p className={P}>
              Seule la <span className="text-foreground">réponse</span> compte.
            </p>
            <p className={P}>
              L’indice est là pour t’aider à te souvenir de ce qu’il faut saisir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Créer une liste</h2>
            <p className={P}>
              Le <span className="text-foreground">+</span> dans la barre latérale du module crée
              une nouvelle liste.
            </p>
            <p className={P}>
              Donne-lui un <span className="text-foreground">nom</span> et une{' '}
              <span className="text-foreground">catégorie</span> (par exemple Géographie).
            </p>
            <p className={P}>
              Ajoute ensuite des paires{' '}
              <span className="text-foreground">indice → réponse</span>, comme « Capitale du Japon
              → Tokyo ».
            </p>
            <p className={P}>
              Sans au moins une réponse remplie, le quiz ne pourra pas démarrer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Lancer un quiz</h2>
            <p className={P}>
              En mode <span className="text-foreground">chronométré</span> (icône timer), choisis
              une durée puis clique sur <span className="text-foreground">Démarrer</span>.
            </p>
            <p className={P}>La partie s’arrête quand le temps est écoulé.</p>
            <p className={P}>
              En mode <span className="text-foreground">sans chrono</span> (∞), tu joues sans
              limite de temps.
            </p>
            <p className={P}>Quitter l’onglet termine la partie en cours.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Saisie des réponses</h2>
            <p className={P}>
              Tape les réponses au clavier : elles sont acceptées dès qu’elles correspondent,
              sans tenir compte des majuscules ni des accents.
            </p>
            <p className={P}>
              Pour un nom de personne, le nom de famille seul suffit en général (Hugo, ou de
              Gaulle).
            </p>
            <p className={P}>
              Ce n’est pas le cas pour les rois et reines : il faut le titre ou le numéro (Louis
              XIV…).
            </p>
            <p className={P}>
              Si plusieurs réponses partagent le même nom de famille, elles sont toutes validées
              d’un coup.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Focus et statistiques</h2>
            <p className={P}>
              Après quelques parties, <span className="text-foreground">Focus</span> peut
              relancer uniquement les éléments que tu manques souvent.
            </p>
            <p className={P}>
              C’est un mode d’entraînement ciblé, plus efficace qu’une reprise complète de la
              liste.
            </p>
            <p className={P}>
              L’historique et les stats de manques apparaissent sous la liste une fois que tu as
              joué.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Import et export</h2>
            <p className={P}>
              <span className="text-foreground">Importer une liste</span> charge un fichier{' '}
              <code className="text-foreground">.json</code> au format export du Hub.
            </p>
            <p className={P}>
              <span className="text-foreground">Tout exporter</span> ou{' '}
              <span className="text-foreground">Exporter cette liste</span> sauvegarde tes listes
              en JSON.
            </p>
            <p className={P}>
              Tu pourras les réimporter plus tard ou les partager avec une autre installation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Vers Anki</h2>
            <p className={P}>
              Le bouton <span className="text-foreground">Vers Anki</span> copie la liste active
              en cartes de révision.
            </p>
            <p className={P}>L’indice devient la question, la réponse reste la réponse.</p>
            <p className={P}>
              La catégorie et le nom de la liste forment le deck Anki{' '}
              <span className="text-foreground">Catégorie::Liste</span> (ex.
              Géographie::Capitales).
            </p>
            <p className={P}>
              C’est une copie : ta liste JetPunk reste en place, et les questions déjà présentes
              dans Anki sont ignorées.
            </p>
          </section>

          <section className="space-y-4 rounded-xl bg-secondary/40 px-4 py-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Astuce</h2>
            <p className={P}>Une liste sans aucune réponse jouable ne peut pas démarrer.</p>
            <p className={P}>
              Remplis au moins un champ « Réponse » avant de lancer le quiz.
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
