import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
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
          'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40',
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
        'flex min-h-[120px] w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40',
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
        'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40',
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
