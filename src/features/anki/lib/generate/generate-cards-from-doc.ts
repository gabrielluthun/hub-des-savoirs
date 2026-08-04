import {
  buildAnkiCardsPrompt,
  type ExistingCardForPrompt,
} from '@/features/anki/lib/generate/build-cards-prompt';
import { deckLeafLabel, decksEqual } from '@/features/anki/lib/decks';
import {
  areCardsDuplicates,
  normalizeQuestion,
} from '@/features/anki/lib/import/deduplication';
import { generateJson } from '@/lib/gemini';
import type { GeminiModel } from '@/types';

export interface GeneratedAnkiDraft {
  question: string;
  answer: string;
  mnemonic: string;
  /** Source excerpt for human review — not persisted on save. */
  quote: string;
}

export interface ExistingAnkiCardRef extends ExistingCardForPrompt {
  deck?: string;
}

function cardsForDeck(
  existingCards: ExistingAnkiCardRef[] | undefined,
  deckName: string
): ExistingCardForPrompt[] {
  if (!existingCards?.length) return [];
  return existingCards
    .filter((card) => card.deck == null || decksEqual(card.deck, deckName))
    .map((card) => ({
      question: card.question,
      answer: card.answer,
    }));
}

export async function generateAnkiCardsFromDoc(params: {
  apiKey: string;
  model: GeminiModel;
  docTitle: string;
  content: string;
  count: number;
  deckName: string;
  /** Existing cards; those with matching deck (or no deck) feed anti-doublons. */
  existingCards?: ExistingAnkiCardRef[];
}): Promise<GeneratedAnkiDraft[]> {
  if (!params.content.trim()) {
    throw new Error('Le document sélectionné est vide.');
  }
  if (!params.deckName.trim()) {
    throw new Error('Indique un deck cible avant de générer.');
  }

  const leaf = deckLeafLabel(params.deckName) || params.deckName.trim();
  const existingForPrompt = cardsForDeck(params.existingCards, params.deckName);

  const prompt = buildAnkiCardsPrompt({
    docTitle: params.docTitle,
    content: params.content,
    count: params.count,
    deckName: params.deckName,
    existingCards: existingForPrompt,
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

  const cards: GeneratedAnkiDraft[] = [];
  for (const card of result.cards) {
    const question = String(card.question ?? '').trim();
    const answer = String(card.answer ?? '').trim();
    const mnemonic = String(card.mnemonic ?? '').trim();
    const quote = String(card.quote ?? '').trim();
    if (!question || !answer) continue;

    const key = normalizeQuestion(question);
    if (!key) continue;

    const candidate = { question, answer };
    if (
      existingForPrompt.some((existing) => areCardsDuplicates(candidate, existing)) ||
      cards.some((existing) => areCardsDuplicates(candidate, existing))
    ) {
      continue;
    }

    cards.push({ question, answer, mnemonic, quote });
    if (cards.length >= params.count) break;
  }

  if (cards.length === 0) {
    throw new Error(
      `Aucune carte nouvelle liée à « ${leaf} » (doublons ou hors sujet). Élargis le deck ou choisis un autre doc.`
    );
  }

  return cards;
}
