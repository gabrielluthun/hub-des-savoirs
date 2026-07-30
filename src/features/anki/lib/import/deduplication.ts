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

export interface DeduplicationIncomingCard {
  question: string;
  answer: string;
  deck: string;
  mnemonic: string;
  tags: string[];
}

export interface DeduplicationResult<T extends DeduplicationIncomingCard> {
  unique: T[];
  duplicates: T[];
}

export function buildExistingQuestionKeys(
  cards: { question: string }[]
): Set<string> {
  return new Set(cards.map((card) => normalizeQuestion(card.question)).filter(Boolean));
}

/**
 * Keep first occurrence in the batch; skip if question already exists
 * in `existingKeys` or earlier in the same import.
 */
export function partitionByQuestionDeduplication<T extends DeduplicationIncomingCard>(
  incoming: T[],
  existingKeys: Set<string>
): DeduplicationResult<T> {
  const seen = new Set(existingKeys);
  const unique: T[] = [];
  const duplicates: T[] = [];

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
