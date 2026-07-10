'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FLOW_ERROR } from '@/modules/library/steam-connection/constants/FLOW_ERROR';

export function LibraryErrorToastEffect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (!errorCode) return;
    if (errorCode === FLOW_ERROR.PrivateLibrary) {
      toast.error(
        'Could not read your Steam library. Set your library to public and try again.',
      );
    } else if (
      errorCode === FLOW_ERROR.VerifyFailed ||
      errorCode === FLOW_ERROR.StateMismatch
    ) {
      toast.error('Steam sign-in failed. Try again.');
    }
  }, [searchParams]);

  return null;
}
