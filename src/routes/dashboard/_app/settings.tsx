import { useEffect, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthField, authInputClass } from '~/components/brand/AuthLayout';
import { GameButton } from '~/components/game/GameButton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';
import { Switch } from '~/components/ui/switch';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import { authClient, signOut } from '~/lib/auth-client';
import { updateSettings } from '~/lib/game.functions';
import { learnerStateQuery } from '~/lib/game.queries';
import { setSoundEnabled } from '~/lib/sfx';
import { cn } from '~/lib/utils';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/_app/settings')({
  head: () => seo({ title: `Settings | ${brand.name}`, noindex: true }),
  component: SettingsPage
});

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-3xl border-2 border-border p-5'>
      <h2 className='text-lg font-black'>{title}</h2>
      {description ? (
        <p className='mb-1 text-sm font-semibold text-muted-foreground'>
          {description}
        </p>
      ) : null}
      <div className='mt-3'>{children}</div>
    </section>
  );
}

function errorText(error: { message?: string } | null, fallback: string) {
  return error?.message ?? fallback;
}

function ProfileSection() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name);
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) throw new Error(errorText(error, 'Could not save your name'));
    },
    onSuccess: () => {
      toast.success('Name saved.');
      void queryClient.invalidateQueries({ queryKey: ['learner'] });
    }
  });
  return (
    <Section title='Profile'>
      <form
        className='flex flex-col gap-3'
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <AuthField id='settings-name' label='Name'>
          <Input
            id='settings-name'
            className={authInputClass}
            autoComplete='name'
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>
        {save.error ? (
          <p className='text-sm font-bold text-destructive'>{save.error.message}</p>
        ) : null}
        <GameButton
          type='submit'
          size='sm'
          className='self-start'
          data-testid='save-name'
          disabled={save.isPending || !name.trim() || name.trim() === user.name}
        >
          {save.isPending ? 'Saving…' : 'Save name'}
        </GameButton>
      </form>
    </Section>
  );
}

function EmailSection() {
  const { user } = Route.useRouteContext();
  const [email, setEmail] = useState(user.email);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const request = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.requestEmailChange({
        newEmail: newEmail.trim()
      });
      if (error) throw new Error(errorText(error, 'Could not send a code'));
    },
    onSuccess: () => setCodeSent(true)
  });
  const confirm = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.changeEmail({
        newEmail: newEmail.trim(),
        otp
      });
      if (error) throw new Error(errorText(error, 'That code didn’t work'));
    },
    onSuccess: () => {
      setEmail(newEmail.trim());
      setNewEmail('');
      setOtp('');
      setCodeSent(false);
      toast.success('Email updated.');
    }
  });

  return (
    <Section title='Email' description={`You sign in with ${email}.`}>
      {codeSent ? (
        <form
          className='flex flex-col gap-3'
          onSubmit={(event) => {
            event.preventDefault();
            confirm.mutate();
          }}
        >
          <p className='text-sm font-semibold'>
            Enter the six-digit code we sent to {newEmail}.
          </p>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {confirm.error ? (
            <p className='text-sm font-bold text-destructive'>{confirm.error.message}</p>
          ) : null}
          <div className='flex gap-2'>
            <GameButton
              type='submit'
              size='sm'
              disabled={otp.length < 6 || confirm.isPending}
            >
              {confirm.isPending ? 'Confirming…' : 'Confirm new email'}
            </GameButton>
            <GameButton
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setCodeSent(false)}
            >
              Cancel
            </GameButton>
          </div>
        </form>
      ) : (
        <form
          className='flex flex-col gap-3'
          onSubmit={(event) => {
            event.preventDefault();
            request.mutate();
          }}
        >
          <AuthField id='settings-email' label='New email'>
            <Input
              id='settings-email'
              type='email'
              className={authInputClass}
              autoComplete='email'
              required
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
            />
          </AuthField>
          {request.error ? (
            <p className='text-sm font-bold text-destructive'>{request.error.message}</p>
          ) : null}
          <GameButton
            type='submit'
            size='sm'
            variant='outline'
            className='self-start'
            disabled={request.isPending || !newEmail.trim()}
          >
            {request.isPending ? 'Sending…' : 'Send confirmation code'}
          </GameButton>
        </form>
      )}
    </Section>
  );
}

function LearningSection() {
  const queryClient = useQueryClient();
  const { data: state } = useSuspenseQuery(learnerStateQuery);
  const save = useMutation({
    mutationFn: (data: {
      dailyGoal?: number;
      soundEnabled?: boolean;
      showOnLeaderboard?: boolean;
    }) => updateSettings({ data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['learner'] }),
    onError: () => toast.error('That setting didn’t save. Please try again.')
  });

  return (
    <>
      <Section
        title='Daily goal'
        description='How much XP do you want to earn each day?'
      >
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4' role='radiogroup' aria-label='Daily goal'>
          {game.dailyGoalOptions.map((option) => (
            <button
              key={option.xp}
              type='button'
              role='radio'
              aria-checked={state.dailyGoal === option.xp}
              data-goal={option.xp}
              disabled={save.isPending}
              onClick={() => save.mutate({ dailyGoal: option.xp })}
              className={cn(
                'press-3d cursor-pointer rounded-2xl border-2 border-border p-3 text-center',
                state.dailyGoal === option.xp &&
                  'border-brand-primary bg-brand-primary-soft text-brand-primary [--lip:var(--brand-primary)]'
              )}
            >
              <span className='block font-black'>{option.label}</span>
              <span className='text-sm font-bold opacity-80'>{option.xp} XP</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title='Preferences'>
        <div className='flex flex-col gap-4'>
          <label className='flex items-center justify-between gap-4'>
            <span>
              <span className='block font-extrabold'>Sound effects</span>
              <span className='text-sm font-semibold text-muted-foreground'>
                Answer sounds and speaking words aloud when you tap them.{' '}
                {game.voiceDisclosure}
              </span>
            </span>
            <Switch
              data-testid='sound-toggle'
              checked={state.soundEnabled}
              onCheckedChange={(soundEnabled) => {
                setSoundEnabled(soundEnabled);
                save.mutate({ soundEnabled });
              }}
            />
          </label>
          <label className='flex items-center justify-between gap-4'>
            <span>
              <span className='block font-extrabold'>Show me on the leaderboard</span>
              <span className='text-sm font-semibold text-muted-foreground'>
                Other learners see your first name and last initial.
              </span>
            </span>
            <Switch
              checked={state.showOnLeaderboard}
              onCheckedChange={(showOnLeaderboard) =>
                save.mutate({ showOnLeaderboard })
              }
            />
          </label>
        </div>
      </Section>
    </>
  );
}

function useHasPassword() {
  const { data } = useQuery({
    queryKey: ['learner', 'accounts'],
    queryFn: async () => {
      const { data: accounts } = await authClient.listAccounts();
      return accounts ?? [];
    }
  });
  return data?.some((account) => account.providerId === 'credential');
}

function PasswordSection() {
  const hasPassword = useHasPassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const change = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true
      });
      if (error) throw new Error(errorText(error, 'Could not change your password'));
    },
    onSuccess: () => {
      setCurrent('');
      setNext('');
      toast.success('Password changed.');
    }
  });

  if (hasPassword === undefined) return null;
  if (!hasPassword) {
    return (
      <Section
        title='Password'
        description='You sign in with one-time email codes. You can add a password too.'
      >
        <GameButton asChild variant='outline' size='sm'>
          <Link to='/forgot-password'>Set a password</Link>
        </GameButton>
      </Section>
    );
  }
  return (
    <Section title='Password'>
      <form
        className='flex flex-col gap-3'
        onSubmit={(event) => {
          event.preventDefault();
          change.mutate();
        }}
      >
        <AuthField id='current-password' label='Current password'>
          <Input
            id='current-password'
            type='password'
            className={authInputClass}
            autoComplete='current-password'
            required
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        </AuthField>
        <AuthField id='new-password' label='New password'>
          <Input
            id='new-password'
            type='password'
            className={authInputClass}
            autoComplete='new-password'
            minLength={8}
            required
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
        </AuthField>
        {change.error ? (
          <p className='text-sm font-bold text-destructive'>{change.error.message}</p>
        ) : null}
        <GameButton
          type='submit'
          size='sm'
          variant='outline'
          className='self-start'
          disabled={change.isPending}
        >
          {change.isPending ? 'Saving…' : 'Change password'}
        </GameButton>
      </form>
    </Section>
  );
}

function AccountSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasPassword = useHasPassword();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!open) {
      setPassword('');
      setConfirmation('');
    }
  }, [open]);

  const leave = () => {
    queryClient.clear();
    void navigate({ to: '/' });
  };

  const signOutNow = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: leave
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.deleteUser(
        hasPassword ? { password } : {}
      );
      if (error) throw new Error(errorText(error, 'Could not delete your account'));
    },
    onSuccess: leave
  });

  return (
    <Section title='Account'>
      <div className='flex flex-wrap gap-3'>
        <GameButton
          variant='outline'
          size='sm'
          data-testid='sign-out'
          disabled={signOutNow.isPending}
          onClick={() => signOutNow.mutate()}
        >
          Sign out
        </GameButton>
        <GameButton
          variant='ghost'
          size='sm'
          className='text-brand-danger hover:bg-brand-danger-soft'
          data-testid='delete-account'
          onClick={() => setOpen(true)}
        >
          Delete account
        </GameButton>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-sm rounded-3xl p-6' showCloseButton={false}>
          <DialogTitle className='text-xl font-black'>
            Delete your account?
          </DialogTitle>
          <DialogDescription className='font-semibold'>
            This permanently erases your XP, streak, and lessons. It can’t be
            undone. Type DELETE to confirm.
          </DialogDescription>
          <form
            className='flex flex-col gap-3'
            onSubmit={(event) => {
              event.preventDefault();
              deleteAccount.mutate();
            }}
          >
            {hasPassword ? (
              <AuthField id='delete-password' label='Password'>
                <Input
                  id='delete-password'
                  type='password'
                  className={authInputClass}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </AuthField>
            ) : null}
            <AuthField id='delete-confirm' label='Type DELETE'>
              <Input
                id='delete-confirm'
                className={authInputClass}
                autoComplete='off'
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </AuthField>
            {deleteAccount.error ? (
              <p className='text-sm font-bold text-destructive'>
                {deleteAccount.error.message}
              </p>
            ) : null}
            <GameButton
              type='submit'
              variant='danger'
              data-testid='confirm-delete'
              disabled={confirmation !== 'DELETE' || deleteAccount.isPending}
            >
              {deleteAccount.isPending ? 'Deleting…' : 'Delete my account'}
            </GameButton>
            <GameButton
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
            >
              Keep my account
            </GameButton>
          </form>
        </DialogContent>
      </Dialog>
    </Section>
  );
}

function SettingsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-black'>Settings</h1>
      <LearningSection />
      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <AccountSection />
    </div>
  );
}
