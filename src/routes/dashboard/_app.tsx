import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppShell } from '~/components/game/AppShell';
import { learnerStateQuery } from '~/lib/game.queries';

export const Route = createFileRoute('/dashboard/_app')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(learnerStateQuery),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  )
});
