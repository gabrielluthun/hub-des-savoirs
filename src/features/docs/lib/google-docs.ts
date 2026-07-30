export function extractGoogleDocId(url: string): string | null {
  const match = /\/document\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  return match?.[1] ?? null;
}

export function buildGoogleDocsExportUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/export?format=txt`;
}

export function buildGoogleDocsEmbedUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/preview`;
}

export async function importGoogleDocText(url: string): Promise<string> {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    throw new Error('URL Google Docs invalide.');
  }

  const exportUrl = buildGoogleDocsExportUrl(docId);
  const response = await fetch(exportUrl);

  if (!response.ok) {
    throw new Error(
      "Impossible d'importer le document. Vérifiez que le partage est public ou « Toute personne disposant du lien »."
    );
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error('Le document importé est vide.');
  }
  return text;
}
