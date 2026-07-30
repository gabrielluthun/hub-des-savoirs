export function buildAnkiCardsPrompt(params: {
  docTitle: string;
  content: string;
  count: number;
}): string {
  return `Tu es un tuteur de révision. À partir UNIQUEMENT du document fourni, génère ${params.count} cartes Anki en français.

Document « ${params.docTitle} » :
"""
${params.content.slice(0, 12000)}
"""

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
- cartes variées, utiles pour mémoriser le contenu
- pas de QCM : réponses courtes et claires`;
}
