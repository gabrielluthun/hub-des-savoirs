/**
 * JetPunk answer matching: exact (normalized) + optional last-name shortcut
 * for ordinary person names (not royalty).
 */

const ROYALTY_TITLES = new Set([
  'roi',
  'reine',
  'king',
  'queen',
  'empereur',
  'imperatrice',
  'prince',
  'princesse',
  'pape',
  'tsar',
  'tsarine',
  'pharaon',
  'sultan',
  'sultane',
  'duc',
  'duchesse',
  'comte',
  'comtesse',
  'archiduc',
  'archiduchesse',
  'lord',
  'lady',
]);

const NAME_PARTICLES = new Set([
  'de',
  'du',
  'des',
  'van',
  'von',
  'da',
  'di',
  'del',
  'della',
  'le',
  'la',
  'ten',
  'ter',
  'af',
]);

/** Roman numerals often used in royal names (XIV, III, …). */
const ROMAN_NUMERAL = /^(?:m{0,3})(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})$/;

export function normalizeJetpunkAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function tokensOf(normalized: string): string[] {
  return normalized.split(/[\s]+/).filter(Boolean);
}

function isRomanNumeral(token: string): boolean {
  return token.length > 0 && ROMAN_NUMERAL.test(token);
}

function isRoyaltyName(tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  if (ROYALTY_TITLES.has(tokens[0]!)) return true;
  if (tokens.some(isRomanNumeral)) return true;
  return false;
}

/**
 * True when the answer looks like "Prénom Nom" (2+ letter words),
 * not a royal title / numbered monarch.
 */
export function looksLikeOrdinaryPersonName(answer: string): boolean {
  const normalized = normalizeJetpunkAnswer(answer);
  const tokens = tokensOf(normalized);
  if (tokens.length < 2) return false;
  if (isRoyaltyName(tokens)) return false;
  // Reject tokens that are mostly digits (years, etc.).
  if (tokens.some((token) => /\d/.test(token))) return false;
  return tokens.every((token) => /[a-z]/.test(token));
}

/** Accepted last-name forms for an ordinary person answer (normalized). */
export function personLastNameForms(answer: string): string[] {
  if (!looksLikeOrdinaryPersonName(answer)) return [];
  const tokens = tokensOf(normalizeJetpunkAnswer(answer));
  const last = tokens[tokens.length - 1]!;
  if (last.length < 2) return [];

  // « Charles de Gaulle » → accept « de gaulle » (not bare « gaulle »,
  // which would also match places like « Afrique du Sud »).
  if (tokens.length >= 3) {
    const particle = tokens[tokens.length - 2]!;
    if (NAME_PARTICLES.has(particle)) {
      return [`${particle} ${last}`];
    }
  }

  // « Victor Hugo » → « hugo »
  if (tokens.length === 2) {
    return [last];
  }

  // « Martin Luther King » → last token only
  return [last];
}

export type AnswerMatchKind = 'exact' | 'last-name';

export function matchKindForGuess(
  answer: string,
  guessRaw: string
): AnswerMatchKind | null {
  const guess = normalizeJetpunkAnswer(guessRaw);
  if (!guess) return null;
  const expected = normalizeJetpunkAnswer(answer);
  if (!expected) return null;
  if (guess === expected) return 'exact';
  if (personLastNameForms(answer).includes(guess)) return 'last-name';
  return null;
}

export function answerMatchesGuess(answer: string, guessRaw: string): boolean {
  return matchKindForGuess(answer, guessRaw) !== null;
}

/**
 * All still-open items that match the guess.
 * Exact full-name hits win as a group; otherwise all last-name hits
 * (e.g. « Dupont » validates Pierre Dupont + Marie Dupont together).
 */
export function findMatchingAnswers<T extends { id: string; answer: string }>(
  items: T[],
  guessRaw: string,
  excludeIds: ReadonlySet<string>
): T[] {
  const candidates = items
    .filter((item) => !excludeIds.has(item.id))
    .map((item) => ({ item, kind: matchKindForGuess(item.answer, guessRaw) }))
    .filter((entry): entry is { item: T; kind: AnswerMatchKind } => entry.kind !== null);

  if (candidates.length === 0) return [];

  const exact = candidates.filter((entry) => entry.kind === 'exact');
  if (exact.length > 0) return exact.map((entry) => entry.item);
  return candidates.map((entry) => entry.item);
}
