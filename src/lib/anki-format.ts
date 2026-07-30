export interface ParsedAnkiLine {
  question: string;
  answer: string;
  deck: string;
  mnemonic: string;
  tags: string[];
}

/**
 * Format: Question;Réponse;Deck;Mnémotechnique;Tags
 * - Question, Réponse, Deck are required
 * - Mnémotechnique and Tags are optional
 * - Tags are comma-separated in the 5th field
 */
export function parseBulkAnkiInput(raw: string): ParsedAnkiLine[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseAnkiLine(line))
    .filter((card): card is ParsedAnkiLine => Boolean(card));
}

function parseTagsField(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(',')) {
    const tag = part.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

export function parseAnkiLine(line: string): ParsedAnkiLine | null {
  if (!line.includes(';')) return null;

  const parts = line.split(';').map((part) => part.trim());
  const question = parts[0] ?? '';
  const answer = parts[1] ?? '';
  const deck = parts[2] ?? '';
  const mnemonic = parts[3] ?? '';
  const tags = parts[4] ? parseTagsField(parts[4]) : [];

  if (!question || !answer || !deck) return null;

  return { question, answer, deck, mnemonic, tags };
}

export function serializeAnkiCards(
  cards: {
    question: string;
    answer: string;
    deck: string;
    mnemonic?: string;
    tags?: string[];
  }[]
): string {
  return cards
    .map((card) => {
      const mnemonic = card.mnemonic?.trim() ?? '';
      const tags = (card.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
      const base = `${card.question};${card.answer};${card.deck}`;

      if (!mnemonic && tags.length === 0) return base;
      if (mnemonic && tags.length === 0) return `${base};${mnemonic}`;
      if (!mnemonic && tags.length > 0) return `${base};;${tags.join(',')}`;
      return `${base};${mnemonic};${tags.join(',')}`;
    })
    .join('\n');
}
