const POLL_INTERVAL_MS = 5;
const DEFAULT_TIMEOUT_MS = 2000;

export const waitFor = async (
  condition: () => boolean,
  { timeoutMs = DEFAULT_TIMEOUT_MS, description = 'condition' } = {},
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (condition()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${description}`);
};
