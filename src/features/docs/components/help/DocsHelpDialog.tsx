import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface DocsHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const P = 'text-muted-foreground';

export function DocsHelpDialog({ open, onClose }: DocsHelpDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-help-title"
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
            <h2 id="docs-help-title" className="font-display text-xl font-semibold">
              Comment ça marche ?
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-10 overflow-y-auto px-5 py-6 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">À quoi sert cet onglet ?</h2>
            <p className={P}>
              Ici tu ranges tes <span className="text-foreground">notes</span> : du texte local en
              Markdown, ou du contenu importé depuis un{' '}
              <span className="text-foreground">Google Doc</span>.
            </p>
            <p className={P}>
              Ces notes deviennent ensuite des sources pour Plateau (quiz IA) et pour la
              génération de cartes Anki depuis un document.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Créer un document</h2>
            <p className={P}>
              Le bouton <span className="text-foreground">+</span> dans la barre latérale du module
              crée une note vide.
            </p>
            <p className={P}>
              Donne-lui ensuite un <span className="text-foreground">titre</span> (éditable en
              haut) et des <span className="text-foreground">tags</span> pour la retrouver plus
              facilement.
            </p>
            <p className={P}>
              Pour supprimer un document, survole-le dans la liste puis utilise la corbeille.
            </p>
            <p className={P}>
              Une confirmation te sera demandée avant la suppression définitive.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Google Docs</h2>
            <p className={P}>
              Colle l’URL du document dans le champ prévu, puis clique sur{' '}
              <span className="text-foreground">Vers Éditeur</span>.
            </p>
            <p className={P}>
              Le Doc Google est converti en Markdown et remplit l’onglet Éditeur.
            </p>
            <p className={P}>
              <span className="text-foreground">Actualiser local</span> remplace ta version locale
              par la version en ligne.
            </p>
            <p className={P}>
              Si tu as modifié le contenu localement, une confirmation te prévient avant
              d’écraser tes changements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Éditeur et plan</h2>
            <p className={P}>
              L’onglet <span className="text-foreground">Éditeur</span> sert à écrire en Markdown.
            </p>
            <p className={P}>Tout est sauvegardé automatiquement sur cet appareil.</p>
            <p className={P}>
              L’onglet <span className="text-foreground">Aperçu</span> montre le rendu HTML de ton
              Markdown.
            </p>
            <p className={P}>
              À droite, le <span className="text-foreground">Plan</span> liste les titres (#,
              ##…). Cliquez un titre pour aller directement à cette section.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Doc lié et import fichier</h2>
            <p className={P}>
              Quand l’URL est valide, l’onglet <span className="text-foreground">Doc lié</span>{' '}
              affiche un aperçu intégré du document original.
            </p>
            <p className={P}>
              Tu peux aussi charger un fichier depuis ton disque avec{' '}
              <span className="text-foreground">Importer depuis l’ordinateur</span>.
            </p>
          </section>

          <section className="space-y-4 rounded-xl bg-secondary/40 px-4 py-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Astuce</h2>
            <p className={P}>
              « Générer un quiz IA » t’envoie vers Plateau avec tes notes comme source.
            </p>
            <p className={P}>
              Pour créer des cartes Anki à partir d’un document, utilise plutôt « Générer par IA »
              dans l’onglet Anki.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

interface DocsHelpButtonProps {
  onClick: () => void;
}

export function DocsHelpButton({ onClick }: DocsHelpButtonProps) {
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

export function DocsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DocsHelpButton onClick={() => setOpen(true)} />
      <DocsHelpDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
