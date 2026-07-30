/** Normalize a raw tag: trim, collapse spaces, lowercase for identity. */
export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function formatTagLabel(tag: string): string {
  if (!tag) return tag;
  return tag
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }
  return result;
}

export function addTag(tags: string[], raw: string): string[] {
  return dedupeTags([...tags, raw]);
}

export function removeTag(tags: string[], tag: string): string[] {
  const target = normalizeTag(tag);
  return tags.filter((t) => normalizeTag(t) !== target);
}
