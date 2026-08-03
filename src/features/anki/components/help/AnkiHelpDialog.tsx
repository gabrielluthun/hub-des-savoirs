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
    description:
      'Le paquet où ranger la carte (ex. Histoire, ou Histoire::Louis XIV pour un sous-deck).',
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

const P = 'text-muted-foreground';

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

        <div className="space-y-10 overflow-y-auto px-5 py-6 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">À quoi sert Anki</h2>
            <p className={P}>
              Ici tu crées des <span className="text-foreground">cartes de révision</span> : une
              question d’un côté, la réponse de l’autre.
            </p>
            <p className={P}>
              Tu peux les saisir une par une, ou les importer / exporter en fichier{' '}
              <span className="text-foreground">.txt</span> pour gagner du temps.
            </p>
            <p className={P}>
              La révision espacée te propose d’abord les cartes à revoir aujourd’hui, selon ton
              filtre actuel.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Une ligne = une carte</h2>
            <p className={P}>
              Chaque ligne du fichier (ou du collage à droite) décrit une carte.
            </p>
            <p className={P}>
              Les champs sont séparés par un{' '}
              <span className="text-foreground">point-virgule</span> :
            </p>

            <p className="rounded-xl bg-secondary/60 px-3.5 py-3 font-mono text-xs leading-relaxed">
              Question;Réponse;Nom du deck;Mnémotechnique;Tags
            </p>

            <div className="space-y-4">
              {FIELD_GUIDE.map((field) => (
                <div key={field.name} className="space-y-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.required ? 'Obligatoire' : 'Optionnel'}
                    </p>
                  </div>
                  <p className={P}>{field.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Exemples concrets</h2>
            <p className={P}>Copie-colle ces lignes telles quelles pour tester l’import.</p>
            <p className={P}>Chaque bloc détaille ce que signifie chaque champ.</p>

            <div className="space-y-4">
              {EXAMPLES.map((example) => (
                <div key={example.line} className="space-y-4 rounded-xl border border-border px-4 py-4">
                  <p className="font-medium">{example.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{example.why}</p>
                  <p className="break-all rounded-lg bg-secondary/50 px-3 py-2.5 font-mono text-xs leading-relaxed">
                    {example.line}
                  </p>
                  <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
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

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Dans l’interface</h2>
            <p className={P}>
              <span className="text-foreground">Nouvelle carte</span> sert à saisir une carte à
              la main.
            </p>
            <p className={P}>
              <span className="text-foreground">Importer .txt</span> et{' '}
              <span className="text-foreground">Coller en masse</span> permettent d’ajouter
              plusieurs cartes d’un coup.
            </p>
            <p className={P}>
              <span className="text-foreground">Exporter .txt</span> exporte les cartes
              actuellement affichées à l’écran (selon tes filtres).
            </p>
            <p className={P}>
              <span className="text-foreground">Réviser</span> lance une session sur les cartes à
              revoir aujourd’hui, dans le périmètre de ta sélection actuelle.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Vers JetPunk</h2>
            <p className={P}>
              Le bouton <span className="text-foreground">Vers JetPunk</span> transforme les
              cartes affichées en une liste de quiz.
            </p>
            <p className={P}>La question devient l’indice, la réponse reste la réponse.</p>
            <p className={P}>
              Un deck <span className="text-foreground">Thème::Liste</span> devient la catégorie
              et le titre de la liste (ex. Géographie::Capitales).
            </p>
            <p className={P}>C’est une copie : tes cartes Anki restent en place.</p>
          </section>

          <section className="space-y-4 rounded-xl bg-secondary/40 px-4 py-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Astuce</h2>
            <p className={P}>
              Si tu réimportes une carte dont la question existe déjà, elle est ignorée pour
              éviter les doublons.
            </p>
            <p className={P}>
              Cela reste vrai même si tu changes majuscules, accents ou ponctuation.
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
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
    >
      <CircleHelp className="h-4 w-4" aria-hidden />
      Comment ça marche ?
    </button>
  );
}
