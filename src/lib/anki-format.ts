export interface ParsedAnkiLine {
  question: string;
  answer: string;
  mnemonic: string;
}

/**
 * Format: Question;Réponse;Mnémotechnique
 * - Question and Réponse are required
 * - Mnémotechnique is optional
 * Also accepts tab or | as separators (legacy 2-field lines).
 */
export function parseBulkAnkiInput(raw: string): ParsedAnkiLine[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseAnkiLine(line))
    .filter((card): card is ParsedAnkiLine => Boolean(card));
}

export function parseAnkiLine(line: string): ParsedAnkiLine | null {
  let parts: string[];
  if (line.includes(';')) {
    parts = line.split(';');
  } else if (line.includes('\t')) {
    parts = line.split('\t');
  } else if (line.includes('|')) {
    parts = line.split('|');
  } else {
    return null;
  }

  const question = parts[0]?.trim() ?? '';
  const answer = parts[1]?.trim() ?? '';
  const mnemonic = parts
    .slice(2)
    .map((part) => part.trim())
    .filter(Boolean)
    .join('; ');

  if (!question || !answer) return null;
  return { question, answer, mnemonic };
}

export function serializeAnkiCards(
  cards: { question: string; answer: string; mnemonic?: string }[]
): string {
  return cards
    .map((card) => {
      const mnemonic = card.mnemonic?.trim() ?? '';
      if (mnemonic) {
        return `${card.question};${card.answer};${mnemonic}`;
      }
      return `${card.question};${card.answer}`;
    })
    .join('\n');
}
