import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LearningPath } from '~/components/game/LearningPath';
import { DailyGoalCard } from '~/components/game/RightRail';
import { ProgressBar } from '~/components/game/ProgressBar';
import { brand } from '~/brand.config';
import { lessons } from '~/content/course';
import { learnerStateQuery } from '~/lib/game.queries';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/_app/')({
  head: () => seo({ title: `Learn | ${brand.name}`, noindex: true }),
  component: LearnPage
});

function LearnPage() {
  const { data: state } = useSuspenseQuery(learnerStateQuery);
  const done = state.completedLessonIds.length;
  return (
    <div className='flex flex-col gap-6'>
      <section
        className='rounded-3xl bg-brand-primary p-5 text-white'
        style={{ boxShadow: '0 5px 0 var(--brand-primary-dark)' }}
      >
        <p className='text-sm font-black tracking-wide uppercase opacity-85'>
          Beginner {brand.language}
        </p>
        <h1 className='text-2xl font-black'>Your learning path</h1>
        <div className='mt-3 flex items-center gap-3'>
          <ProgressBar
            tone='accent'
            value={done}
            max={lessons.length}
            label='Course progress'
            className='bg-white/30'
          />
          <span className='shrink-0 text-sm font-black' data-course-progress>
            {done}/{lessons.length}
          </span>
        </div>
      </section>
      <div className='xl:hidden'>
        <DailyGoalCard state={state} />
      </div>
      <LearningPath state={state} />
    </div>
  );
}
