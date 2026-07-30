import type { GeneratedQuestion, QuestionType } from '@/types';
import { ALL_QUESTION_TYPES } from '@/features/plateau/lib/question-types';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
}

function coerceType(raw: unknown, allowed: QuestionType[]): QuestionType {
  const value = String(raw ?? '').trim() as QuestionType;
  if (allowed.includes(value)) return value;
  return allowed[0] ?? 'qcm';
}

/** Strip meta phrases like « Selon le contexte… » from model text. */
export function stripContextMetaPhrases(value: string): string {
  return value
    .replace(
      /^\s*(selon|d['’]après)\s+(le\s+)?(contexte|document|texte|notes?|cartes?|ressources?)\s*[,:–—-]?\s*/giu,
      ''
    )
    .replace(
      /^\s*(dans|d['’]après)\s+(tes|vos|les)\s+(notes?|cartes?|documents?|ressources?)\s*[,:–—-]?\s*/giu,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** List questions are free recall — remove wording that implies visible choices. */
export function stripFakeChoicePhrases(value: string): string {
  return value
    .replace(
      /\s*[,:]?\s*parmi\s+(les\s+suivants?|ceux-ci|celles-ci|les\s+propositions?\s+suivantes?)\s*:?\s*/giu,
      ' '
    )
    .replace(/\s*[,:]?\s*coche[rz]?\s+(les\s+)?(bonnes\s+)?réponses?\s*:?\s*/giu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([?!.])/g, '$1')
    .trim();
}

/** Normalize / repair model output into playable questions. */
export function normalizeGeneratedQuestions(
  raw: unknown[],
  allowedTypes: QuestionType[],
  count: number
): GeneratedQuestion[] {
  const allowed = allowedTypes.length > 0 ? allowedTypes : ALL_QUESTION_TYPES;
  const questions: GeneratedQuestion[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const question = stripContextMetaPhrases(String(row.question ?? ''));
    if (!question) continue;

    const type = coerceType(row.type, allowed);
    let options = asStringArray(row.options).map(stripContextMetaPhrases);
    let answer = String(row.answer ?? '').trim();
    let answers = asStringArray(row.answers);
    const explanation = stripContextMetaPhrases(String(row.explanation ?? ''));

    if (type === 'vrai_faux') {
      options = ['Vrai', 'Faux'];
      const normalized = answer.toLowerCase();
      answer =
        normalized === 'vrai' || normalized === 'true' || normalized === 'oui'
          ? 'Vrai'
          : 'Faux';
    }

    if (type === 'qcm') {
      if (options.length < 2) continue;
      if (!answer || !options.includes(answer)) {
        answer = options[0]!;
      }
    }

    if (type === 'libre') {
      options = [];
      if (!answer) continue;
    }

    let questionText = question;
    if (type === 'liste') {
      options = [];
      questionText = stripFakeChoicePhrases(question);
      if (!questionText) continue;
      if (answers.length === 0 && answer) answers = [answer];
      answers = [...new Set(answers)].slice(0, 6);
      if (answers.length < 2) continue;
      answer = answers[0]!;
    }

    questions.push({
      type,
      question: questionText,
      options: options.length > 0 ? options : undefined,
      answer,
      answers: type === 'liste' ? answers : undefined,
      explanation,
    });

    if (questions.length >= count) break;
  }

  return questions;
}
