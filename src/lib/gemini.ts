import type { GeminiModel } from '@/types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiGenerateParams {
  apiKey: string;
  model: GeminiModel;
  prompt: string;
  temperature?: number;
}

export async function generateJson<T>(params: GeminiGenerateParams): Promise<T> {
  const { apiKey, model, prompt, temperature = 0.7 } = params;
  if (!apiKey.trim()) {
    throw new Error('Clé API Gemini manquante. Configurez-la dans Paramètres.');
  }

  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Gemini (${response.status}) : ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Réponse Gemini vide.');
  }

  return JSON.parse(text) as T;
}

/** Lightweight check: GET model metadata with the provided key. */
export async function verifyGeminiApiKey(params: {
  apiKey: string;
  model: GeminiModel;
}): Promise<void> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    throw new Error('Clé API Gemini manquante.');
  }

  const url = `${GEMINI_BASE}/models/${params.model}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);

  if (response.ok) return;

  const errorText = await response.text();
  if (response.status === 400 || response.status === 403 || response.status === 401) {
    throw new Error('Clé API refusée ou modèle inaccessible.');
  }
  throw new Error(`Erreur Gemini (${response.status}) : ${errorText.slice(0, 160)}`);
}
