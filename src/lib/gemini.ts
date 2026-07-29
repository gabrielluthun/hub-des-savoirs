import type { GeminiModel, GeneratedQuestion } from '@/types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiGenerateParams {
  apiKey: string;
  model: GeminiModel;
  prompt: string;
}

export async function generateJson<T>(params: GeminiGenerateParams): Promise<T> {
  const { apiKey, model, prompt } = params;
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
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Gemini (${response.status}) : ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Réponse Gemini vide.');
  }

  return JSON.parse(text) as T;
}

export async function generateQuizQuestions(params: {
  apiKey: string;
  model: GeminiModel;
  context: string;
  count: number;
  difficulty: string;
}): Promise<GeneratedQuestion[]> {
  const prompt = `Tu es le Maître du Quiz TV. À partir UNIQUEMENT du contexte fourni, génère ${params.count} questions de culture générale en français, difficulté « ${params.difficulty} ».

Contexte :
"""
${params.context.slice(0, 12000)}
"""

Réponds en JSON strict avec cette forme :
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "une des options exactement",
      "explanation": "courte explication basée sur le contexte"
    }
  ]
}

Règles :
- options : exactement 4 choix
- answer doit être égal à l'une des options
- ne invente pas de faits absents du contexte si possible
- questions variées`;

  const result = await generateJson<{ questions: GeneratedQuestion[] }>({
    apiKey: params.apiKey,
    model: params.model,
    prompt,
  });

  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('Aucune question générée.');
  }

  return result.questions.slice(0, params.count);
}
