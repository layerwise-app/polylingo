import { createFileRoute, notFound } from '@tanstack/react-router';
import { brand } from '~/brand.config';
import { getLesson } from '~/content/course';
import { startLesson, submitAnswer } from '~/lib/game.functions';
import { LessonSession } from '~/components/lesson/LessonSession';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/lesson/$lessonId')({
  beforeLoad: ({ params }) => {
    if (!getLesson(params.lessonId)) throw notFound();
  },
  head: ({ params }) =>
    seo({
      title: `${getLesson(params.lessonId)?.title ?? 'Lesson'} | ${brand.name}`,
      noindex: true
    }),
  component: LessonPage
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  return (
    <LessonSession
      key={lessonId}
      start={() => startLesson({ data: { lessonId } })}
      submit={(data) => submitAnswer({ data })}
    />
  );
}
