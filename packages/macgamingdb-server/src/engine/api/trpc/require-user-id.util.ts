import { TRPCError } from '@trpc/server';
import { type SessionContext } from './session-context.type';

export const requireUserIdOrThrow = (context: SessionContext): string => {
  const userId = context.user?.user?.id;
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization',
    });
  }
  return userId;
};
