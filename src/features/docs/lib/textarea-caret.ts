/** Styles copied onto a mirror div to measure caret position in a textarea. */
const MIRROR_STYLE_PROPS = [
  'direction',
  'boxSizing',
  'width',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'whiteSpace',
  'wordBreak',
  'wordWrap',
  'overflowWrap',
] as const;

/**
 * Pixel offset of a character index inside a textarea, accounting for soft wrap.
 * Inspired by component/textarea-caret-position.
 */
export function getTextareaCaretOffset(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const computed = window.getComputedStyle(element);
  const div = document.createElement('div');
  const style = div.style as CSSStyleDeclaration & Record<string, string>;

  style.position = 'absolute';
  style.visibility = 'hidden';
  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.overflowWrap = 'break-word';
  style.top = '0';
  style.left = '-9999px';

  for (const prop of MIRROR_STYLE_PROPS) {
    style[prop] = computed[prop as keyof CSSStyleDeclaration] as string;
  }

  // Match the content width used for wrapping (exclude vertical scrollbar).
  const scrollbarWidth = element.offsetWidth - element.clientWidth;
  if (scrollbarWidth > 0) {
    style.width = `${element.clientWidth}px`;
  }

  div.textContent = element.value.slice(0, position);
  const span = document.createElement('span');
  span.textContent = element.value.slice(position) || '.';
  div.appendChild(span);
  document.body.appendChild(div);

  const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
  const top = Math.max(0, span.offsetTop - paddingTop);
  const left = span.offsetLeft;

  document.body.removeChild(div);
  return { top, left };
}
