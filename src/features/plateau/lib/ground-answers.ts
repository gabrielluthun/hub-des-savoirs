import type { GeneratedQuestion } from '@/types';
import {
  stripAnswerSpoilers,
  stripContextMetaPhrases,
  syncListCountInQuestion,
} from '@/features/plateau/lib/normalize-questions';
import { normalizeAnswer } from '@/features/plateau/lib/question-types';

/** True if the answer (or its significant tokens) appears in the quiz context. */
export function isAnswerInContext(answer: string, context: string): boolean {
  const needle = normalizeAnswer(answer);
  if (needle.length < 2) return false;

  const haystack = normalizeAnswer(context);
  if (haystack.includes(needle)) return true;

  const tokens = needle
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4);
  if (tokens.length === 0) return false;

  return tokens.every((token) => haystack.includes(token));
}

/** Prefer answers actually justified by the explanation when the model padded the list. */
export function preferAnswersJustifiedByExplanation(
  answers: string[],
  explanation: string
): string[] {
  if (!explanation.trim() || answers.length < 2) return answers;

  const justified = answers.filter((answer) =>
    isAnswerInContext(answer, explanation)
  );
  if (justified.length >= 2 && justified.length < answers.length) {
    return justified;
  }
  return answers;
}

export { syncListCountInQuestion };

/** Drop invented answers; align list size with explanation; discard ungrounded questions. */
export function groundQuestionsInContext(
  questions: GeneratedQuestion[],
  context: string
): GeneratedQuestion[] {
  if (!context.trim()) return questions;

  const grounded: GeneratedQuestion[] = [];

  for (const question of questions) {
    if (question.type === 'vrai_faux') {
      grounded.push(question);
      continue;
    }

    if (question.type === 'liste') {
      let answers = (question.answers ?? []).filter((answer) =>
        isAnswerInContext(answer, context)
      );
      answers = preferAnswersJustifiedByExplanation(
        answers,
        question.explanation ?? ''
      );

      if (answers.length < 2) continue;

      const questionText = stripAnswerSpoilers(
        stripContextMetaPhrases(
          syncListCountInQuestion(question.question, answers.length)
        ),
        answers
      );
      if (!questionText) continue;

      grounded.push({
        ...question,
        answers,
        answer: answers[0]!,
        question: questionText,
      });
      continue;
    }

    if (question.type === 'libre') {
      if (!isAnswerInContext(question.answer, context)) continue;
      const questionText = stripAnswerSpoilers(question.question, [
        question.answer,
      ]);
      if (!questionText) continue;
      grounded.push({ ...question, question: questionText });
      continue;
    }

    if (question.type === 'qcm') {
      if (!isAnswerInContext(question.answer, context)) continue;
      grounded.push(question);
    }
  }

  return grounded;
}
