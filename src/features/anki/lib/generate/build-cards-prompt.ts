import { deckLeafLabel } from '@/features/anki/lib/decks';

export interface ExistingCardForPrompt {
  question: string;
  answer: string;
}

/** Max chars of source document sent to Gemini. */
export const DOC_CHAR_LIMIT = 150000;

/** Max existing cards listed in the prompt to avoid bloat. */
export const EXISTING_CARDS_PROMPT_LIMIT = 80;

export function buildAnkiCardsPrompt(params: {
  docTitle: string;
  content: string;
  count: number;
  deckName: string;
  existingCards?: ExistingCardForPrompt[];
}): string {
  const deckName = params.deckName.trim();
  const leaf = deckLeafLabel(deckName) || deckName;
  const existing = (params.existingCards ?? []).slice(0, EXISTING_CARDS_PROMPT_LIMIT);

  const exclusionBlock =
    existing.length > 0
      ? `
Cartes DÉJÀ présentes dans ce deck — interdites (ni même fait, ni reformulation proche) :
${existing
  .map((card, index) => `${index + 1}. Q: ${card.question} → R: ${card.answer}`)
  .join('\n')}
`
      : '';

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
${params.content.slice(0, DOC_CHAR_LIMIT)}
"""
${exclusionBlock}
Génère jusqu’à ${params.count} cartes utiles pour le deck « ${leaf} ».

Réponds en JSON strict :
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "mnemonic": "string courte ou \\"\\"",
      "quote": "court extrait source recopié du document"
    }
  ]
}

Exemples (qualité attendue) :
BON :
- Q: « Qui a écrit Crime et Châtiment ? » / R: « Fiodor Dostoïevski » / quote: « Crime et Châtiment (Dostoïevski) »
- Q: « En quelle année Pouchkine est-il mort ? » / R: « 1837 » / quote: « Pouchkine meurt en 1837 »
MAUVAIS (à éviter) :
- Q: « Parle de Dostoïevski » (trop large)
- Q: « Dostoïevski a-t-il écrit Crime et Châtiment ? » / R: « Oui » (oui/non)
- Q qui contient déjà la réponse
- plusieurs faits indépendants dans une seule carte

Règles :
- question et answer obligatoires, non vides
- 1 fait = 1 carte (atomique)
- question auto-suffisante : compréhensible sans voir la réponse
- answer courte et claire (nom, date, titre, terme…) — pas de paragraphe
- pas de QCM, pas de oui/non, pas de « cite tout ce que tu sais… »
- varie les angles : qui / quoi / quand / œuvre / mouvement / relation…
- quote : courte citation fidèle du document qui justifie la carte ; obligatoire
- mnemonic : seulement si elle aide vraiment à mémoriser ; sinon ""
- n’invente aucun fait, nom, date ou œuvre absent du document
- ne reprends pas un fait déjà couvert par les cartes existantes listées ci-dessus
- vise ${params.count} cartes si le document le permet sur ce thème ; sinon le maximum pertinent
- si vraiment aucune info liée au thème : { "cards": [] }
- cartes variées`;
}
