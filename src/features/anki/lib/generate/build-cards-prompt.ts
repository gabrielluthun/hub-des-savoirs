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

  return `Tu es un tuteur de révision. Génère des cartes Anki en français à partir du document.

Objectif du deck : « ${leaf} »${leaf !== deckName ? ` (chemin : « ${deckName} »)` : ''}.
Choisis en priorité les faits du document qui servent à réviser ce sujet.
Interprète le thème largement et de façon raisonnable :
- « Histoire » → personnages, dates, événements, institutions, guerres, politiques historiques…
- « Sciences et Techniques » → sciences, maths, inventions, technologie…
- « Littérature » → auteurs, œuvres, mouvements…
- « Sport » → règles, records, athlètes, compétitions…
Un fait clairement lié au thème doit être gardé. N’exclus un fait que s’il est vraiment hors sujet.

Document « ${params.docTitle} » (seule source de faits) :
"""
${params.content.slice(0, 12000)}
"""

Génère jusqu’à ${params.count} cartes utiles pour le deck « ${leaf} ».

Réponds en JSON strict :
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "mnemonic": "string courte ou \"\""
    }
  ]
}

Règles :
- question et answer obligatoires, non vides
- mnemonic peut être ""
- ne invente aucun fait absent du document
- vise ${params.count} cartes si le document le permet sur ce thème ; sinon le maximum pertinent
- si vraiment aucune info liée au thème : { "cards": [] }
- pas de QCM : réponses courtes et claires
- cartes variées`;
}
