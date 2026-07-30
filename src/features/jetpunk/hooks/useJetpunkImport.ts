import { useState } from 'react';
import { toast } from 'sonner';
import { buildJetpunkLists } from '@/features/jetpunk/lib/build-list';
import { parseJetpunkExportJson } from '@/lib/jetpunk-format';
import { addJetpunkList } from '@/store/actions';
import type { AppAction, JetPunkList } from '@/types';

type Dispatch = (action: AppAction) => void;

export function useJetpunkImport(dispatch: Dispatch) {
  const [paste, setPaste] = useState('');

  const commitLists = (built: JetPunkList[]) => {
    if (built.length === 0) {
      toast.error('Aucune liste valide à importer.');
      return;
    }
    for (const list of built) {
      dispatch(addJetpunkList(list));
    }
    toast.success(
      built.length === 1
        ? `Liste « ${built[0].title} » importée (${built[0].items.length} items).`
        : `${built.length} listes importées.`
    );
  };

  const importRaw = (raw: string) => {
    try {
      commitLists(buildJetpunkLists(parseJetpunkExportJson(raw)));
      setPaste('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'import.");
    }
  };

  const importPaste = () => importRaw(paste);

  const importFile = async (file: File) => {
    try {
      const text = await file.text();
      importRaw(text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lecture du fichier impossible.');
    }
  };

  return {
    paste,
    setPaste,
    importPaste,
    importFile,
  };
}
