import { buildAnkiCardsPrompt } from '@/features/anki/lib/generate/build-cards-prompt';
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
  });

  if (!Array.isArray(result.cards) || result.cards.length === 0) {
    throw new Error('Aucune carte générée.');
  }

  return result.cards
    .map((card) => ({
      question: String(card.question ?? '').trim(),
      answer: String(card.answer ?? '').trim(),
      mnemonic: String(card.mnemonic ?? '').trim(),
    }))
    .filter((card) => card.question && card.answer)
    .slice(0, params.count);
}
