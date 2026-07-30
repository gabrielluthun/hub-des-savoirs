import { CircleHelp, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface AnkiHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const FIELD_GUIDE = [
  {
    name: 'Question',
    required: true,
    description: 'Ce que tu te poses avant de retourner la carte.',
  },
  {
    name: 'Réponse',
    required: true,
    description: 'Ce que tu dois retrouver.',
  },
  {
    name: 'Deck',
    required: true,
    description: 'Le paquet où ranger la carte (ex. Histoire, ou Histoire::Louis XIV pour un sous-deck).',
  },
  {
    name: 'Mnémotechnique',
    required: false,
    description: 'Une astuce pour t’en souvenir — tu peux laisser vide.',
  },
  {
    name: 'Tags',
    required: false,
    description: 'Des libellés pour filtrer plus tard, séparés par des virgules.',
  },
] as const;

const EXAMPLES = [
  {
    title: 'Le plus simple',
    why: 'Trois infos suffisent : question, réponse, deck.',
    line: 'Capitale du Japon;Tokyo;Nom du deck',
    parts: [
      { label: 'Question', value: 'Capitale du Japon' },
      { label: 'Réponse', value: 'Tokyo' },
      { label: 'Deck', value: 'Nom du deck' },
    ],
  },
  {
    title: 'Avec un vrai paquet',
    why: 'Change le nom du deck pour organiser tes révisions.',
    line: 'Roi dit le Saint;Louis IX;Histoire',
    parts: [
      { label: 'Question', value: 'Roi dit le Saint' },
      { label: 'Réponse', value: 'Louis IX' },
      { label: 'Deck', value: 'Histoire' },
    ],
  },
  {
    title: 'Créer un sous-deck',
    why: 'Utilise Parent::Enfant. Filtrer le parent inclut aussi les sous-decks.',
    line: 'Roi dit le Saint;Louis IX;Histoire::Capétiens',
    parts: [
      { label: 'Question', value: 'Roi dit le Saint' },
      { label: 'Réponse', value: 'Louis IX' },
      { label: 'Deck', value: 'Histoire::Capétiens' },
    ],
  },
  {
    title: 'Carte complète',
    why: 'Astuce + tags pour te souvenir et retrouver la carte facilement.',
    line: 'Capitale du Japon;Tokyo;Géo;Kyoto inversé (ancienne capitale);asie,capitales',
    parts: [
      { label: 'Question', value: 'Capitale du Japon' },
      { label: 'Réponse', value: 'Tokyo' },
      { label: 'Deck', value: 'Géo' },
      { label: 'Mnémotechnique', value: 'Kyoto inversé (ancienne capitale)' },
      { label: 'Tags', value: 'asie, capitales' },
    ],
  },
  {
    title: 'Tags sans mnémotechnique',
    why: 'Laisse le 4ᵉ champ vide (deux points-virgules d’affilée), puis ajoute les tags.',
    line: 'Capitale du Japon;Tokyo;Nom du deck;;asie,capitales',
    parts: [
      { label: 'Question', value: 'Capitale du Japon' },
      { label: 'Réponse', value: 'Tokyo' },
      { label: 'Deck', value: 'Nom du deck' },
      { label: 'Mnémotechnique', value: '(vide)' },
      { label: 'Tags', value: 'asie, capitales' },
    ],
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
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Premiers pas
            </p>
            <h2 id="anki-help-title" className="font-display text-xl font-semibold">
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
              Ici tu crées des <span className="text-foreground">cartes de révision</span> : une
              question d’un côté, la réponse de l’autre. Tu peux les saisir une par une, ou les
              importer / exporter en fichier <span className="text-foreground">.txt</span> pour
              gagner du temps.
            </p>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="font-medium">Une ligne = une carte</h3>
              <p className="mt-1 text-muted-foreground">
                Chaque ligne du fichier (ou du collage à droite) décrit une carte. Les champs sont
                séparés par un <span className="text-foreground">point-virgule</span> :
              </p>
            </div>
            <p className="rounded-xl bg-secondary/60 px-3 py-2.5 font-mono text-xs leading-relaxed">
              Question;Réponse;Nom du deck;Mnémotechnique;Tags
            </p>
            <div className="space-y-2.5">
              {FIELD_GUIDE.map((field) => (
                <div key={field.name} className="flex gap-3">
                  <div className="w-[7.5rem] shrink-0">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.required ? 'Obligatoire' : 'Optionnel'}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{field.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="font-medium">Exemples concrets</h3>
              <p className="mt-1 text-muted-foreground">
                Copie-colle ces lignes telles quelles pour tester l’import.
              </p>
            </div>
            <div className="space-y-3">
              {EXAMPLES.map((example) => (
                <div key={example.line} className="rounded-xl border border-border px-3.5 py-3">
                  <p className="font-medium">{example.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{example.why}</p>
                  <p className="mt-2 break-all rounded-lg bg-secondary/50 px-2.5 py-2 font-mono text-xs leading-relaxed">
                    {example.line}
                  </p>
                  <dl className="mt-2.5 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    {example.parts.map((part) => (
                      <div key={`${example.line}-${part.label}`}>
                        <dt className="inline font-medium text-foreground">{part.label} : </dt>
                        <dd className="inline">{part.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Dans l’interface</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Nouvelle carte</span> sert à saisir une carte à
                la main.
              </li>
              <li>
                <span className="text-foreground">Importer .txt</span> et{' '}
                <span className="text-foreground">Coller en masse</span> permettent l'ajout de plusieurs cartes à la fois.
              </li>
              <li>
                <span className="text-foreground">Exporter .txt</span> exporte les cartes affichées à l'écran.
              </li>
              <li>
                <span className="text-foreground">Réviser</span> lance une session sur les cartes à
                revoir aujourd’hui, toujours selon ta sélection actuelle.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Vers JetPunk</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Le bouton <span className="text-foreground">Vers JetPunk</span> transforme les
                cartes affichées en une liste de quiz (question → indice, réponse → réponse).
              </li>
              <li>
                Un deck <span className="text-foreground">Thème::Liste</span> devient la
                catégorie et le titre de la liste (ex. Géographie::Capitales).
              </li>
              <li>C’est une copie : tes cartes Anki restent en place.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-secondary/40 px-3.5 py-3 text-muted-foreground">
            <p className="font-medium text-foreground">Astuce</p>
            <p className="mt-1">
              Si tu réimportes une carte dont la question existe déjà (même en changeant majuscules,
              accents ou ponctuation), elle est ignorée pour éviter les doublons.
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
