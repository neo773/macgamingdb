import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetryOrThrow } from '../fetch-with-retry-or-throw.util';

const createResponse = (status: number) =>
  new Response(status === 204 ? null : 'body', { status });

describe('fetchWithRetryOrThrow', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return the response when the first attempt succeeds', async () => {
    fetchMock.mockResolvedValueOnce(createResponse(200));

    const response = await fetchWithRetryOrThrow({ url: 'https://api.test' });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should return the response instead of throwing when the status is a client error', async () => {
    fetchMock.mockResolvedValueOnce(createResponse(400));

    const response = await fetchWithRetryOrThrow({ url: 'https://api.test' });

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should retry when the status is retryable and return the eventual success', async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(503))
      .mockResolvedValueOnce(createResponse(200));

    const response = await fetchWithRetryOrThrow({
      url: 'https://api.test',
      maxAttempts: 2,
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should return the last response when every attempt is retryable', async () => {
    fetchMock.mockResolvedValue(createResponse(500));

    const response = await fetchWithRetryOrThrow({
      url: 'https://api.test',
      maxAttempts: 2,
    });

    expect(response.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should retry a post when the status is retryable', async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(429))
      .mockResolvedValueOnce(createResponse(200));

    const response = await fetchWithRetryOrThrow({
      url: 'https://api.test',
      init: { method: 'POST', body: '{}' },
      maxAttempts: 2,
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw a network exception when every attempt fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      fetchWithRetryOrThrow({ url: 'https://api.test', maxAttempts: 1 }),
    ).rejects.toMatchObject({
      name: 'HttpRequestException',
      code: 'HTTP_REQUEST_NETWORK_ERROR',
    });
  });

  it('should throw an aborted exception when the caller signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchWithRetryOrThrow({
        url: 'https://api.test',
        init: { signal: controller.signal },
      }),
    ).rejects.toMatchObject({
      name: 'HttpRequestException',
      code: 'HTTP_REQUEST_ABORTED',
    });
  });

  it('should throw a timeout exception when the request exceeds the timeout', async () => {
    fetchMock.mockImplementation(
      (_url: string, options: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () =>
            reject(options.signal?.reason),
          );
        }),
    );

    await expect(
      fetchWithRetryOrThrow({
        url: 'https://api.test',
        timeoutMs: 20,
        maxAttempts: 1,
      }),
    ).rejects.toMatchObject({
      name: 'HttpRequestException',
      code: 'HTTP_REQUEST_TIMED_OUT',
    });
  });
});
