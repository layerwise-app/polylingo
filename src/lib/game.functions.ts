import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '~/lib/auth';
import type { Answer } from '~/lib/grading';
import * as engine from '~/server/engine';

const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw new Error('Unauthorized');
    return next({ context: { user: session.user } });
  }
);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireGuestToken(value: unknown): string {
  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw new Error('Invalid guest session');
  }
  return value;
}

function requireId(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 100) {
    throw new Error(`Invalid ${label}`);
  }
  return value;
}

function isShortString(value: unknown, max = 200): value is string {
  return typeof value === 'string' && value.length <= max;
}

function parseAnswer(value: unknown): Answer {
  const answer = value as Partial<Answer> | null;
  switch (answer?.kind) {
    case 'choice':
    case 'text':
      if (isShortString(answer.value, 500)) {
        return { kind: answer.kind, value: answer.value };
      }
      break;
    case 'words':
      if (
        Array.isArray(answer.value) &&
        answer.value.length <= 40 &&
        answer.value.every((word) => isShortString(word))
      ) {
        return { kind: 'words', value: answer.value };
      }
      break;
    case 'pairs':
      if (
        Array.isArray(answer.value) &&
        answer.value.length <= 12 &&
        answer.value.every(
          (pair) =>
            Array.isArray(pair) &&
            pair.length === 2 &&
            pair.every((part) => isShortString(part))
        ) &&
        Number.isInteger(answer.mismatches) &&
        answer.mismatches! >= 0
      ) {
        return {
          kind: 'pairs',
          value: answer.value,
          mismatches: answer.mismatches!
        };
      }
      break;
  }
  throw new Error('Invalid answer');
}

type SubmitInput = {
  attemptId: string;
  position: number;
  exerciseId: string;
  answer: Answer;
};

function parseSubmit(raw: unknown): SubmitInput {
  const input = raw as Partial<SubmitInput> | null;
  if (!Number.isInteger(input?.position) || input!.position! < 0) {
    throw new Error('Invalid position');
  }
  return {
    attemptId: requireId(input?.attemptId, 'attempt'),
    exerciseId: requireId(input?.exerciseId, 'exercise'),
    position: input!.position!,
    answer: parseAnswer(input?.answer)
  };
}

// Signed-in learners

export const fetchLearnerState = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => engine.getLearnerState(context.user.id));

export const startLesson = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: { lessonId: string }) => ({
    lessonId: requireId(input?.lessonId, 'lesson')
  }))
  .handler(({ data, context }) =>
    engine.startLesson(context.user.id, data.lessonId)
  );

export const startPractice = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(({ context }) => engine.startPractice(context.user.id));

export const submitAnswer = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(parseSubmit)
  .handler(({ data, context }) =>
    engine.submitAnswer({ type: 'user', id: context.user.id }, data)
  );

export const claimGuestProgress = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: { guestToken: string }) => ({
    guestToken: requireGuestToken(input?.guestToken)
  }))
  .handler(({ data, context }) =>
    engine.claimGuestProgress(context.user.id, data.guestToken)
  );

export const fetchLeaderboard = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => engine.getLeaderboard(context.user.id));

export const fetchProfile = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) =>
    engine.getProfileView(context.user.id, {
      name: context.user.name,
      createdAt: new Date(context.user.createdAt)
    })
  );

export const fetchPractice = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => engine.getPracticeView(context.user.id));

export const updateSettings = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    (input: {
      dailyGoal?: number;
      soundEnabled?: boolean;
      showOnLeaderboard?: boolean;
      timeZone?: string;
    }) => ({
      dailyGoal:
        typeof input?.dailyGoal === 'number' ? input.dailyGoal : undefined,
      soundEnabled:
        typeof input?.soundEnabled === 'boolean'
          ? input.soundEnabled
          : undefined,
      showOnLeaderboard:
        typeof input?.showOnLeaderboard === 'boolean'
          ? input.showOnLeaderboard
          : undefined,
      timeZone: typeof input?.timeZone === 'string' ? input.timeZone : undefined
    })
  )
  .handler(({ data, context }) => engine.updateSettings(context.user.id, data));

// Guests can only ever reach the free lesson.

export const startGuestLesson = createServerFn({ method: 'POST' })
  .validator((input: { guestToken: string; restart?: boolean }) => ({
    guestToken: requireGuestToken(input?.guestToken),
    restart: input?.restart === true
  }))
  .handler(({ data }) => engine.startGuestLesson(data.guestToken, data.restart));

export const submitGuestAnswer = createServerFn({ method: 'POST' })
  .validator((raw: SubmitInput & { guestToken: string }) => ({
    ...parseSubmit(raw),
    guestToken: requireGuestToken(raw?.guestToken)
  }))
  .handler(({ data }) => {
    const { guestToken, ...input } = data;
    return engine.submitAnswer({ type: 'guest', token: guestToken }, input);
  });
