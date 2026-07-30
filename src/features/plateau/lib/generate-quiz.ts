import { generateJson } from '@/lib/gemini';
import {
  filterRepeatedQuestions,
  shuffleCopy,
  shuffleQuestionOptions,
} from '@/features/plateau/lib/anti-repeat';
import { buildQuizPrompt } from '@/features/plateau/lib/build-quiz-prompt';
import { normalizeGeneratedQuestions } from '@/features/plateau/lib/normalize-questions';
import { ALL_QUESTION_TYPES } from '@/features/plateau/lib/question-types';
import type {
  GeminiModel,
  GeneratedQuestion,
  PlayedQuizFact,
  QuestionType,
} from '@/types';

export async function generateQuizQuestions(params: {
  apiKey: string;
  model: GeminiModel;
  context: string;
  count: number;
  difficulty: string;
  questionTypes?: QuestionType[];
  excludeFacts?: PlayedQuizFact[];
}): Promise<GeneratedQuestion[]> {
  const questionTypes =
    params.questionTypes && params.questionTypes.length > 0
      ? params.questionTypes
      : ALL_QUESTION_TYPES;
  const excludeFacts = params.excludeFacts ?? [];
  const requestCount = Math.min(params.count + 2, params.count * 2);

  const prompt = buildQuizPrompt({
    context: params.context,
    count: requestCount,
    difficulty: params.difficulty,
    questionTypes,
    excludeFacts,
  });

  const result = await generateJson<{ questions: unknown[] }>({
    apiKey: params.apiKey,
    model: params.model,
    prompt,
    temperature: 0.85,
  });

  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('Aucune question générée.');
  }

  const normalized = normalizeGeneratedQuestions(
    result.questions,
    questionTypes,
    requestCount
  );
  const fresh = filterRepeatedQuestions(normalized, excludeFacts);
  const pool = fresh.length > 0 ? fresh : normalized;
  const questions = shuffleCopy(pool)
    .map(shuffleQuestionOptions)
    .slice(0, params.count);

  if (questions.length === 0) {
    throw new Error('Aucune question exploitable générée.');
  }

  return questions;
}
