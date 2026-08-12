import ky, { HTTPError, TimeoutError } from 'ky';
import {
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  MAX_BACKOFF_MS,
  RETRYABLE_METHODS,
  RETRYABLE_STATUS_CODES,
} from '../constants/http-retry-defaults.constant';
import { HttpRequestException } from '../exceptions/http-request.exception';

type FetchWithRetryParams = {
  url: string;
  init?: RequestInit;
  timeoutMs?: number;
  maxAttempts?: number;
};

export const fetchWithRetryOrThrow = async ({
  url,
  init,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: FetchWithRetryParams): Promise<Response> => {
  try {
    return await ky(url, {
      ...init,
      timeout: timeoutMs,
      retry: {
        limit: maxAttempts - 1,
        methods: RETRYABLE_METHODS,
        statusCodes: RETRYABLE_STATUS_CODES,
        backoffLimit: MAX_BACKOFF_MS,
      },
    });
  } catch (error) {
    if (error instanceof HTTPError) {
      return error.response;
    }

    if (error instanceof TimeoutError) {
      throw new HttpRequestException(
        `Request to "${url}" timed out after ${maxAttempts} attempt(s) of ${timeoutMs}ms`,
        'HTTP_REQUEST_TIMED_OUT',
      );
    }

    if (init?.signal?.aborted === true) {
      throw new HttpRequestException(
        `Request to "${url}" was aborted by the caller`,
        'HTTP_REQUEST_ABORTED',
      );
    }

    throw new HttpRequestException(
      `Request to "${url}" failed after ${maxAttempts} attempt(s): ${
        error instanceof Error ? error.message : String(error)
      }`,
      'HTTP_REQUEST_NETWORK_ERROR',
    );
  }
};
