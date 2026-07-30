import type { AppState, GeminiModel, TabId } from '@/types';
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from '@/types';

const LEGACY_TAB_MAP: Record<string, TabId> = {
  jeutv: 'plateau',
};

const LEGACY_MODEL_MAP: Record<string, GeminiModel> = {
  'gemini-2.0-flash': 'gemini-3.5-flash',
  'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-2.5-flash': 'gemini-3.5-flash',
  'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-2.5-pro': 'gemini-3.1-pro',
  'gemini-1.5-flash': 'gemini-3.5-flash',
  'gemini-1.5-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-1.5-pro': 'gemini-3.1-pro',
  'gemini-1.0-pro': 'gemini-3.1-pro',
};

export function migrateGeminiModel(model: string): GeminiModel {
  if ((GEMINI_MODELS as string[]).includes(model)) {
    return model as GeminiModel;
  }
  if (LEGACY_MODEL_MAP[model]) {
    return LEGACY_MODEL_MAP[model];
  }
  if (model.includes('2.') || model.includes('1.')) {
    if (model.includes('lite')) return 'gemini-3.5-flash-lite';
    if (model.includes('pro')) return 'gemini-3.1-pro';
    return 'gemini-3.5-flash';
  }
  return DEFAULT_GEMINI_MODEL;
}

export function migrateActiveTab(tab: string): TabId {
  if (LEGACY_TAB_MAP[tab]) return LEGACY_TAB_MAP[tab];
  const valid: TabId[] = ['docs', 'anki', 'jetpunk', 'quizypedia', 'plateau', 'settings'];
  return (valid as string[]).includes(tab) ? (tab as TabId) : 'docs';
}

export function migrateState(state: AppState): AppState {
  return {
    ...state,
    jetpunkHistory: state.jetpunkHistory ?? [],
    docs: (state.docs ?? []).map((doc) => ({
      ...doc,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    })),
    settings: {
      ...state.settings,
      model: migrateGeminiModel(state.settings.model),
      activeTab: migrateActiveTab(state.settings.activeTab),
    },
  };
}
