interface ReviewCardFaceProps {
  question: string;
  answer: string;
  mnemonic?: string;
  revealed: boolean;
}

export function ReviewCardFace({
  question,
  answer,
  mnemonic = '',
  revealed,
}: ReviewCardFaceProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {revealed ? 'Réponse' : 'Question'}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold leading-snug">
        {revealed ? answer : question}
      </p>
      {revealed ? (
        <>
          <p className="mt-6 max-w-md text-sm text-muted-foreground">{question}</p>
          {mnemonic.trim() ? (
            <p className="mt-3 max-w-md text-sm italic text-muted-foreground">
              {mnemonic.trim()}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
