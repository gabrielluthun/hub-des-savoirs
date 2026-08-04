export interface ReleaseChange {
  keyword: string;
  description: string;
}

export interface ReleaseHistoryEntry {
  version: string;
  changes: ReleaseChange[];
}

/**
 * User-facing changelog mirrored from
 * https://github.com/gabrielluthun/hub-des-savoirs/releases
 * (newest first).
 */
export const RELEASE_HISTORY: ReleaseHistoryEntry[] = [
  {
    version: 'v1.3.1',
    changes: [
      {
        keyword: 'Anki',
        description:
          'génération IA améliorée, ajout du libellé « Titre », et liste masquée pendant la génération',
      },
      {
        keyword: 'JetPunk',
        description: 'ajout du libellé Titre',
      },
    ],
  },
  {
    version: 'v1.3.0',
    changes: [
      {
        keyword: 'Sidebar',
        description: 'menu latéral pliable en rail d’icônes',
      },
      {
        keyword: 'Sauvegarde',
        description: 'choix de l’emplacement à l’export',
      },
      {
        keyword: 'Plateau',
        description: 'matching plus souple, réponses ancrées au document, bouton Passer',
      },
      {
        keyword: 'Thème',
        description: 'animation à la bascule clair / sombre',
      },
      {
        keyword: 'Paramètres',
        description: 'ajout d\'un historique des mises à jour',
      },
      {
        keyword: 'Docs',
        description: 'libellés et textes d’aide clarifiés',
      },
    ],
  },
  {
    version: 'v1.2.0',
    changes: [
      {
        keyword: 'Updater',
        description: 'nouvelle feature : vérifie, télécharge et installe les mises à jour depuis l’app',
      },
      {
        keyword: 'Paramètres',
        description: 'bouton « Vérifier les mises à jour » (desktop)',
      },
    ],
  },
  {
    version: 'v1.1.1',
    changes: [
      {
        keyword: 'Paramètres',
        description: 'textes allégés',
      },
      {
        keyword: 'Plateau',
        description: 'aide clarifiée sur le choix des ressources',
      },
    ],
  },
  {
    version: 'v1.1.0',
    changes: [
      {
        keyword: 'Google Docs',
        description: 'import et rafraîchissement du contenu de nouveau opérationnels',
      },
    ],
  },
  {
    version: 'v1.0.0',
    changes: [
      {
        keyword: 'Application',
        description: 'Première version publique',
      },
      {
        keyword: 'Docs',
        description: 'notes markdown locales et synchronisation Google Docs',
      },
      {
        keyword: 'Anki',
        description: 'decks, révision espacée, import/export et génération IA',
      },
      {
        keyword: 'JetPunk',
        description: 'listes catégorisées et quiz chronométrés',
      },
      {
        keyword: 'Plateau',
        description: 'quiz IA générés à partir de tes ressources Hub',
      },
      {
        keyword: 'Paramètres',
        description: 'thème clair/sombre, sons et sauvegarde JSON',
      },
    ],
  },
];
