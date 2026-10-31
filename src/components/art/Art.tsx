import { illustrations } from '~/components/art/illustrations';
import { cn } from '~/lib/utils';

export function Art({
  name,
  className,
  title
}: {
  name: string;
  className?: string;
  /** Leave this out when a visible label already describes the picture. */
  title?: string;
}) {
  return (
    <svg
      viewBox='0 0 96 96'
      className={cn('size-20', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      {illustrations[name]}
    </svg>
  );
}
