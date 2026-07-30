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
    .trim()
    .toLowerCase();
}

export function answersMatch(guess: string, expected: string): boolean {
  return normalizeAnswer(guess) === normalizeAnswer(expected);
}

export function findMatchingListItem(
  guess: string,
  items: string[],
  alreadyFound: Set<string>
): string | null {
  const normalizedGuess = normalizeAnswer(guess);
  for (const item of items) {
    if (alreadyFound.has(item)) continue;
    if (normalizeAnswer(item) === normalizedGuess) return item;
  }
  return null;
}
