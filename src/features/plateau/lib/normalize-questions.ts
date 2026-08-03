import type { GeneratedQuestion, QuestionType } from '@/types';
import {
  ALL_QUESTION_TYPES,
  answersMatchLoose,
  normalizeAnswer,
} from '@/features/plateau/lib/question-types';

const FRENCH_COUNTS: Record<number, string> = {
  2: 'deux',
  3: 'trois',
  4: 'quatre',
  5: 'cinq',
  6: 'six',
  7: 'sept',
  8: 'huit',
};

const FRENCH_COUNT_PATTERN = 'deux|trois|quatre|cinq|six|sept|huit';

/** Keep « Cite les N … » aligned with answers.length (digits + lettres). */
export function syncListCountInQuestion(question: string, count: number): string {
  const word = FRENCH_COUNTS[count] ?? String(count);
  const countToken = `${FRENCH_COUNT_PATTERN}|\\d+`;

  return question
    .replace(
      new RegExp(
        `\\b((?:cite(?:z)?|donne(?:z)?|nomme(?:z)?|indique(?:z)?)\\s+(?:les|des|ces)\\s+)(?:${countToken})\\b`,
        'giu'
      ),
      `$1${word}`
    )
    .replace(
      new RegExp(`\\b((?:les|des|ces)\\s+)(?:${countToken})(\\s+)`, 'giu'),
      `$1${word}$2`
    )
    .replace(
      new RegExp(
        `\\b(?:${countToken})(\\s+(?:auteurs?|éléments?|noms?|items?|pays|villes|œuvres?))\\b`,
        'giu'
      ),
      `${word}$1`
    );
}

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
    .replace(
      /\s+mentionné[es]?\s+dans\s+(la\s+section\s+[^.?!]{0,80}\s+)?(du\s+|le\s+)?(document|texte|contexte|notes?)\.?/giu,
      ''
    )
    .replace(
      /\s+dans\s+la\s+section\s+(dédiée\s+aux?\s+)?[^.?!]{0,60}\s+du\s+document\.?/giu,
      ''
    )
    .replace(/\s+dans\s+(le\s+)?(document|texte|contexte)\.?/giu, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([?!.])/g, '$1')
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

function parentheticalLooksLikeAnswer(inner: string, answers: string[]): boolean {
  const parts = inner
    .split(/\s*(?:,|;|\/|\bet\b)\s*/iu)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return false;

  const matched = parts.filter((part) =>
    answers.some((answer) => {
      const partKey = normalizeAnswer(part);
      const answerKey = normalizeAnswer(answer);
      if (!partKey || !answerKey) return false;
      return (
        answersMatchLoose(part, answer) ||
        answerKey.includes(partKey) ||
        partKey.includes(answerKey)
      );
    })
  );

  if (parts.length === 1) return matched.length === 1;
  return matched.length >= Math.ceil(parts.length * 0.5);
}

/** Remove parenthetical spoilers that reveal expected answers. */
export function stripAnswerSpoilers(question: string, answers: string[]): string {
  if (!question || answers.length === 0) return question;

  return question
    .replace(/\s*\(([^)]+)\)/g, (full, inner: string) =>
      parentheticalLooksLikeAnswer(inner, answers) ? '' : full
    )
    .replace(/\s{2,}/g, ' ')
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
      answers = [...new Set(answers)].slice(0, 8);
      if (answers.length < 2) continue;
      answer = answers[0]!;
      questionText = stripAnswerSpoilers(
        syncListCountInQuestion(questionText, answers.length),
        answers
      );
      if (!questionText) continue;
    }

    if (type === 'libre') {
      questionText = stripAnswerSpoilers(questionText, [answer]);
      if (!questionText) continue;
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
