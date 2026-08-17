export const INTERNAL_EMAIL_REQUEST_TIMEOUT_MS = 20_000;

// Sending is not idempotent — a retried POST would deliver the email twice
export const INTERNAL_EMAIL_MAX_ATTEMPTS = 1;
