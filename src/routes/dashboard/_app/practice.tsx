import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Volume2 } from 'lucide-react';
import { Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';
import { HeartsCard } from '~/components/game/RightRail';
import { HeartIcon, XpIcon } from '~/components/game/icons';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import { describeExercise, getExercise, getExerciseLesson } from '~/content/course';
import { exerciseSpeech } from '~/content/course';
import { learnerStateQuery, practiceQuery } from '~/lib/game.queries';
import { playSpeech } from '~/lib/speech-player';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/_app/practice')({
  head: () => seo({ title: `Practice | ${brand.name}`, noindex: true }),
  loader: ({ context }) => context.queryClient.ensureQueryData(practiceQuery),
  component: PracticePage
});

function PracticePage() {
  const { data: practice } = useSuspenseQuery(practiceQuery);
  const { data: state } = useSuspenseQuery(learnerStateQuery);
  const count = practice.mistakes.length;

  return (
    <div className='flex flex-col gap-5'>
      <section className='flex flex-col items-center gap-3 rounded-3xl border-2 border-border p-6 text-center'>
        <Mascot pose={count > 0 ? 'think' : 'wave'} animate='bob' className='size-28' />
        <h1 className='text-2xl font-black'>Practice</h1>
        <p className='max-w-md font-semibold text-muted-foreground'>
          {!practice.canPractice
            ? 'Finish your first lesson, and it will be ready to practice here.'
            : count > 0
              ? `Review ${count === 1 ? 'your 1 past mistake' : `your ${count} past mistakes`}. Practice never costs hearts.`
              : 'No mistakes to fix right now. Review words from your finished lessons to stay sharp.'}
        </p>
        <div className='flex gap-2 text-sm font-black'>
          <span className='flex items-center gap-1 rounded-full bg-brand-danger-soft px-3 py-1.5 text-brand-danger-dark'>
            <HeartIcon className='size-5' /> +{game.hearts.practiceReward} heart
          </span>
          <span className='flex items-center gap-1 rounded-full bg-brand-accent-soft px-3 py-1.5 text-brand-accent-ink'>
            <XpIcon className='size-5' /> +{game.xp.practice} XP
          </span>
        </div>
        {practice.canPractice ? (
          <GameButton asChild size='lg' className='mt-1 w-full max-w-xs'>
            <Link to='/dashboard/practice-session' data-testid='start-practice'>
              Start practice
            </Link>
          </GameButton>
        ) : (
          <GameButton asChild size='lg' className='mt-1 w-full max-w-xs'>
            <Link to='/dashboard'>Go to your path</Link>
          </GameButton>
        )}
      </section>

      <div className='xl:hidden'>
        <HeartsCard state={state} />
      </div>

      {count > 0 ? (
        <section>
          <h2 className='mb-3 text-lg font-black'>Your mistakes</h2>
          <ul className='flex flex-col gap-2' data-mistakes-list>
            {practice.mistakes.map((item) => {
              const exercise = getExercise(item.exerciseId);
              if (!exercise) return null;
              const label = describeExercise(exercise);
              const speech = exerciseSpeech(exercise);
              return (
                <li
                  key={item.exerciseId}
                  className='flex items-center gap-3 rounded-2xl border-2 border-border p-3'
                >
                  {speech ? (
                    <button
                      type='button'
                      aria-label={`Hear ${speech}`}
                      onClick={() => void playSpeech(speech)}
                      className='grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-primary-soft text-brand-primary'
                    >
                      <Volume2 className='size-5' />
                    </button>
                  ) : null}
                  <div className='min-w-0'>
                    <p lang='es' className='font-extrabold'>
                      {label.es}
                    </p>
                    <p className='truncate text-sm font-semibold text-muted-foreground'>
                      {label.en}
                    </p>
                  </div>
                  <span className='ml-auto shrink-0 text-xs font-black text-muted-foreground uppercase'>
                    {getExerciseLesson(item.exerciseId)?.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
