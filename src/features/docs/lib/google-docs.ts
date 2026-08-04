import { htmlToMarkdown } from '@/features/docs/lib/html-to-markdown';
import { isTauriRuntime } from '@/lib/utils';

export function extractGoogleDocId(url: string): string | null {
  const match = /\/document\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  return match?.[1] ?? null;
}

export function buildGoogleDocsExportUrl(docId: string): string {
  // HTML keeps heading styles; plain txt strips them.
  // In Vite dev, proxy through the local server to avoid browser CORS.
  if (import.meta.env.DEV && !isTauriRuntime()) {
    return `/api/gdoc-export/document/d/${docId}/export?format=html`;
  }
  return `https://docs.google.com/document/d/${docId}/export?format=html`;
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

function isDeniedHtmlPage(html: string): boolean {
  const trimmed = html.trimStart();
  if (trimmed.includes('<title>Google Accounts</title>')) return true;
  // A real Docs export is a full HTML document; a tiny HTML shell is usually an error page.
  if (
    (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) &&
    html.length < 400 &&
    !/<h[1-6]|class="title"|doc-content/i.test(html)
  ) {
    return true;
  }
  return false;
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

  const html = await response.text();
  if (!html.trim()) {
    throw new Error('Le document importé est vide.');
  }

  if (isDeniedHtmlPage(html)) {
    throw new Error(
      "Impossible d'importer le document. Vérifiez que le partage est public ou « Toute personne disposant du lien »."
    );
  }

  const markdown = htmlToMarkdown(html);
  if (!markdown.trim()) {
    throw new Error('Le document importé est vide.');
  }

  return markdown;
}
