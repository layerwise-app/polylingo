import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '~/lib/utils';

const gameButtonVariants = cva(
  'press-3d inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-2xl border-2 border-transparent text-center font-extrabold uppercase tracking-wide outline-none focus-visible:ring-3 focus-visible:ring-primary/40 disabled:cursor-not-allowed aria-disabled:cursor-not-allowed [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-white [--lip:var(--brand-primary-dark)] hover:brightness-105 disabled:bg-border disabled:text-muted-foreground disabled:[--lip:transparent]',
        accent:
          'bg-brand-accent text-brand-accent-ink [--lip:var(--brand-accent-dark)] hover:brightness-105',
        success:
          'bg-brand-success text-white [--lip:var(--brand-success-dark)] hover:brightness-105',
        danger:
          'bg-brand-danger text-white [--lip:var(--brand-danger-dark)] hover:brightness-105',
        outline:
          'border-border bg-card text-brand-primary [--lip:var(--brand-border)] hover:bg-brand-primary-soft',
        ghost:
          'text-brand-primary [--lip-height:0px] hover:bg-brand-primary-soft'
      },
      size: {
        sm: 'min-h-10 px-4 text-xs',
        md: 'min-h-12 px-5 text-sm',
        lg: 'min-h-14 px-7 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);

export function GameButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof gameButtonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'button';
  return (
    <Component
      className={cn(gameButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
