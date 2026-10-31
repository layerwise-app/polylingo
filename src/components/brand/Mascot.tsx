import { brand, type MascotPose } from '~/brand.config';
import { cn } from '~/lib/utils';

export function Mascot({
  pose = 'idle',
  className,
  animate = 'none',
  decorative = true,
  style
}: {
  pose?: MascotPose;
  className?: string;
  animate?: 'none' | 'bob' | 'celebrate' | 'droop';
  decorative?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox='0 0 200 200'
      style={style}
      className={cn(
        'size-24 overflow-visible',
        animate === 'bob' && 'animate-mascot-bob',
        animate === 'celebrate' && 'animate-mascot-celebrate',
        animate === 'droop' && 'animate-mascot-droop',
        pose === 'wave' && 'mascot-waving',
        className
      )}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': brand.mascot.name })}
    >
      {brand.mascot.draw(pose, brand.mascot.palette)}
    </svg>
  );
}

export function Logo({
  className,
  showName = true
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-2xl font-black tracking-tight text-primary',
        className
      )}
    >
      <Mascot className='size-9' />
      {showName ? brand.name.toLowerCase() : null}
    </span>
  );
}
