import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentList } from '@/features/docs/DocumentList';
import { DocsToolbar, type DocsPane } from '@/features/docs/DocsToolbar';
import { MarkdownEditor } from '@/features/docs/MarkdownEditor';
import { OutlinePanel } from '@/features/docs/OutlinePanel';
import {
  buildGoogleDocsEmbedUrl,
  extractGoogleDocId,
  importGoogleDocText,
} from '@/lib/google-docs';
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

  useEffect(() => {
    if (!activeDoc) return;
    setSavingLabel('Sauvegarde…');
    const timer = window.setTimeout(() => setSavingLabel('Sauvegardé'), 400);
    return () => window.clearTimeout(timer);
  }, [activeDoc?.content, activeDoc?.title, activeDoc?.googleDocsUrl]);

  const docId = activeDoc ? extractGoogleDocId(activeDoc.googleDocsUrl) : null;

  const handleAdd = () => {
    dispatch(
      addDoc({
        id: createId(),
        title: 'Nouveau document',
        googleDocsUrl: '',
        content: '',
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
    try {
      const text = await importGoogleDocText(activeDoc.googleDocsUrl);
      dispatch(updateDoc(activeDoc.id, { content: text }));
      setPane('editor');
      toast.success('Contenu importé.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'import.");
    }
  };

  const handleGenerateQuiz = () => {
    if (!state.settings.apiKey) {
      toast.error('Ajoutez votre clé API Gemini dans Paramètres.');
      dispatch(setTab('settings'));
      return;
    }
    dispatch(setTab('jeutv'));
    toast.message('Jeu TV', {
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
    <div className="flex h-full min-h-0">
      <DocumentList
        docs={docs}
        activeDocId={activeDoc.id}
        onSelect={(id) => dispatch(setActiveDoc(id))}
        onAdd={handleAdd}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
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

        <DocsToolbar
          url={activeDoc.googleDocsUrl}
          pane={pane}
          savingLabel={savingLabel}
          onUrlChange={(url) => dispatch(updateDoc(activeDoc.id, { googleDocsUrl: url }))}
          onImport={handleImport}
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
