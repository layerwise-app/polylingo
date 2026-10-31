import { Link, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();

  console.error(error);

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-card px-6 text-center'>
      <Mascot pose='sad' className='size-36' />
      <h1 className='text-2xl font-black'>Something went wrong</h1>
      <p className='max-w-md font-semibold text-muted-foreground'>
        Your progress is safe. Please try that again.
      </p>
      <div className='flex flex-wrap justify-center gap-3'>
        <GameButton onClick={() => void router.invalidate()}>
          Try again
        </GameButton>
        <GameButton asChild variant='outline'>
          <Link to='/'>Back home</Link>
        </GameButton>
      </div>
    </div>
  );
}
