import { useMemo } from 'react';
import { brand } from '~/brand.config';

const colors = [
  brand.colors.primary,
  brand.colors.accent,
  brand.colors.heart,
  brand.colors.success,
  brand.mascot.palette.crestTip
];

export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: pieces }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        size: 7 + Math.random() * 7,
        color: colors[index % colors.length],
        style: {
          '--drift': `${Math.random() * 120 - 60}px`,
          '--spin': `${Math.random() * 720 - 360}deg`,
          '--duration': `${2.2 + Math.random() * 1.6}s`,
          '--delay': `${Math.random() * 0.7}s`
        } as React.CSSProperties
      })),
    [pieces]
  );
  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 z-50 overflow-hidden'
    >
      {parts.map((part) => (
        <span
          key={part.id}
          className='confetti-piece'
          style={{
            ...part.style,
            left: `${part.left}%`,
            width: part.size,
            height: part.size * 1.5,
            background: part.color
          }}
        />
      ))}
    </div>
  );
}
