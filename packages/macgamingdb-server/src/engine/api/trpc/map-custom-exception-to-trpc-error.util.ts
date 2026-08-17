import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { CustomException } from '../../exceptions/custom.exception';

const codeToTrpcCode = (code: string): TRPC_ERROR_CODE_KEY => {
  if (code.endsWith('_NOT_FOUND')) {
    return 'NOT_FOUND';
  }
  if (code.endsWith('_UNAUTHORIZED')) {
    return 'UNAUTHORIZED';
  }
  if (code.endsWith('_FORBIDDEN')) {
    return 'FORBIDDEN';
  }
  if (code.endsWith('_INVALID') || code.endsWith('_BAD_REQUEST')) {
    return 'BAD_REQUEST';
  }
  if (code.endsWith('_PRECONDITION_FAILED')) {
    return 'PRECONDITION_FAILED';
  }
  if (code.endsWith('_TOO_MANY_REQUESTS')) {
    return 'TOO_MANY_REQUESTS';
  }
  return 'INTERNAL_SERVER_ERROR';
};

const MAX_CAUSE_DEPTH = 5;

const findDomainException = (error: unknown): CustomException | null => {
  let current: unknown = error;

  for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth += 1) {
    if (current instanceof CustomException) {
      return current;
    }

    if (!(current instanceof Error)) {
      return null;
    }

    current = current.cause;
  }

  return null;
};

export const mapCustomExceptionToTrpcError = (error: unknown): never => {
  const domainException = findDomainException(error);

  if (domainException) {
    throw new TRPCError({
      code: codeToTrpcCode(domainException.code),
      message: domainException.userFriendlyMessage ?? domainException.message,
      cause: domainException,
    });
  }

  if (error instanceof TRPCError) {
    throw error;
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Internal server error',
    cause: error,
  });
};
