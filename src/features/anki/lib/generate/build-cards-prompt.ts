import { DECK_PATH_SEP } from '@/features/anki/lib/decks';

export function buildAnkiCardsPrompt(params: {
  docTitle: string;
  content: string;
  count: number;
  deckName: string;
}): string {
  const deckName = params.deckName.trim();
  const leaf =
    deckName.split(DECK_PATH_SEP).filter(Boolean).at(-1)?.trim() || deckName;

  return `Tu es un tuteur de révision. À partir UNIQUEMENT du document fourni, génère ${params.count} cartes Anki en français.

Document « ${params.docTitle} » :
"""
${params.content.slice(0, 12000)}
"""

Deck cible : « ${deckName} »${leaf !== deckName ? ` (thème principal : « ${leaf} »)` : ''}.

Réponds en JSON strict avec cette forme :
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "mnemonic": "string optionnel, astuce mnémotechnique connue et TRÈS COURTE ou chaîne vide"
    }
  ]
}

Règles :
- exactement ${params.count} cartes si le contenu le permet, sinon le maximum pertinent
- question et answer obligatoires, non vides
- mnemonic peut être "" s'il n'y a pas d'astuce utile
- ne invente pas de faits absents du document
- priorise les passages du document liés au deck / thème « ${leaf} »
- ignore ou minimise le contenu hors sujet pour ce deck
- si le document parle peu de ce thème, génère seulement ce qui est vraiment pertinent (moins de cartes si besoin)
- cartes variées, utiles pour mémoriser
- pas de QCM : réponses courtes et claires`;
}
