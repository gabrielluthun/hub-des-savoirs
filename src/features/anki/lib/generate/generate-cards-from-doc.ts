import { buildAnkiCardsPrompt } from '@/features/anki/lib/generate/build-cards-prompt';
import { DECK_PATH_SEP } from '@/features/anki/lib/decks';
import { generateJson } from '@/lib/gemini';
import type { GeminiModel } from '@/types';

export interface GeneratedAnkiDraft {
  question: string;
  answer: string;
  mnemonic: string;
}

export async function generateAnkiCardsFromDoc(params: {
  apiKey: string;
  model: GeminiModel;
  docTitle: string;
  content: string;
  count: number;
  deckName: string;
}): Promise<GeneratedAnkiDraft[]> {
  if (!params.content.trim()) {
    throw new Error('Le document sélectionné est vide.');
  }
  if (!params.deckName.trim()) {
    throw new Error('Indique un deck cible avant de générer.');
  }

  const leaf =
    params.deckName.split(DECK_PATH_SEP).filter(Boolean).at(-1)?.trim() ||
    params.deckName;

  const prompt = buildAnkiCardsPrompt({
    docTitle: params.docTitle,
    content: params.content,
    count: params.count,
    deckName: params.deckName,
  });

  const result = await generateJson<{ cards: GeneratedAnkiDraft[] }>({
    apiKey: params.apiKey,
    model: params.model,
    prompt,
    temperature: 0.4,
  });

  if (!Array.isArray(result.cards) || result.cards.length === 0) {
    throw new Error(
      `Aucune carte liée à « ${leaf} » dans ce document. Choisis un autre doc, ou un deck plus large.`
    );
  }

  const cards = result.cards
    .map((card) => ({
      question: String(card.question ?? '').trim(),
      answer: String(card.answer ?? '').trim(),
      mnemonic: String(card.mnemonic ?? '').trim(),
    }))
    .filter((card) => card.question && card.answer)
    .slice(0, params.count);

  if (cards.length === 0) {
    throw new Error(
      `Aucune carte liée à « ${leaf} » dans ce document. Choisis un autre doc, ou un deck plus large.`
    );
  }

  return cards;
}
