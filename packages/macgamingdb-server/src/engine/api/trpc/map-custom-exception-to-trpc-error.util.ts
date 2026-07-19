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

export const mapCustomExceptionToTrpcError = (error: unknown): never => {
  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof CustomException) {
    throw new TRPCError({
      code: codeToTrpcCode(error.code),
      message: error.userFriendlyMessage ?? error.message,
      cause: error,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Internal server error',
    cause: error,
  });
};
