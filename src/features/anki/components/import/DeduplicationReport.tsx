interface DeduplicationReportProps {
  added: number;
  skipped: number;
  skippedQuestions?: string[];
  onDismiss: () => void;
}

export function DeduplicationReport({
  added,
  skipped,
  skippedQuestions = [],
  onDismiss,
}: DeduplicationReportProps) {
  if (skipped === 0 && added === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {added > 0
              ? `${added} carte${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}`
              : 'Aucune nouvelle carte'}
            {skipped > 0
              ? ` · ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}`
              : ''}
          </p>
          {skippedQuestions.length > 0 ? (
            <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-xs text-muted-foreground">
              {skippedQuestions.slice(0, 8).map((question) => (
                <li key={question} className="truncate">
                  · {question}
                </li>
              ))}
              {skippedQuestions.length > 8 ? (
                <li>… et {skippedQuestions.length - 8} de plus</li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          OK
        </button>
      </div>
    </div>
  );
}
