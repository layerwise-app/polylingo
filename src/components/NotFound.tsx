import { Link } from '@tanstack/react-router';
import { Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-card px-6 text-center'>
      <Mascot pose='think' animate='bob' className='size-36' />
      <h1 className='text-2xl font-black'>We can’t find that page</h1>
      <div className='font-semibold text-muted-foreground'>
        {children || <p>The page you’re looking for doesn’t exist.</p>}
      </div>
      <GameButton asChild>
        <Link to='/'>Back home</Link>
      </GameButton>
    </div>
  );
}
