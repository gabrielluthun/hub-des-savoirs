import type { AppState } from '@/types';
import { DEFAULT_GEMINI_MODEL } from '@/types';
import { createId } from '@/lib/utils';
import { migrateState } from '@/store/migration';

export const STORAGE_KEY = 'gk-hub-state-v1';

export function createDefaultState(): AppState {
  const docId = createId();
  const listId = createId();
  const now = new Date().toISOString();

  return {
    settings: {
      apiKey: '',
      model: DEFAULT_GEMINI_MODEL,
      theme: 'dark',
      quizypediaEnabled: false,
      soundEnabled: false,
      activeTab: 'docs',
    },
    docs: [
      {
        id: docId,
        title: 'Quizypédia',
        googleDocsUrl: '',
        content: '# Titre\n- Point 1\n- Point 2\n',
        updatedAt: now,
      },
      {
        id: createId(),
        title: 'Nouveau document',
        googleDocsUrl: '',
        content: '',
        updatedAt: now,
      },
    ],
    activeDocId: docId,
    ankiCards: [],
    jetpunkLists: [
      {
        id: listId,
        title: 'Capitales du monde',
        category: 'Géographie',
        durationSec: 90,
        items: [
          { id: createId(), prompt: 'France', answer: 'Paris' },
          { id: createId(), prompt: 'Allemagne', answer: 'Berlin' },
          { id: createId(), prompt: 'Espagne', answer: 'Madrid' },
          { id: createId(), prompt: 'Italie', answer: 'Rome' },
          { id: createId(), prompt: 'Japon', answer: 'Tokyo' },
          { id: createId(), prompt: 'Canada', answer: 'Ottawa' },
          { id: createId(), prompt: 'Brésil', answer: 'Brasilia' },
          { id: createId(), prompt: 'Australie', answer: 'Canberra' },
        ],
      },
      {
        id: createId(),
        title: 'Rois de France (sélection)',
        category: 'Histoire',
        durationSec: 90,
        items: [
          { id: createId(), prompt: 'Roi couronné en 987', answer: 'Hugues Capet' },
          { id: createId(), prompt: 'Roi dit le Saint', answer: 'Louis IX' },
          { id: createId(), prompt: 'Roi du château de Versailles', answer: 'Louis XIV' },
          { id: createId(), prompt: 'Dernier roi de France', answer: 'Louis-Philippe' },
        ],
      },
    ],
    activeJetpunkListId: listId,
    jetpunkHistory: [],
    gameHistory: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const defaults = createDefaultState();
    return migrateState({
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      jetpunkHistory: parsed.jetpunkHistory ?? [],
      gameHistory: parsed.gameHistory ?? [],
    });
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
