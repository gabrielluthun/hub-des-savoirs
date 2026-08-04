/** Normalize a question for duplicate detection. */
export function normalizeQuestion(question: string): string {
  return question
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize an answer for duplicate detection. */
export function normalizeAnswer(answer: string): string {
  return answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Framing / function words ignored when comparing question substance. */
const QUESTION_STOPWORDS = new Set([
  'alors',
  'apres',
  'auteur',
  'auteurs',
  'avant',
  'avec',
  'avoir',
  'cette',
  'chez',
  'comme',
  'comment',
  'dans',
  'dont',
  'ecrit',
  'ecrire',
  'elle',
  'elles',
  'entre',
  'est',
  'etre',
  'fait',
  'faire',
  'ils',
  'leur',
  'leurs',
  'mais',
  'meme',
  'nomme',
  'nommee',
  'oeuvre',
  'oeuvres',
  'ont',
  'ou',
  'par',
  'pas',
  'pendant',
  'piece',
  'pieces',
  'plus',
  'pour',
  'pourquoi',
  'quand',
  'quel',
  'quelle',
  'quelles',
  'quels',
  'qui',
  'quoi',
  'sans',
  'selon',
  'sont',
  'sous',
  'sur',
  'vers',
]);

const MIN_TOKEN_LENGTH = 4;
/** Jaccard on significant tokens — catches reformulations of the same fact. */
const NEAR_DUP_JACCARD = 0.4;
/** Containment ratio when one question is much shorter. */
const NEAR_DUP_CONTAINMENT = 0.6;
const MIN_SIGNIFICANT_TOKENS = 2;

export interface DeduplicationIncomingCard {
  question: string;
  answer: string;
  deck: string;
  mnemonic: string;
  tags: string[];
}

export interface DeduplicationCardRef {
  question: string;
  answer: string;
  deck?: string;
}

export interface DeduplicationResult<T extends DeduplicationIncomingCard> {
  unique: T[];
  duplicates: T[];
}

export function significantQuestionTokens(question: string): Set<string> {
  const tokens = normalizeQuestion(question)
    .split(' ')
    .filter(
      (token) =>
        token.length >= MIN_TOKEN_LENGTH && !QUESTION_STOPWORDS.has(token)
    );
  return new Set(tokens);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function containment(a: Set<string>, b: Set<string>): number {
  const smaller = a.size <= b.size ? a : b;
  const larger = a.size <= b.size ? b : a;
  if (smaller.size === 0) return 0;
  let overlap = 0;
  for (const token of smaller) {
    if (larger.has(token)) overlap += 1;
  }
  return overlap / smaller.size;
}

/** True when questions cover the same substance (reformulation). */
export function questionsAreNearDuplicate(a: string, b: string): boolean {
  const qa = normalizeQuestion(a);
  const qb = normalizeQuestion(b);
  if (!qa || !qb) return false;
  if (qa === qb) return true;

  const tokensA = significantQuestionTokens(a);
  const tokensB = significantQuestionTokens(b);
  if (
    tokensA.size < MIN_SIGNIFICANT_TOKENS ||
    tokensB.size < MIN_SIGNIFICANT_TOKENS
  ) {
    return false;
  }

  return (
    jaccard(tokensA, tokensB) >= NEAR_DUP_JACCARD ||
    containment(tokensA, tokensB) >= NEAR_DUP_CONTAINMENT
  );
}

/** Exact question match, or same answer with near-identical question substance. */
export function areCardsDuplicates(
  a: { question: string; answer: string },
  b: { question: string; answer: string }
): boolean {
  const qA = normalizeQuestion(a.question);
  const qB = normalizeQuestion(b.question);
  if (qA && qA === qB) return true;

  const answerA = normalizeAnswer(a.answer);
  const answerB = normalizeAnswer(b.answer);
  if (!answerA || answerA !== answerB) return false;

  return questionsAreNearDuplicate(a.question, b.question);
}

export function findDuplicateOf<T extends DeduplicationCardRef>(
  card: { question: string; answer: string },
  existing: T[]
): T | undefined {
  return existing.find((item) => areCardsDuplicates(card, item));
}

export function buildExistingQuestionKeys(
  cards: { question: string }[]
): Set<string> {
  return new Set(cards.map((card) => normalizeQuestion(card.question)).filter(Boolean));
}

/**
 * Keep first occurrence in the batch; skip if the card duplicates an existing
 * one (exact question, or same answer + near question) or an earlier unique card.
 */
export function partitionByQuestionDeduplication<T extends DeduplicationIncomingCard>(
  incoming: T[],
  existing: DeduplicationCardRef[] | Set<string>
): DeduplicationResult<T> {
  const unique: T[] = [];
  const duplicates: T[] = [];

  if (existing instanceof Set) {
    const seen = new Set(existing);
    for (const card of incoming) {
      const key = normalizeQuestion(card.question);
      if (!key || seen.has(key)) {
        duplicates.push(card);
        continue;
      }
      seen.add(key);
      unique.push(card);
    }
    return { unique, duplicates };
  }

  const pool: DeduplicationCardRef[] = [...existing];
  for (const card of incoming) {
    const key = normalizeQuestion(card.question);
    if (!key || findDuplicateOf(card, pool)) {
      duplicates.push(card);
      continue;
    }
    unique.push(card);
    pool.push(card);
  }

  return { unique, duplicates };
}
