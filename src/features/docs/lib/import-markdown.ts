export interface MarkdownImportResult {
  content: string;
  suggestedTitle: string;
}

export function isMarkdownFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.md') ||
    name.endsWith('.markdown') ||
    file.type === 'text/markdown' ||
    file.type === 'text/x-markdown'
  );
}

export function titleFromMarkdownFilename(filename: string): string {
  const base = filename.replace(/\.(md|markdown)$/i, '').trim();
  return base || 'Document importé';
}

export async function readMarkdownFile(file: File): Promise<MarkdownImportResult> {
  if (!isMarkdownFile(file)) {
    throw new Error('Sélectionnez un fichier Markdown (.md).');
  }

  const content = await file.text();
  if (!content.trim()) {
    throw new Error('Le fichier Markdown est vide.');
  }

  return {
    content,
    suggestedTitle: titleFromMarkdownFilename(file.name),
  };
}
