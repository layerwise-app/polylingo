import { createFileRoute } from '@tanstack/react-router';
import { brand } from '~/brand.config';
import { LessonSession } from '~/components/lesson/LessonSession';
import { startPractice, submitAnswer } from '~/lib/game.functions';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/practice-session')({
  head: () => seo({ title: `Practice | ${brand.name}`, noindex: true }),
  component: () => (
    <LessonSession
      start={() => startPractice()}
      submit={(data) => submitAnswer({ data })}
      exitTo='/dashboard/practice'
    />
  )
});
