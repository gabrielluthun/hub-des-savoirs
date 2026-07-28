export interface OutlineHeading {
  level: 1 | 2 | 3;
  text: string;
  line: number;
}

export function extractOutline(markdown: string): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  const lines = markdown.split('\n');
  lines.forEach((line, index) => {
    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (!match) return;
    headings.push({
      level: match[1].length as 1 | 2 | 3,
      text: match[2].trim(),
      line: index + 1,
    });
  });
  return headings;
}

export function renderMarkdownToHtml(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    if (/^###\s+/.test(line)) {
      closeList();
      html.push(`<h3 class="mt-4 mb-2 font-display text-lg font-semibold">${line.replace(/^###\s+/, '')}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      closeList();
      html.push(`<h2 class="mt-5 mb-2 font-display text-xl font-semibold">${line.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      closeList();
      html.push(`<h1 class="mt-2 mb-3 font-display text-2xl font-semibold">${line.replace(/^#\s+/, '')}</h1>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul class="my-2 list-disc space-y-1 pl-5">');
        inList = true;
      }
      html.push(`<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (line.trim() === '') {
      closeList();
      html.push('<div class="h-2"></div>');
      continue;
    }
    closeList();
    html.push(`<p class="my-1.5 leading-relaxed">${formatInline(line)}</p>`);
  }
  closeList();
  return html.join('\n');
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em]">$1</code>');
}
