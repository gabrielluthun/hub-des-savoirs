import { useEffect, useState } from 'react';
import { hashContent } from '@/features/docs/lib/content-hash';
import {
  buildRemoteReplaceConfirmMessage,
  checkRemoteDocSync,
  getDocSyncStatus,
  type DocSyncStatus,
} from '@/features/docs/lib/doc-sync';

export function useLocalContentHash(content: string): string | null {
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void hashContent(content).then((value) => {
        if (!cancelled) setHash(value);
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [content]);

  return hash;
}

export function useDocSyncStatus(
  contentHash: string | undefined,
  localHash: string | null
): DocSyncStatus {
  return getDocSyncStatus(contentHash, localHash);
}

export interface AppliedRemoteImport {
  content: string;
  contentHash: string;
  lastImportedAt: string;
}

export async function refreshGoogleDoc(params: {
  url: string;
  content: string;
  contentHash?: string;
}): Promise<
  | { outcome: 'unchanged'; contentHash?: string; lastImportedAt?: string }
  | { outcome: 'cancelled' }
  | { outcome: 'replaced'; import: AppliedRemoteImport }
> {
  const check = await checkRemoteDocSync(params);

  if (check.kind === 'unchanged') {
    if (!check.shouldStoreHash) {
      return { outcome: 'unchanged' };
    }
    return {
      outcome: 'unchanged',
      contentHash: check.remoteHash,
      lastImportedAt: new Date().toISOString(),
    };
  }

  const confirmed = window.confirm(buildRemoteReplaceConfirmMessage(check.localEdited));
  if (!confirmed) {
    return { outcome: 'cancelled' };
  }

  return {
    outcome: 'replaced',
    import: {
      content: check.remoteText,
      contentHash: check.remoteHash,
      lastImportedAt: new Date().toISOString(),
    },
  };
}
