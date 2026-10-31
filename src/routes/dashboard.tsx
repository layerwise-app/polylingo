import { useEffect, useRef } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuthSession } from '~/lib/auth.functions';
import { claimGuestProgress, updateSettings } from '~/lib/game.functions';
import { learnerStateQuery } from '~/lib/game.queries';
import { clearGuestToken, peekGuestToken } from '~/lib/guest';
import { setSoundEnabled } from '~/lib/sfx';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({ to: '/sign-in' });
    }

    return { user: session.user };
  },
  head: () => seo({ title: 'Learn', noindex: true }),
  component: DashboardLayout
});

/** Runs once after sign-in, and on every signed-in page after that. */
function useLearnerSetup() {
  const queryClient = useQueryClient();
  const started = useRef(false);
  const { data: state } = useQuery(learnerStateQuery);

  useEffect(() => {
    if (state) setSoundEnabled(state.soundEnabled);
  }, [state]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      // The time zone goes first, so a carried-over lesson counts on the right day.
      await updateSettings({
        data: { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      });
      const guestToken = peekGuestToken();
      if (guestToken) {
        const result = await claimGuestProgress({ data: { guestToken } });
        clearGuestToken();
        if (result.claimed === 'completed') {
          toast.success(`Your lesson is saved. +${result.xp} XP!`);
        } else if (result.claimed === 'in_progress') {
          toast.success('Your lesson is saved. Pick up where you left off.');
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['learner'] });
    })().catch(() => {
      // Nothing is lost: the token stays, and this runs again on the next visit.
    });
  }, [queryClient]);
}

function DashboardLayout() {
  useLearnerSetup();
  return <Outlet />;
}
