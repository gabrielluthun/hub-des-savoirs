interface ReviewCardFaceProps {
  question: string;
  answer: string;
  deck?: string;
  mnemonic?: string;
  revealed: boolean;
}

export function ReviewCardFace({
  question,
  answer,
  deck = '',
  mnemonic = '',
  revealed,
}: ReviewCardFaceProps) {
  const deckLabel = deck.trim();

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center">
      {deckLabel ? (
        <p className="mb-3 max-w-md truncate text-xs text-muted-foreground" title={deckLabel}>
          {deckLabel}
        </p>
      ) : null}
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
