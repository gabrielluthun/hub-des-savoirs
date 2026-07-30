import { useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface DocsHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

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

        <div className="space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
          <section className="space-y-2">
            <p className="text-muted-foreground">
              Ici tu ranges tes <span className="text-foreground">notes</span> : texte local en
              Markdown, ou contenu importé depuis un{' '}
              <span className="text-foreground">Google Doc</span>. Ces notes servent de source
              pour Plateau et la génération Anki.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Créer un document</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Le <span className="text-foreground">+</span> dans la barre latérale crée une
                note vide.
              </li>
              <li>
                Donne-lui un <span className="text-foreground">titre</span> (éditable en haut) et
                des <span className="text-foreground">tags</span> pour filtrer.
              </li>
              <li>
                La corbeille dans la liste (au survol){' '}
                <span className="text-foreground">supprime</span> le document : confirmation
                demandée.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Google Docs</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Colle l’URL du document, puis{' '}
                <span className="text-foreground">Importer contenu</span>.
              </li>
              <li>
                <span className="text-foreground">Rafraîchir</span> reprend la version en ligne
                (avec confirmation si tu as modifié localement).
              </li>
              <li>
                L’onglet <span className="text-foreground">Google Docs</span> affiche l’aperçu
                intégré quand l’URL est valide.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Éditeur & plan</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Éditeur</span> : Markdown local, sauvegardé
                automatiquement sur cet appareil.
              </li>
              <li>
                <span className="text-foreground">Aperçu</span> : rendu HTML du Markdown.
              </li>
              <li>
                Le <span className="text-foreground">Plan</span> à droite liste les titres (#,
                ##…) pour naviguer vite.
              </li>
              <li>
                <span className="text-foreground">Importer .md</span> charge un fichier Markdown
                depuis ton disque.
              </li>
            </ul>
          </section>

          <section className="rounded-xl bg-secondary/40 px-3.5 py-3 text-muted-foreground">
            <p className="font-medium text-foreground">Astuce</p>
            <p className="mt-1">
              « Générer un quiz IA » t’envoie vers Plateau avec tes notes comme source. Pour des
              cartes Anki, utilise plutôt « IA depuis Docs » dans l’onglet Anki.
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
