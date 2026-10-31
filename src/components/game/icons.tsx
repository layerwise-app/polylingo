import { cn } from '~/lib/utils';

/** The three game icons, drawn for this brand and shared across the app. */

export function HeartIcon({
  className,
  empty = false
}: {
  className?: string;
  empty?: boolean;
}) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden className={cn('size-6', className)}>
      <path
        d='M12 21 C4.5 15.5 2 11.5 2.6 7.8 C3.4 3.6 9 2.8 12 6.8 C15 2.8 20.6 3.6 21.4 7.8 C22 11.5 19.5 15.5 12 21 Z'
        fill={empty ? 'var(--brand-border)' : 'var(--brand-heart)'}
      />
      {empty ? null : (
        <path
          d='M6.6 8.6 C7 7.2 8 6.6 9 6.6'
          fill='none'
          stroke='#fff'
          strokeWidth='1.8'
          strokeLinecap='round'
          opacity='0.8'
        />
      )}
    </svg>
  );
}

export function FlameIcon({
  className,
  active = true
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden className={cn('size-6', className)}>
      <path
        d='M12 1.6 C13 6.4 19.6 9 19.6 15.4 C19.6 19.8 16.2 22.4 12 22.4 C7.8 22.4 4.4 19.8 4.4 15.4 C4.4 12 6.8 10 7.8 7 C9.4 8.4 9.8 9.8 9.8 10.8 C11.4 8.4 12 5 12 1.6 Z'
        fill={active ? '#FB923C' : 'var(--brand-border)'}
      />
      <path
        d='M12 11.6 C12.6 14 15.4 15 15.4 18 C15.4 20.4 13.8 22 12 22 C10.2 22 8.6 20.4 8.6 18 C8.6 15.4 11 14.6 12 11.6 Z'
        fill={active ? 'var(--brand-accent)' : '#F1F5F9'}
      />
    </svg>
  );
}

export function XpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden className={cn('size-6', className)}>
      <path
        d='M14 1.8 L4.6 13.8 H11 L9.4 22.2 L19.4 9.6 H12.8 Z'
        fill='var(--brand-accent)'
        stroke='var(--brand-accent-dark)'
        strokeWidth='1.4'
        strokeLinejoin='round'
      />
    </svg>
  );
}
