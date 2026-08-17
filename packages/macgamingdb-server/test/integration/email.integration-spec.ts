import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest';
import {
  UnauthorizedException,
  BadRequestException,
  type ExecutionContext,
} from '@nestjs/common';
import { EmailController } from '../../src/engine/core-modules/email/controllers/email.controller';
import { InternalRequestGuard } from '../../src/engine/api/guards/internal-request.guard';
import { INTERNAL_REQUEST_SECRET_HEADER } from '../../src/engine/api/constants/internal-request-secret-header.constant';
import { createTestApp, type TestApp } from '../utils/create-test-app.util';

const MAGIC_LINK = 'https://macgamingdb.app/api/auth/magic-link/verify?token=t';
const INTERNAL_SECRET = 'internal-secret-for-tests';

type CapturedRequest = { url: string; body: Record<string, unknown> };

const createExecutionContext = (headers: Record<string, string>) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => headers[name],
      }),
    }),
  }) as unknown as ExecutionContext;

describe('internal email endpoints', () => {
  let app: TestApp;
  let controller: EmailController;
  let guard: InternalRequestGuard;
  let capturedRequests: CapturedRequest[];
  let fetchMock: MockInstance;

  beforeEach(async () => {
    app = await createTestApp();
    controller = app.get(EmailController);
    guard = new InternalRequestGuard();
    capturedRequests = [];

    vi.stubEnv('RESEND_API_KEY', 'resend-key-for-tests');
    vi.stubEnv('INTERNAL_API_SECRET', INTERNAL_SECRET);

    fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input, init) => {
        const request = new Request(input as RequestInfo, init);

        capturedRequests.push({
          url: request.url,
          body: JSON.parse(await request.text()),
        });

        return new Response(JSON.stringify({ id: 'email_sent' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      });
  });

  afterEach(async () => {
    fetchMock.mockRestore();
    vi.unstubAllEnvs();
    await app.close();
  });

  it('should render the magic link email to html when sending', async () => {
    await controller.sendMagicLink({
      email: 'player@example.com',
      magicLink: MAGIC_LINK,
    });

    expect(capturedRequests).toHaveLength(1);
    const [request] = capturedRequests;
    expect(request.url).toBe('https://api.resend.com/emails');
    expect(request.body.to).toBe('player@example.com');
    expect(request.body.html).toContain(MAGIC_LINK);
    expect(request.body.text).toContain(MAGIC_LINK);
  });

  it('should send a text-only email when sending a verification otp', async () => {
    await controller.sendVerificationOtp({
      email: 'player@example.com',
      otp: '123456',
    });

    const [request] = capturedRequests;
    expect(request.body.subject).toContain('123456');
    expect(request.body.text).toContain('123456');
    expect(request.body.html).toBeUndefined();
  });

  it('should throw a dispatch failure when resend rejects the email', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 422 }));

    await expect(
      controller.sendMagicLink({
        email: 'player@example.com',
        magicLink: MAGIC_LINK,
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_DISPATCH_FAILED' });
  });

  it('should reject the request when the payload is invalid', async () => {
    await expect(
      controller.sendMagicLink({ email: 'not-an-email' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(capturedRequests).toHaveLength(0);
  });

  it('should allow the request when the internal secret matches', () => {
    const context = createExecutionContext({
      [INTERNAL_REQUEST_SECRET_HEADER]: INTERNAL_SECRET,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject the request when the internal secret is wrong or missing', () => {
    const wrongSecret = createExecutionContext({
      [INTERNAL_REQUEST_SECRET_HEADER]: 'wrong-secret',
    });
    const missingSecret = createExecutionContext({});

    expect(() => guard.canActivate(wrongSecret)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(missingSecret)).toThrow(
      UnauthorizedException,
    );
  });
});
