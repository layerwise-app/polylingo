import { cn } from '~/lib/utils';

export function ProgressBar({
  value,
  max = 1,
  className,
  tone = 'primary',
  label
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: 'primary' | 'accent' | 'success';
  label: string;
}) {
  const percent = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn('h-4 w-full overflow-hidden rounded-full bg-border', className)}
    >
      <div
        className={cn(
          'progress-shine relative h-full rounded-full',
          tone === 'primary' && 'bg-brand-primary',
          tone === 'accent' && 'bg-brand-accent',
          tone === 'success' && 'bg-brand-success'
        )}
        style={{ width: `${percent}%` }}
      >
        {percent > 6 ? (
          <span className='absolute inset-x-2 top-1 h-1 rounded-full bg-white/40' />
        ) : null}
      </div>
    </div>
  );
}
