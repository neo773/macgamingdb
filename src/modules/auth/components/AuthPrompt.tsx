'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { SignInWithApple } from './SignInWithApple';

interface AuthPromptProps {
  /** Optional message to display above the form */
  promptMessage?: string;
  /** Style adjustments for embedding */
  className?: string;
  /** Style adjustments for the inner container */
  containerClassName?: string;
  /** External magic link sent state */
  magicLinkSent?: boolean;
  /** Callback when magic link is sent */
  onMagicLinkSent?: () => void;
}

export default function AuthPrompt({
  promptMessage = 'Sign in to leave a review and help the community.',
  className = 'absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl p-6 z-10',
  containerClassName = 'bg-neutral-950 border border-neutral-800 p-8 rounded-2xl shadow-2xl',
  magicLinkSent: externalMagicLinkSent,
  onMagicLinkSent,
}: AuthPromptProps) {
  const { useSession, signIn } = authClient;

  const {
    data: session,
    isPending,
  } = useSession();

  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [internalMagicLinkSent, setInternalMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const magicLinkSent = externalMagicLinkSent ?? internalMagicLinkSent;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      await signIn.magicLink({
        email: email,
        callbackURL: window.location.href,
      });

      if (onMagicLinkSent) {
        onMagicLinkSent();
      } else {
        setInternalMagicLinkSent(true);
      }
      toast('Check your email for a sign-in link.');
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (
    (typeof session?.user?.id !== 'undefined' || isPending) &&
    !magicLinkSent
  ) {
    return <></>;
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={className}
    >
      <div
        className={`w-full max-w-sm mx-auto ${containerClassName}`}
      >
        {magicLinkSent ? (
          <div className="text-center py-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white mb-1.5">
              Check your email
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We sent a sign-in link to<br />
              <span className="text-neutral-300">{email}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-3xl font-semibold tracking-tight text-white mb-1.5">
                Sign in
              </h3>
              <p className="text-sm text-neutral-400 leading-snug">
                {promptMessage}
              </p>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="you@email.com"
                required
                autoFocus={false}
                autoComplete="email"
                inputMode="email"
                className="bg-white/5 border-neutral-800 text-white placeholder:text-neutral-600 h-10"
              />
              <Button
                onClick={handleLogin}
                className="w-full"
                disabled={isLoggingIn}
                variant="secondary"
                size="lg"
              >
                {isLoggingIn ? 'Sending link...' : 'Continue with email'}
              </Button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-neutral-950 px-3 text-neutral-500 uppercase tracking-wide">
                  or
                </span>
              </div>
            </div>

            <SignInWithApple
              onClick={async () => {
                const data = await authClient.signIn.social({
                  provider: 'apple',
                });
                console.log(data);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
