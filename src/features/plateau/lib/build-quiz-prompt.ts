import type { QuestionType } from '@/types';
import { QUESTION_TYPE_LABELS } from '@/features/plateau/lib/question-types';

export function buildQuizPrompt(params: {
  context: string;
  count: number;
  difficulty: string;
  questionTypes: QuestionType[];
}): string {
  const types = params.questionTypes;
  const typeList = types.map((type) => QUESTION_TYPE_LABELS[type]).join(', ');

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
      `- liste : question = thème à compléter ; answers = 3 à 5 éléments à retrouver ; answer = le premier élément ; pas d'options`
    );
  }

  return `Tu es le Maître du Quiz TV. À partir UNIQUEMENT du contexte fourni, génère ${params.count} questions en français, difficulté « ${params.difficulty} ».

Types autorisés (répartis de façon variée) : ${typeList}.

Contexte :
"""
${params.context.slice(0, 12000)}
"""

Réponds en JSON strict :
{
  "questions": [
    {
      "type": "qcm|libre|vrai_faux|liste",
      "question": "string",
      "options": ["…"],
      "answer": "string",
      "answers": ["…"],
      "explanation": "courte explication basée sur le contexte"
    }
  ]
}

Règles par type :
${typeRules.join('\n')}

Règles générales :
- chaque question doit avoir un "type" parmi : ${types.join(', ')}
- n'utilise aucun autre type
- ne invente pas de faits absents du contexte si possible
- questions variées, pas dans l'ordre du document`;
}
