import { Button, Dialog } from '@/components/ui/primitives';

interface HubHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const P = 'text-muted-foreground';

export function HubHelpDialog({ open, onClose }: HubHelpDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      titleId="hub-help-title"
      eyebrow="Hub des Savoirs"
      title="Comment ça marche ?"
      bodyClassName="space-y-10 text-sm leading-relaxed"
      footer={
        <Button type="button" className="w-full" onClick={onClose}>
          C’est clair
        </Button>
      }
    >
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">En deux mots</h2>
        <p className={P}>
          Hub des Savoirs regroupe tes notes et tes quiz{' '}
          <span className="text-foreground">sur cet appareil</span>.
        </p>
        <p className={P}>
          Tes données restent locales : rien n’est envoyé ailleurs, sauf les appels à Gemini
          lorsque tu lances une génération IA.
        </p>
        <p className={P}>
          La barre latérale te permet de passer d’un module à l’autre.
        </p>
        <p className={P}>
          Sur ordinateur, tu peux la replier en rail d’icônes avec la flèche en haut de la
          barre.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Les modules</h2>

        <div className="space-y-4">
          <p className="font-medium">Google Docs</p>
          <p className={P}>
            C’est ton espace de notes : texte local en Markdown, ou contenu importé depuis un
            Google Doc.
          </p>
          <p className={P}>
            Ces notes alimentent ensuite Plateau et la génération de cartes Anki.
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-medium">Anki</p>
          <p className={P}>
            Tu y crées des cartes question / réponse avec révision espacée.
          </p>
          <p className={P}>
            Tu peux filtrer par deck, importer ou exporter un fichier .txt, et envoyer une
            sélection vers JetPunk.
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-medium">JetPunk</p>
          <p className={P}>
            Des listes à retrouver au clavier, en mode chronométré ou sans limite de temps.
          </p>
          <p className={P}>
            Idéal pour mémoriser des séries (capitales, dates, noms…).
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-medium">Plateau</p>
          <p className={P}>
            Un quiz généré par IA à partir de tes docs, cartes Anki ou listes JetPunk.
          </p>
          <p className={P}>
            Plusieurs formats sont possibles : QCM, réponse libre, vrai / faux, listes.
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-medium">Paramètres</p>
          <p className={P}>
            Clé API Gemini, modèle, thème, Quizypedia, sons du Plateau, et sauvegarde /
            restauration complète du Hub.
          </p>
          <p className={P}>
            Tu y trouves aussi la vérification des mises à jour et son historique.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Aujourd’hui</h2>
        <p className={P}>
          En bas de la barre latérale, le bloc « Aujourd’hui » propose une reprise rapide.
        </p>
        <p className={P}>
          Tu y vois les cartes Anki dues, un raccourci vers ta dernière liste JetPunk, et un
          lancement Plateau.
        </p>
        <p className={P}>
          Les lignes JetPunk et Plateau disparaissent dès que tu as joué une partie dans la
          journée.
        </p>
      </section>

      <section className="space-y-4 rounded-xl bg-secondary/40 px-4 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Astuce</h2>
        <p className={P}>
          Anki, JetPunk, Google Docs et Plateau ont chacun leur propre « Comment ça marche ? »
          dans l’onglet concerné.
        </p>
        <p className={P}>
          Ouvre-le pour le détail des formats d’import, des modes de jeu et des transferts
          entre modules.
        </p>
      </section>
    </Dialog>
  );
}
