import { toast } from 'sonner';
import { downloadTextFile } from '@/lib/export';
import {
  jetpunkExportFilename,
  serializeJetpunkLists,
} from '@/lib/jetpunk-format';
import type { JetPunkList } from '@/types';

export function useJetpunkExport() {
  const exportLists = (lists: JetPunkList[], filename: string) => {
    if (lists.length === 0) {
      toast.error('Aucune liste à exporter.');
      return;
    }
    downloadTextFile(filename, serializeJetpunkLists(lists));
    toast.success(
      lists.length === 1
        ? 'Export .json téléchargé.'
        : `${lists.length} listes exportées.`
    );
  };

  return {
    exportList: (list: JetPunkList) =>
      exportLists([list], jetpunkExportFilename(list.title)),
    exportAll: (lists: JetPunkList[]) =>
      exportLists(lists, jetpunkExportFilename()),
  };
}
