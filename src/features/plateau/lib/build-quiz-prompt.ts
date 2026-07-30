import type { PlayedQuizFact, QuestionType } from '@/types';
import { QUESTION_TYPE_LABELS } from '@/features/plateau/lib/question-types';

export function buildQuizPrompt(params: {
  context: string;
  count: number;
  difficulty: string;
  questionTypes: QuestionType[];
  excludeFacts?: PlayedQuizFact[];
}): string {
  const types = params.questionTypes;
  const typeList = types.map((type) => QUESTION_TYPE_LABELS[type]).join(', ');
  const excludeFacts = params.excludeFacts ?? [];

  const typeRules: string[] = [];
  if (types.includes('qcm')) {
    typeRules.push(
      `- qcm : options = exactement 4 choix ; answer = l'une des options à l'identique`
    );
  }
  if (types.includes('libre')) {
    typeRules.push(
      `- libre : pas d'options (ou tableau vide) ; answer = réponse courte attendue`
    );
  }
  if (types.includes('vrai_faux')) {
    typeRules.push(
      `- vrai_faux : options = ["Vrai", "Faux"] uniquement ; answer = "Vrai" ou "Faux"`
    );
  }
  if (types.includes('liste')) {
    typeRules.push(
      `- liste : le joueur tape de mémoire les éléments (AUCUNE liste de choix n'est affichée). question = consigne claire du type « Cite les N … » / « Quels sont les N … ? » ; answers = exactement les N éléments attendus (3 à 5) ; answer = answers[0] ; options = [] ou absent. INTERDIT dans question : « parmi les suivants », « parmi ceux-ci », « coche », « choisis dans la liste », ou toute tournure qui implique des propositions visibles.`
    );
  }

  const exclusionBlock =
    excludeFacts.length > 0
      ? `
Questions / faits DÉJÀ JOUÉS — interdits (ni reformulation proche, ni même réponse sur le même sujet) :
${excludeFacts
  .map((fact, index) => `${index + 1}. Q: ${fact.question} → R: ${fact.answer}`)
  .join('\n')}
`
      : '';

  return `Tu es le Maître du Quiz TV. À partir UNIQUEMENT du contexte fourni, génère ${params.count} questions en français, difficulté « ${params.difficulty} ».

Types autorisés (répartis de façon variée) : ${typeList}.

Contexte (blocs déjà mélangés — ne suis PAS l'ordre d'apparition) :
"""
${params.context.slice(0, 12000)}
"""
${exclusionBlock}
Réponds en JSON strict :
{
  "questions": [
    {
      "type": "qcm|libre|vrai_faux|liste",
      "question": "string",
      "options": ["…"],
      "answer": "string",
      "answers": ["…"],
      "explanation": "courte explication factuelle"
    }
  ]
}

Règles par type :
${typeRules.join('\n')}

Règles générales :
- tutoie la personne à qui tu t'adresses
- chaque question doit avoir un "type" parmi : ${types.join(', ')}
- n'utilise aucun autre type
- ne invente pas de faits absents du contexte si possible
- questions variées et dans un ordre ALÉATOIRE (pas l'ordre du document ni des cartes)
- si une idée est dans la liste des faits déjà joués, choisis un autre angle / un autre fait
- INTERDIT dans question, options et explanation : toute mention du contexte / des notes / des sources (ex. « Selon le contexte », « D'après le document », « Dans tes notes », « Selon tes cartes »). Formule les questions comme un quiz TV autonome.`;
}
