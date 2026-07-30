interface ReviewProgressProps {
  remaining: number;
  reviewedCount: number;
}

export function ReviewProgress({ remaining, reviewedCount }: ReviewProgressProps) {
  const total = remaining + reviewedCount;
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Revue {reviewedCount}
        {total > 0 ? ` / ${total}` : ''}
      </span>
      <span className="tabular-nums">
        {remaining} restante{remaining !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
