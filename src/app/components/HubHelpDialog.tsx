import { X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface HubHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const MODULES = [
  {
    name: 'Google Docs',
    description:
      'Notes Google Docs importées, et sous format Markdown. Elles servent de source pour Plateau et la génération Anki.',
  },
  {
    name: 'Anki',
    description:
      'Cartes question / réponse avec révision espacée. Filtre par deck, importe, exporte en .txt, transfé',
  },
  {
    name: 'JetPunk',
    description:
      'Quiz de listes à retrouver au clavier, avec chrono ou sans limite de temps.',
  },
  {
    name: 'Plateau',
    description:
      'Quiz généré par IA à partir de tes docs, cartes ou listes (QCM, libre, etc.).',
  },
  {
    name: 'Paramètres',
    description: 'Clé API Gemini, modèle, thème, et activation de Quizypedia.',
  },
] as const;

export function HubHelpDialog({ open, onClose }: HubHelpDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hub-help-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hub du Savoir
            </p>
            <h2 id="hub-help-title" className="font-display text-xl font-semibold">
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
              Hub du Savoir regroupe tes notes et tes quiz{' '}
              <span className="text-foreground">en local</span> : rien n’est envoyé ailleurs,
              sauf les appels Gemini quand tu lances une génération IA.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-medium">Les modules</h3>
            <div className="space-y-3">
              {MODULES.map((module) => (
                <div key={module.name} className="flex gap-3">
                  <p className="w-[7.5rem] shrink-0 font-medium">{module.name}</p>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Aujourd’hui</h3>
            <p className="text-muted-foreground">
              Le bloc en bas de la barre latérale te propose une reprise rapide : cartes Anki
              dues, dernière liste JetPunk, et un raccourci Plateau. Les lignes JetPunk et
              Plateau disparaissent dès que tu as joué une partie dans la journée.
            </p>
          </section>

          <section className="rounded-xl bg-secondary/40 px-3.5 py-3 text-muted-foreground">
            <p className="font-medium text-foreground">Astuce</p>
            <p className="mt-1">
              Anki et JetPunk ont chacun leur propre « Comment ça marche ? » pour le détail
              (formats d’import, modes de jeu, transferts entre modules).
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
