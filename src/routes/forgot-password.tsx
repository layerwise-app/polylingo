import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AuthField, AuthLayout, authInputClass } from '~/components/brand/AuthLayout';
import { GameButton } from '~/components/game/GameButton';
import { Input } from '~/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '~/components/ui/input-otp';
import { brand } from '~/brand.config';
import { authClient } from '~/lib/auth-client';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/forgot-password')({
  head: () => seo({ title: `Reset your password | ${brand.name}`, noindex: true }),
  component: ForgotPasswordPage
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordsMatch = password === confirmPassword;

  const requestReset = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email
      });
      if (error) throw new Error(error.message ?? 'Failed to send reset code');
    }
  });

  const resetPassword = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password
      });
      if (error) throw new Error(error.message ?? 'Failed to reset password');
    }
  });

  if (resetPassword.isSuccess) {
    return (
      <AuthLayout
        pose='cheer'
        title='Password reset'
        description='Your password has been updated. You can now sign in.'
      >
        <GameButton asChild size='lg' className='w-full'>
          <Link to='/sign-in'>Back to sign in</Link>
        </GameButton>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      pose='think'
      title='Reset your password'
      description='We’ll send a six-digit reset code to your email.'
    >
      <div className='flex flex-col gap-4'>
        <form
          className='flex flex-col gap-3'
          onSubmit={(event) => {
            event.preventDefault();
            setOtp('');
            resetPassword.reset();
            requestReset.mutate();
          }}
        >
          <AuthField id='email' label='Email'>
            <Input
              id='email'
              type='email'
              className={authInputClass}
              autoComplete='email'
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setOtp('');
                requestReset.reset();
                resetPassword.reset();
              }}
            />
          </AuthField>
          {requestReset.error ? (
            <p className='text-sm font-bold text-destructive'>
              {requestReset.error.message}
            </p>
          ) : null}
          <GameButton
            type='submit'
            variant={requestReset.isSuccess ? 'outline' : 'primary'}
            disabled={requestReset.isPending}
          >
            {requestReset.isPending
              ? 'Sending…'
              : requestReset.isSuccess
                ? 'Resend code'
                : 'Send code'}
          </GameButton>
        </form>
        {requestReset.isSuccess ? (
          <form
            className='flex flex-col gap-4'
            onSubmit={(event) => {
              event.preventDefault();
              if (!passwordsMatch) return;
              resetPassword.mutate();
            }}
          >
            <p className='text-sm font-semibold text-muted-foreground'>
              Enter the code sent to {email} and choose a new password.
            </p>
            <InputOTP
              containerClassName='w-full'
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                resetPassword.reset();
              }}
            >
              <InputOTPGroup className='w-full'>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className='h-14 flex-1 text-lg font-black'
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <AuthField id='password' label='New password'>
              <Input
                id='password'
                type='password'
                className={authInputClass}
                autoComplete='new-password'
                minLength={8}
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  resetPassword.reset();
                }}
              />
            </AuthField>
            <AuthField id='confirm-password' label='Confirm new password'>
              <Input
                id='confirm-password'
                type='password'
                className={authInputClass}
                autoComplete='new-password'
                minLength={8}
                required
                aria-invalid={confirmPassword ? !passwordsMatch : undefined}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  resetPassword.reset();
                }}
              />
              {confirmPassword && !passwordsMatch ? (
                <p className='text-sm font-bold text-destructive'>
                  Passwords do not match.
                </p>
              ) : null}
            </AuthField>
            {resetPassword.error ? (
              <p className='text-sm font-bold text-destructive'>
                {resetPassword.error.message}
              </p>
            ) : null}
            <GameButton
              type='submit'
              size='lg'
              disabled={
                otp.length < 6 || !passwordsMatch || resetPassword.isPending
              }
            >
              {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
            </GameButton>
          </form>
        ) : null}
        <Link
          to='/sign-in'
          className='text-center text-sm font-bold text-brand-primary'
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
