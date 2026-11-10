import { useState } from 'react';
import { ChevronDown, CloudDownload, ExternalLink, Sparkles } from 'lucide-react';
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
  /** Whether the document already has content; collapses the source block on mobile. */
  hasContent: boolean;
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
  hasContent,
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
  // Below md the source block and the view tabs are collapsible so the editor starts higher.
  // Open by default only for an empty document (to paste a URL or import a file).
  const [sourceOpen, setSourceOpen] = useState(!hasContent);

  return (
    <div className="space-y-3 border-b border-border px-4 py-3">
      <button
        type="button"
        onClick={() => setSourceOpen((open) => !open)}
        aria-expanded={sourceOpen}
        aria-controls="docs-source docs-panes"
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl text-left md:hidden"
      >
        <span className="flex items-center gap-2 whitespace-nowrap text-sm font-medium">
          <CloudDownload className="h-4 w-4 shrink-0 text-muted-foreground" />
          Google Docs
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <SyncStatusBadge
            status={syncStatus}
            lastImportedAt={lastImportedAt}
            className="whitespace-nowrap"
          />
          {/* Not enough room next to the badge on the narrowest phones. */}
          <span className="hidden whitespace-nowrap text-xs text-muted-foreground min-[380px]:inline">
            {savingLabel}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground transition-transform', sourceOpen && 'rotate-180')}
          />
        </span>
      </button>

      <div
        id="docs-source"
        className={cn('flex-wrap items-center gap-2 md:flex', sourceOpen ? 'flex' : 'hidden')}
      >
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

      <div
        id="docs-panes"
        className={cn('flex-wrap items-center gap-2 md:flex', sourceOpen ? 'flex' : 'hidden')}
      >
        {(
          [
            ['editor', 'Éditeur Markdown', 'Éditer'],
            ['preview', 'Aperçu Markdown', 'Aperçu'],
            ['gdocs', 'Aperçu du document lié à l\'URL', 'Doc'],
          ] as const
        ).map(([id, label, shortLabel]) => (
          <button
            key={id}
            type="button"
            onClick={() => onPaneChange(id)}
            title={label}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              pane === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {/* Short labels below sm so the three tabs fit on one line. */}
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <Button type="button" variant="accent" size="sm" onClick={onGenerateQuiz}>
          <Sparkles className="h-3.5 w-3.5" />
          Générer un quiz IA
        </Button>

        {/* Below md, the status and saving label live in the collapsible header. */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <SyncStatusBadge status={syncStatus} lastImportedAt={lastImportedAt} />
          <span className="text-xs text-muted-foreground">{savingLabel}</span>
        </div>
      </div>
    </div>
  );
}
