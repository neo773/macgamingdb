'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { SignInWithApple } from './SignInWithApple';

interface AuthPromptProps {
  promptMessage?: string;
  className?: string;
  magicLinkSent?: boolean;
  onMagicLinkSent?: () => void;
}

export default function AuthPrompt({
  promptMessage = 'Sign in to leave a review and help the community.',
  className,
  magicLinkSent: externalMagicLinkSent,
  onMagicLinkSent,
}: AuthPromptProps) {
  const { useSession } = authClient;
  const { data: session, isPending } = useSession();

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
      await authClient.signIn.magicLink({
        email,
        callbackURL: window.location.href,
      });

      if (onMagicLinkSent) {
        onMagicLinkSent();
      } else {
        setInternalMagicLinkSent(true);
      }
      toast('Check your email for a sign-in link.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
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

  const formContent = (
    <div ref={containerRef} tabIndex={-1} className={className}>
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

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide">or</span>
            <div className="h-px flex-1 bg-neutral-700" />
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
  );

  if (className) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-6">
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
        {formContent}
      </div>
    </div>
  );
}
