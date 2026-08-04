import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Textarea } from '@/components/ui/primitives';
import { getTextareaCaretOffset } from '@/features/docs/lib/textarea-caret';

export interface MarkdownEditorHandle {
  scrollToLine: (line: number) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToLine(line: number) {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const lines = textarea.value.split('\n');
        const targetLine = Math.max(1, Math.min(line, lines.length));
        let charIndex = 0;
        for (let i = 0; i < targetLine - 1; i++) {
          charIndex += lines[i].length + 1;
        }

        const { top } = getTextareaCaretOffset(textarea, charIndex);

        // preventScroll évite le recentrage auto du focus ; on réapplique
        // scrollTop après setSelectionRange, qui peut aussi défiler.
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(charIndex, charIndex);
        const applyScroll = () => {
          textarea.scrollTop = top;
        };
        applyScroll();
        requestAnimationFrame(() => {
          applyScroll();
          requestAnimationFrame(applyScroll);
        });
      },
    }));

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-sm leading-relaxed focus:ring-0"
        placeholder="# Titre&#10;- Point 1&#10;- Point 2"
        spellCheck={false}
      />
    );
  }
);
