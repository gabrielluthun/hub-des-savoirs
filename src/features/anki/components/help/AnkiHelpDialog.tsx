import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface AnkiHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  {
    line: 'Capitale du Japon;Tokyo;Défaut',
    label: 'Minimum (Q / R / Deck)',
  },
  {
    line: 'Roi dit le Saint;Louis IX;Histoire',
    label: 'Avec un deck nommé',
  },
  {
    line: 'Capitale du Japon;Tokyo;Géo;To-kyo comme ticket;asie,capitales',
    label: 'Complet (mnémotechnique + tags)',
  },
  {
    line: 'Capitale du Japon;Tokyo;Défaut;;asie,capitales',
    label: 'Tags sans mnémotechnique (champ vide)',
  },
] as const;

export function AnkiHelpDialog({ open, onClose }: AnkiHelpDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anki-help-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Documentation
            </p>
            <h2 id="anki-help-title" className="font-display text-xl font-semibold">
              Comment ça marche ?
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-medium">Format .txt</h3>
            <p className="rounded-xl bg-secondary/60 px-3 py-2 font-mono text-xs leading-relaxed">
              Question;Réponse;Deck;Mnémotechnique;Tags
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Question</span>,{' '}
                <span className="text-foreground">Réponse</span> et{' '}
                <span className="text-foreground">Deck</span> sont obligatoires.
              </li>
              <li>
                <span className="text-foreground">Mnémotechnique</span> et{' '}
                <span className="text-foreground">Tags</span> sont optionnels.
              </li>
              <li>Les tags se séparent par des virgules (ex. asie,capitales).</li>
              <li>Une carte par ligne.</li>
              <li>Les doublons (question normalisée : casse, accents, ponctuation) sont ignorés à
                l’import.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Exemples</h3>
            <div className="space-y-3">
              {EXAMPLES.map((example) => (
                <div key={example.line} className="rounded-xl border border-border px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {example.label}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs leading-relaxed">{example.line}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2 text-muted-foreground">
            <h3 className="font-medium text-foreground">Où l’utiliser ?</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <span className="text-foreground">Importer .txt</span> / coller en masse à droite
              </li>
              <li>
                <span className="text-foreground">Exporter .txt</span> pour le filtre courant (deck /
                tags)
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-border px-5 py-3">
          <Button type="button" className="w-full" onClick={onClose}>
            Compris
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AnkiHelpButtonProps {
  onClick: () => void;
}

export function AnkiHelpButton({ onClick }: AnkiHelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <CircleHelp className="h-4 w-4" aria-hidden />
      Comment ça marche ?
    </button>
  );
}
