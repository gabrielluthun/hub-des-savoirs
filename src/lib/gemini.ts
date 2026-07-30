import { buildQuizPrompt } from '@/features/plateau/lib/build-quiz-prompt';
import { normalizeGeneratedQuestions } from '@/features/plateau/lib/normalize-questions';
import { ALL_QUESTION_TYPES } from '@/features/plateau/lib/question-types';
import type { GeminiModel, GeneratedQuestion, QuestionType } from '@/types';

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
    candidates?: { content?: { parts?: { text?: string }[] }[] }[];
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
  questionTypes?: QuestionType[];
}): Promise<GeneratedQuestion[]> {
  const questionTypes =
    params.questionTypes && params.questionTypes.length > 0
      ? params.questionTypes
      : ALL_QUESTION_TYPES;

  const prompt = buildQuizPrompt({
    context: params.context,
    count: params.count,
    difficulty: params.difficulty,
    questionTypes,
  });

  const result = await generateJson<{ questions: unknown[] }>({
    apiKey: params.apiKey,
    model: params.model,
    prompt,
  });

  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('Aucune question générée.');
  }

  const questions = normalizeGeneratedQuestions(
    result.questions,
    questionTypes,
    params.count
  );
  if (questions.length === 0) {
    throw new Error('Aucune question exploitable générée.');
  }

  return questions;
}
