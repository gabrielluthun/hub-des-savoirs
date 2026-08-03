import type { ReactNode } from 'react';

interface QuestionFeedbackProps {
  title: string;
  explanation?: string;
  children?: ReactNode;
}

export function QuestionFeedback({
  title,
  explanation,
  children,
}: QuestionFeedbackProps) {
  return (
    <div className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm">
      <p className="font-medium">{title}</p>
      {explanation ? (
        <p className="mt-1 text-muted-foreground">{explanation}</p>
      ) : null}
      {children}
    </div>
  );
}
