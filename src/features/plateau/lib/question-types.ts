import type { QuestionType } from '@/types';

export const ALL_QUESTION_TYPES: QuestionType[] = [
  'qcm',
  'libre',
  'vrai_faux',
  'liste',
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  qcm: 'QCM',
  libre: 'Réponse libre',
  vrai_faux: 'Vrai / Faux',
  liste: 'Complète la liste',
};

export function toggleQuestionType(
  selected: QuestionType[],
  type: QuestionType
): QuestionType[] {
  if (selected.includes(type)) {
    if (selected.length === 1) return selected;
    return selected.filter((entry) => entry !== type);
  }
  return [...selected, type];
}

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .trim()
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return normalizeAnswer(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

function allowedEditDistance(tokenLength: number): number {
  if (tokenLength <= 3) return 0;
  if (tokenLength <= 5) return 1;
  return Math.max(2, Math.round(tokenLength / 3));
}

function tokensFuzzyMatch(guessToken: string, expectedToken: string): boolean {
  if (guessToken === expectedToken) return true;
  const maxLen = Math.max(guessToken.length, expectedToken.length);
  return levenshtein(guessToken, expectedToken) <= allowedEditDistance(maxLen);
}

/** Strict equality after accent/case normalization (QCM, vrai/faux). */
export function answersMatch(guess: string, expected: string): boolean {
  return normalizeAnswer(guess) === normalizeAnswer(expected);
}

/**
 * Lenient match for free text / lists:
 * - exact normalized equality
 * - all guess tokens match expected tokens (order-independent), with small typos allowed
 * - partial names accepted if the surname-like last token matches
 */
export function answersMatchLoose(guess: string, expected: string): boolean {
  if (answersMatch(guess, expected)) return true;

  const guessTokens = tokenize(guess);
  const expectedTokens = tokenize(expected);
  if (guessTokens.length === 0 || expectedTokens.length === 0) return false;

  const allGuessCovered = guessTokens.every((guessToken) =>
    expectedTokens.some((expectedToken) => tokensFuzzyMatch(guessToken, expectedToken))
  );
  if (!allGuessCovered) return false;

  const lastExpected = expectedTokens[expectedTokens.length - 1]!;
  const lastMatched = guessTokens.some((guessToken) =>
    tokensFuzzyMatch(guessToken, lastExpected)
  );
  if (lastMatched) return true;

  const significantExpected = expectedTokens.filter((token) => token.length >= 4);
  if (significantExpected.length === 0) return guessTokens.length === expectedTokens.length;

  const matchedSignificant = significantExpected.filter((expectedToken) =>
    guessTokens.some((guessToken) => tokensFuzzyMatch(guessToken, expectedToken))
  ).length;

  return matchedSignificant >= Math.ceil(significantExpected.length / 2);
}

export function findMatchingListItem(
  guess: string,
  items: string[],
  alreadyFound: Set<string>
): string | null {
  for (const item of items) {
    if (alreadyFound.has(item)) continue;
    if (answersMatchLoose(guess, item)) return item;
  }
  return null;
}
