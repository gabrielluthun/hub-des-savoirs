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
