import { isTauriRuntime } from '@/lib/utils';

export function extractGoogleDocId(url: string): string | null {
  const match = /\/document\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  return match?.[1] ?? null;
}

export function buildGoogleDocsExportUrl(docId: string): string {
  // In Vite dev, proxy through the local server to avoid browser CORS.
  if (import.meta.env.DEV && !isTauriRuntime()) {
    return `/api/gdoc-export/document/d/${docId}/export?format=txt`;
  }
  return `https://docs.google.com/document/d/${docId}/export?format=txt`;
}

export function buildGoogleDocsEmbedUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/preview`;
}

async function fetchExport(exportUrl: string): Promise<Response> {
  if (isTauriRuntime()) {
    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
    return tauriFetch(exportUrl, {
      method: 'GET',
      // Follow Google's redirect to googleusercontent.com
      maxRedirections: 5,
    });
  }
  return fetch(exportUrl);
}

function mapImportError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const lowered = message.toLowerCase();
  if (
    lowered.includes('load failed') ||
    lowered.includes('failed to fetch') ||
    lowered.includes('networkerror') ||
    lowered.includes('cors')
  ) {
    return new Error(
      "Impossible d'importer le document (réseau / CORS). Vérifiez le partage « Toute personne disposant du lien », ou utilisez l'app desktop / npm run dev."
    );
  }
  return error instanceof Error ? error : new Error(message);
}

export async function importGoogleDocText(url: string): Promise<string> {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    throw new Error('URL Google Docs invalide.');
  }

  const exportUrl = buildGoogleDocsExportUrl(docId);

  let response: Response;
  try {
    response = await fetchExport(exportUrl);
  } catch (error) {
    throw mapImportError(error);
  }

  if (!response.ok) {
    throw new Error(
      "Impossible d'importer le document. Vérifiez que le partage est public ou « Toute personne disposant du lien »."
    );
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error('Le document importé est vide.');
  }

  // Google sometimes returns an HTML login / denial page with HTTP 200.
  const trimmed = text.trimStart();
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('<title>Google Accounts</title>')
  ) {
    throw new Error(
      "Impossible d'importer le document. Vérifiez que le partage est public ou « Toute personne disposant du lien »."
    );
  }

  return text;
}
