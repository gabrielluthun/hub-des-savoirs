import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentList } from '@/features/docs/DocumentList';
import { DocsToolbar, type DocsPane } from '@/features/docs/DocsToolbar';
import { MarkdownEditor } from '@/features/docs/MarkdownEditor';
import { OutlinePanel } from '@/features/docs/OutlinePanel';
import { TagEditor } from '@/features/docs/components/editor/TagEditor';
import { hashContent } from '@/features/docs/lib/content-hash';
import {
  buildGoogleDocsEmbedUrl,
  extractGoogleDocId,
  importGoogleDocText,
} from '@/features/docs/lib/google-docs';
import type { MarkdownImportResult } from '@/features/docs/lib/import-markdown';
import {
  refreshGoogleDoc,
  useDocSyncStatus,
  useLocalContentHash,
} from '@/features/docs/hooks/useDocSync';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { createId } from '@/lib/utils';
import { addDoc, deleteDoc, setActiveDoc, setTab, updateDoc } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import { selectActiveDoc, selectDocs } from '@/store/selectors';

export function DocsView() {
  const { state, dispatch } = useStore();
  const docs = selectDocs(state);
  const activeDoc = selectActiveDoc(state);
  const [pane, setPane] = useState<DocsPane>('editor');
  const [savingLabel, setSavingLabel] = useState('Sauvegardé');
  const [syncLoading, setSyncLoading] = useState(false);

  const localHash = useLocalContentHash(activeDoc?.content ?? '');
  const syncStatus = useDocSyncStatus(activeDoc?.contentHash, localHash);

  useEffect(() => {
    if (!activeDoc) return;
    setSavingLabel('Sauvegarde…');
    const timer = window.setTimeout(() => setSavingLabel('Sauvegardé'), 400);
    return () => window.clearTimeout(timer);
  }, [activeDoc]);

  const docId = activeDoc ? extractGoogleDocId(activeDoc.googleDocsUrl) : null;

  const handleAdd = () => {
    dispatch(
      addDoc({
        id: createId(),
        title: 'Nouveau document',
        googleDocsUrl: '',
        content: '',
        tags: [],
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const handleImport = async () => {
    if (!activeDoc) return;
    if (!activeDoc.googleDocsUrl.trim()) {
      toast.error('Ajoutez une URL Google Docs.');
      return;
    }
    if (
      activeDoc.content.trim() &&
      !window.confirm(
        'Le document local n’est pas vide. Remplacer le contenu par l’import Google Docs ?'
      )
    ) {
      return;
    }
    try {
      const text = await importGoogleDocText(activeDoc.googleDocsUrl);
      const contentHash = await hashContent(text);
      dispatch(
        updateDoc(activeDoc.id, {
          content: text,
          contentHash,
          lastImportedAt: new Date().toISOString(),
        })
      );
      setPane('editor');
      toast.success('Contenu importé.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'import.");
    }
  };

  const handleRefresh = async () => {
    if (!activeDoc) return;
    if (!activeDoc.googleDocsUrl.trim()) {
      toast.error('Ajoutez une URL Google Docs.');
      return;
    }

    setSyncLoading(true);
    try {
      const result = await refreshGoogleDoc({
        url: activeDoc.googleDocsUrl,
        content: activeDoc.content,
        contentHash: activeDoc.contentHash,
      });

      if (result.outcome === 'cancelled') {
        toast.message('Rafraîchissement annulé.');
        return;
      }

      if (result.outcome === 'unchanged') {
        if (result.contentHash) {
          dispatch(
            updateDoc(activeDoc.id, {
              contentHash: result.contentHash,
              lastImportedAt: result.lastImportedAt,
            })
          );
        }
        toast.success('Déjà à jour.');
        return;
      }

      dispatch(
        updateDoc(activeDoc.id, {
          content: result.import.content,
          contentHash: result.import.contentHash,
          lastImportedAt: result.import.lastImportedAt,
        })
      );
      setPane('editor');
      toast.success('Contenu rafraîchi depuis Google Docs.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec du rafraîchissement.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportMarkdown = (result: MarkdownImportResult) => {
    if (!activeDoc) return;
    const shouldReplaceTitle =
      !activeDoc.title.trim() || activeDoc.title === 'Nouveau document';
    dispatch(
      updateDoc(activeDoc.id, {
        content: result.content,
        ...(shouldReplaceTitle ? { title: result.suggestedTitle } : {}),
      })
    );
    setPane('editor');
    toast.success('Fichier Markdown importé.');
  };

  const handleGenerateQuiz = () => {
    if (!state.settings.apiKey) {
      toast.error('Ajoutez votre clé API Gemini dans Paramètres.');
      dispatch(setTab('settings'));
      return;
    }
    dispatch(setTab('plateau'));
    toast.message('Plateau', {
      description: 'Lancez une partie avec la source « Notes Google Docs ».',
    });
  };

  if (!activeDoc) {
    return (
      <div className="flex h-full">
        <DocumentList
          docs={docs}
          activeDocId={null}
          onSelect={(id) => dispatch(setActiveDoc(id))}
          onAdd={handleAdd}
        />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Aucun document sélectionné.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <DocumentList
        docs={docs}
        activeDocId={activeDoc.id}
        onSelect={(id) => dispatch(setActiveDoc(id))}
        onAdd={handleAdd}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="space-y-3 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <input
              value={activeDoc.title}
              onChange={(e) => dispatch(updateDoc(activeDoc.id, { title: e.target.value }))}
              className="w-full bg-transparent font-display text-xl font-semibold outline-none"
            />
            <button
              type="button"
              onClick={() => {
                dispatch(deleteDoc(activeDoc.id));
                toast.success('Document supprimé.');
              }}
              className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
              aria-label="Supprimer le document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <TagEditor
            tags={activeDoc.tags ?? []}
            onChange={(tags) => dispatch(updateDoc(activeDoc.id, { tags }))}
          />
        </div>

        <DocsToolbar
          url={activeDoc.googleDocsUrl}
          pane={pane}
          savingLabel={savingLabel}
          syncStatus={syncStatus}
          lastImportedAt={activeDoc.lastImportedAt}
          syncLoading={syncLoading}
          onUrlChange={(url) => dispatch(updateDoc(activeDoc.id, { googleDocsUrl: url }))}
          onImport={handleImport}
          onRefresh={handleRefresh}
          onImportMarkdown={handleImportMarkdown}
          onImportMarkdownError={(message) => toast.error(message)}
          onPaneChange={setPane}
          onGenerateQuiz={handleGenerateQuiz}
          canOpenExternal={Boolean(docId)}
          externalUrl={docId ? `https://docs.google.com/document/d/${docId}/edit` : undefined}
        />

        <div className="flex min-h-0 flex-1">
          {pane === 'editor' && (
            <>
              <div className="min-w-0 flex-1">
                <MarkdownEditor
                  value={activeDoc.content}
                  onChange={(content) => dispatch(updateDoc(activeDoc.id, { content }))}
                />
              </div>
              <OutlinePanel content={activeDoc.content} />
            </>
          )}

          {pane === 'preview' && (
            <div
              className="flex-1 overflow-y-auto p-6 prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(activeDoc.content) }}
            />
          )}

          {pane === 'gdocs' && (
            <div className="flex flex-1 items-center justify-center p-4">
              {docId ? (
                <iframe
                  title="Google Docs"
                  src={buildGoogleDocsEmbedUrl(docId)}
                  className="h-full w-full rounded-xl border border-border bg-card"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ajoutez une URL Google Docs valide pour afficher l’aperçu intégré.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
