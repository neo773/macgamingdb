export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

export const DEFAULT_MAX_ATTEMPTS = 3;

export const MAX_BACKOFF_MS = 10_000;

export const RETRYABLE_METHODS = ['get', 'post', 'put', 'head', 'delete'];

export const RETRYABLE_STATUS_CODES = [408, 413, 429, 500, 502, 503, 504];
