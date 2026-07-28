export function parseBulkAnkiInput(raw: string): { question: string; answer: string }[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      let question = '';
      let answer = '';
      if (line.includes('\t')) {
        [question, answer] = line.split('\t');
      } else if (line.includes('|')) {
        [question, answer] = line.split('|');
      } else if (line.includes(';')) {
        [question, answer] = line.split(';');
      } else {
        return null;
      }
      question = question?.trim() ?? '';
      answer = answer?.trim() ?? '';
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((card): card is { question: string; answer: string } => Boolean(card));
}

export function serializeAnkiCards(
  cards: { question: string; answer: string }[]
): string {
  return cards.map((card) => `${card.question}\t${card.answer}`).join('\n');
}
