import { hashContent } from '@/features/docs/lib/content-hash';
import { importGoogleDocText } from '@/features/docs/lib/google-docs';

export type DocSyncStatus = 'unsynced' | 'in_sync' | 'local_modified';

export type RemoteSyncCheck =
  | { kind: 'unchanged'; remoteHash: string; shouldStoreHash: boolean }
  | {
      kind: 'remote_changed';
      remoteText: string;
      remoteHash: string;
      localEdited: boolean;
    };

export function getDocSyncStatus(
  contentHash: string | undefined,
  localHash: string | null
): DocSyncStatus {
  if (!contentHash) return 'unsynced';
  if (!localHash) return 'in_sync';
  if (localHash === contentHash) return 'in_sync';
  return 'local_modified';
}

export async function checkRemoteDocSync(params: {
  url: string;
  content: string;
  contentHash?: string;
}): Promise<RemoteSyncCheck> {
  const remoteText = await importGoogleDocText(params.url);
  const [remoteHash, localHash] = await Promise.all([
    hashContent(remoteText),
    hashContent(params.content),
  ]);

  const localEdited = Boolean(params.contentHash) && localHash !== params.contentHash;

  if (params.contentHash && remoteHash === params.contentHash) {
    return { kind: 'unchanged', remoteHash, shouldStoreHash: false };
  }

  if (remoteHash === localHash) {
    return {
      kind: 'unchanged',
      remoteHash,
      shouldStoreHash: params.contentHash !== remoteHash,
    };
  }

  return {
    kind: 'remote_changed',
    remoteText,
    remoteHash,
    localEdited,
  };
}

export function buildRemoteReplaceConfirmMessage(localEdited: boolean): string {
  if (localEdited) {
    return (
      'Une nouvelle version distante est disponible.\n\n' +
      'Attention : vous avez des modifications locales qui seront écrasées.\n\n' +
      'Remplacer le contenu local ?'
    );
  }
  return (
    'Une nouvelle version distante est disponible.\n\n' +
    'Remplacer le contenu local ?'
  );
}
