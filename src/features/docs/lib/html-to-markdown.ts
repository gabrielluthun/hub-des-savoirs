/**
 * Convert Google Docs HTML export to the app Markdown subset:
 * # / ## / ###, lists, **bold**, *italic*, `code`.
 */

type HeadingLevel = 1 | 2 | 3;

function cleanText(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/[\t\r\n]+/g, ' ').replace(/ {2,}/g, ' ');
}

function unwrapEmphasis(text: string): string {
  return text
    .replace(/^\*\*(.+)\*\*$/u, '$1')
    .replace(/^\*(.+)\*$/u, '$1')
    .trim();
}

function wrapInline(inner: string, mark: string): string {
  const trimmed = inner.trim();
  if (!trimmed) return inner;
  return `${inner.match(/^\s*/)?.[0] ?? ''}${mark}${trimmed}${mark}${inner.match(/\s*$/)?.[0] ?? ''}`;
}

function isBold(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'strong' || tag === 'b') return true;
  const w = el.style.fontWeight;
  const n = Number.parseInt(w, 10);
  return w === 'bold' || w === 'bolder' || (Number.isFinite(n) && n >= 600);
}

function isItalic(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
}

function inlineMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return cleanText(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') return '  \n';
  if (tag === 'script' || tag === 'style') return '';

  let inner = cleanText([...el.childNodes].map(inlineMarkdown).join(''));
  if (tag === 'code' || tag === 'kbd') return wrapInline(inner, '`');
  if (tag === 'a') return inner;
  if (isBold(el)) inner = wrapInline(inner, '**');
  if (isItalic(el)) inner = wrapInline(inner, '*');
  return inner;
}

function elementText(el: Element): string {
  return cleanText([...el.childNodes].map(inlineMarkdown).join('')).trim();
}

/** Google Docs CSS classes → heading level (body text is ~11pt). */
function buildHeadingClassMap(doc: Document): Map<string, HeadingLevel> {
  const map = new Map<string, HeadingLevel>([
    ['title', 1],
    ['subtitle', 2],
  ]);
  const css = [...doc.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
  const ruleRe = /\.([a-zA-Z][\w-]*)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = ruleRe.exec(css))) {
    const [, className, bodyRaw] = match;
    const body = bodyRaw.toLowerCase();
    const pt = /font-size\s*:\s*([\d.]+)pt/.exec(body);
    const px = /font-size\s*:\s*([\d.]+)px/.exec(body);
    const size = pt ? Number(pt[1]) : px ? Number(px[1]) * 0.75 : NaN;
    if (!Number.isFinite(size) || size < 14) continue;
    map.set(className, size >= 20 ? 1 : size >= 16 ? 2 : 3);
  }
  return map;
}

function headingLevel(el: HTMLElement, classMap: Map<string, HeadingLevel>): HeadingLevel | null {
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return Math.min(Number(tag[1]), 3) as HeadingLevel;
  if (el.classList.contains('title')) return 1;
  if (el.classList.contains('subtitle')) return 2;
  for (const name of el.classList) {
    const level = classMap.get(name);
    if (level) return level;
  }
  return null;
}

function convertList(list: HTMLElement): string {
  const items: string[] = [];
  for (const child of list.children) {
    if (child.tagName.toLowerCase() !== 'li') continue;
    const clone = child.cloneNode(true) as HTMLElement;
    const nested: string[] = [];
    for (const nestedList of [...clone.children]) {
      const t = nestedList.tagName.toLowerCase();
      if (t !== 'ul' && t !== 'ol') continue;
      nested.push(convertList(nestedList as HTMLElement));
      nestedList.remove();
    }
    const text = elementText(clone);
    if (text) items.push(`* ${text}`);
    items.push(...nested.filter(Boolean));
  }
  return items.join('\n');
}

function convertBlock(el: HTMLElement, classMap: Map<string, HeadingLevel>): string {
  const tag = el.tagName.toLowerCase();
  if (tag === 'ul' || tag === 'ol') return convertList(el);
  if (tag === 'hr') return '---';
  if (tag === 'div' || tag === 'section' || tag === 'article') {
    return convertChildren(el, classMap);
  }
  if (tag === 'table') {
    return [...el.querySelectorAll('tr')]
      .map((row) =>
        [...row.querySelectorAll('th, td')]
          .map((cell) => elementText(cell))
          .filter(Boolean)
          .join(' | ')
      )
      .filter(Boolean)
      .join('\n');
  }

  const text = elementText(el);
  if (!text) return '';

  const level = headingLevel(el, classMap);
  if (level) return `${'#'.repeat(level)} ${unwrapEmphasis(text)}`;
  if (tag === 'pre') return `\`\`\`\n${text}\n\`\`\``;
  if (tag === 'blockquote') return text.split('\n').map((l) => `> ${l}`).join('\n');
  return text;
}

function convertChildren(container: Element, classMap: Map<string, HeadingLevel>): string {
  const parts: string[] = [];
  for (const node of container.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = cleanText(node.textContent ?? '').trim();
      if (text) parts.push(text);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const block = convertBlock(node as HTMLElement, classMap);
    if (block) parts.push(block);
  }
  return parts.join('\n\n');
}

function isTitleCandidate(text: string): boolean {
  const line = unwrapEmphasis(text.trim());
  return Boolean(
    line &&
      !line.includes('\n') &&
      line.length <= 120 &&
      !/^(#{1,6}\s|[-*]\s|>|```)/.test(line) &&
      line !== '---'
  );
}

function nextNonEmpty(lines: string[], from: number): string {
  for (let i = from; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t) return t;
  }
  return '';
}

/**
 * Infer structure Google Docs lost as plain text:
 * - line before a list → ##
 * - line (or ##) before ## → #
 */
function promoteHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  return lines
    .map((line, i) => {
      const trimmed = line.trim();
      const next = nextNonEmpty(lines, i + 1);

      if (isTitleCandidate(trimmed) && /^[-*]\s+\S/.test(next)) {
        return `## ${unwrapEmphasis(trimmed)}`;
      }

      if (/^##\s+\S/.test(next)) {
        if (isTitleCandidate(trimmed)) return `# ${unwrapEmphasis(trimmed)}`;
        const m = /^##\s+(.+)$/.exec(trimmed);
        if (m) return `# ${unwrapEmphasis(m[1])}`;
      }

      return line;
    })
    .join('\n');
}

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const classMap = buildHeadingClassMap(doc);
  doc.querySelectorAll('script, style').forEach((el) => el.remove());

  const root =
    doc.querySelector('#contents') ??
    doc.querySelector('.doc-content') ??
    doc.body;

  const markdown = promoteHeadings(
    convertChildren(root, classMap)
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );

  return markdown ? `${markdown}\n` : '';
}
