'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';

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
  promptMessage = 'To combat spam, please log in to share your experience.',
  className = 'absolute inset-0 bg-black/20 flex flex-col items-center justify-center rounded-3xl p-6 z-10',
  containerClassName = 'bg-black border border-[#272727] p-6 rounded-xl',
  magicLinkSent: externalMagicLinkSent,
  onMagicLinkSent,
}: AuthPromptProps) {
  const { useSession, signIn } = authClient;

  const {
    data: session,
    isPending, //loading state
  } = useSession();

  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [internalMagicLinkSent, setInternalMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const magicLinkSent = externalMagicLinkSent ?? internalMagicLinkSent;

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
        callbackURL: window.location.href, //redirect after successful login (optional)
      });

      if (onMagicLinkSent) {
        onMagicLinkSent();
      } else {
        setInternalMagicLinkSent(true);
      }
      toast('Magic link sent to your email!');
    } catch (error) {
      setError('Error sending magic link. Please try again.');
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
      className={className}
      style={{
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{ width: '100%', maxWidth: '24rem', margin: '0 auto' }}
        className={containerClassName}
      >
        <h3 className="text-xl font-bold mb-4">Login Required</h3>
        <p className="mb-6">{promptMessage}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {magicLinkSent ? (
          <div className="text-center py-4">
            <p className="mb-2">✉️ Magic link sent!</p>
            <p className="text-sm text-gray-400">
              Check your email for a login link.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={isLoggingIn}
              size="lg"
            >
              {isLoggingIn ? 'Sending Magic Link...' : 'Login with Magic Link'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
