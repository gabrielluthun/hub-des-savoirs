import type { AppState, GeminiModel } from '@/types';
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from '@/types';

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

export function migrateState(state: AppState): AppState {
  return {
    ...state,
    settings: {
      ...state.settings,
      model: migrateGeminiModel(state.settings.model),
    },
  };
}
