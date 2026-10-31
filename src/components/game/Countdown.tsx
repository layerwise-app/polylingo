import { useEffect, useState } from 'react';

/** Time left as "3d 4h", "2h 5m", or "4m 9s". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function Countdown({
  to,
  onDone
}: {
  to: number;
  onDone?: () => void;
}) {
  // Rendered as a placeholder on the server, so the two renders always agree.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= to) {
        window.clearInterval(timer);
        onDone?.();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [to, onDone]);

  return <span className='tabular-nums'>{now === null ? '–' : formatDuration(to - now)}</span>;
}
