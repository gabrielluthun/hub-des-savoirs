import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-secondary text-foreground',
        variant === 'outline' && 'border border-border bg-transparent hover:bg-secondary',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        variant === 'accent' && 'bg-quiz-accent text-black hover:bg-quiz-accent/90',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-11 px-5 text-sm',
        size === 'icon' && 'h-9 w-9',
        className
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-base text-foreground md:text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40',
          className
        )}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[120px] w-full rounded-xl border border-input bg-card px-3 py-2 text-base text-foreground md:text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40',
        className
      )}
      {...props}
    />
  );
});

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-base text-foreground md:text-sm outline-none focus:ring-2 focus:ring-ring/40',
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}

export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)}>
      {children}
    </label>
  );
}

const DIALOG_WIDTHS = {
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-xl',
} as const;

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Id given to the title, referenced by aria-labelledby. */
  titleId: string;
  title: ReactNode;
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  size?: keyof typeof DIALOG_WIDTHS;
  /** Extra classes for the scrolling body (spacing, typography). */
  bodyClassName?: string;
  /** Pinned under the body (e.g. a confirm button). */
  footer?: ReactNode;
  /** Close when the backdrop is clicked (default true). */
  closeOnBackdrop?: boolean;
  children: ReactNode;
}

/**
 * Modal with a header (eyebrow, title, close button) and a scrolling body.
 * Full screen below sm, with iOS safe-area insets; centered card from sm up.
 * Clicking the backdrop closes it unless closeOnBackdrop is false.
 */
export function Dialog({
  open,
  onClose,
  titleId,
  title,
  eyebrow,
  size = 'lg',
  bodyClassName,
  footer,
  closeOnBackdrop = true,
  children,
}: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col overflow-hidden bg-background',
          'sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl sm:border sm:border-border sm:shadow-lg',
          DIALOG_WIDTHS[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h2 id={titleId} className="font-display text-xl font-semibold">
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fermer"
            className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6',
            !footer && 'pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6',
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
