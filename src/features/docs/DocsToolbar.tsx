import { CloudDownload, ExternalLink, Sparkles } from 'lucide-react';
import { Button, Input } from '@/components/ui/primitives';
import { ImportMarkdownButton } from '@/features/docs/components/toolbar/ImportMarkdownButton';
import { SyncButton } from '@/features/docs/components/toolbar/SyncButton';
import { SyncStatusBadge } from '@/features/docs/components/toolbar/SyncStatusBadge';
import type { MarkdownImportResult } from '@/features/docs/lib/import-markdown';
import type { DocSyncStatus } from '@/features/docs/lib/doc-sync';
import { cn } from '@/lib/utils';

export type DocsPane = 'editor' | 'preview' | 'gdocs';

interface DocsToolbarProps {
  url: string;
  pane: DocsPane;
  savingLabel: string;
  syncStatus: DocSyncStatus;
  lastImportedAt?: string;
  syncLoading?: boolean;
  onUrlChange: (url: string) => void;
  onImport: () => void;
  onRefresh: () => void;
  onImportMarkdown: (result: MarkdownImportResult) => void;
  onImportMarkdownError: (message: string) => void;
  onPaneChange: (pane: DocsPane) => void;
  onGenerateQuiz: () => void;
  canOpenExternal: boolean;
  externalUrl?: string;
}

export function DocsToolbar({
  url,
  pane,
  savingLabel,
  syncStatus,
  lastImportedAt,
  syncLoading = false,
  onUrlChange,
  onImport,
  onRefresh,
  onImportMarkdown,
  onImportMarkdownError,
  onPaneChange,
  onGenerateQuiz,
  canOpenExternal,
  externalUrl,
}: DocsToolbarProps) {
  return (
    <div className="space-y-3 border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://docs.google.com/document/d/…"
          className="min-w-[200px] flex-1"
        />
        <Button type="button" variant="secondary" onClick={onImport}>
          <CloudDownload className="h-4 w-4" />
          Vers Éditeur
        </Button>
        <SyncButton onClick={onRefresh} loading={syncLoading} disabled={!url.trim()} />
        <ImportMarkdownButton
          onImported={onImportMarkdown}
          onError={onImportMarkdownError}
        />
        {canOpenExternal && externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Ouvrir dans Google Docs"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['editor', 'Éditeur Markdown'],
            ['preview', 'Aperçu Markdown'],
            ['gdocs', 'Aperçu du document lié à l\'URL'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onPaneChange(id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              pane === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}

        <Button type="button" variant="accent" size="sm" onClick={onGenerateQuiz}>
          <Sparkles className="h-3.5 w-3.5" />
          Générer un quiz IA
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <SyncStatusBadge status={syncStatus} lastImportedAt={lastImportedAt} />
          <span className="text-xs text-muted-foreground">{savingLabel}</span>
        </div>
      </div>
    </div>
  );
}
