import { deckIsUnder } from '@/features/anki/lib/decks';
import type {
  AnkiCard,
  HubDocument,
  JetPunkList,
  QuizSource,
  QuizSourceSelection,
} from '@/types';

export function createSourceSelection(
  kind: QuizSource,
  options: {
    docIds?: string[];
    deckNames?: string[];
    listIds?: string[];
  } = {}
): QuizSourceSelection {
  return {
    kind,
    docIds: options.docIds ?? [],
    deckNames: options.deckNames ?? [],
    listIds: options.listIds ?? [],
  };
}

/** Switch kind and pre-select every available item of that kind. */
export function selectionForKind(
  kind: QuizSource,
  catalog: {
    docs: HubDocument[];
    deckNames: string[];
    lists: JetPunkList[];
  }
): QuizSourceSelection {
  return createSourceSelection(kind, {
    docIds: catalog.docs.map((doc) => doc.id),
    deckNames: [...catalog.deckNames],
    listIds: catalog.lists.map((list) => list.id),
  });
}

export function filterDocsForSelection(
  docs: HubDocument[],
  selection: QuizSourceSelection
): HubDocument[] {
  if (selection.kind === 'all') return docs;
  if (selection.kind !== 'docs') return [];
  const allowed = new Set(selection.docIds);
  return docs.filter((doc) => allowed.has(doc.id));
}

export function filterCardsForSelection(
  cards: AnkiCard[],
  selection: QuizSourceSelection
): AnkiCard[] {
  if (selection.kind === 'all') return cards;
  if (selection.kind !== 'anki') return [];
  if (selection.deckNames.length === 0) return [];
  return cards.filter((card) =>
    selection.deckNames.some((deck) => deckIsUnder(card.deck ?? '', deck))
  );
}

export function filterListsForSelection(
  lists: JetPunkList[],
  selection: QuizSourceSelection
): JetPunkList[] {
  if (selection.kind === 'all') return lists;
  if (selection.kind !== 'jetpunk') return [];
  const allowed = new Set(selection.listIds);
  return lists.filter((list) => allowed.has(list.id));
}

export function selectionHasResources(
  selection: QuizSourceSelection,
  catalog: {
    docs: HubDocument[];
    cards: AnkiCard[];
    lists: JetPunkList[];
  }
): boolean {
  const docs = filterDocsForSelection(catalog.docs, selection).some((doc) =>
    doc.content.trim()
  );
  const cards = filterCardsForSelection(catalog.cards, selection).length > 0;
  const lists = filterListsForSelection(catalog.lists, selection).some((list) =>
    list.items.some((item) => item.prompt.trim() || item.answer.trim())
  );

  if (selection.kind === 'all') return docs || cards || lists;
  if (selection.kind === 'docs') return docs;
  if (selection.kind === 'anki') return cards;
  return lists;
}
