import { NextResponse, type NextRequest } from 'next/server';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis(process.env.REDIS_URL!);

const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth',
  points: 10,
  duration: 60,
});

const mutationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:mutation',
  points: 30,
  duration: 60,
});

const apiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:api',
  points: 100,
  duration: 60,
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

const TRUSTED_ORIGINS = new Set([
  'https://macgamingdb.app',
  ...(process.env.NODE_ENV !== 'production'
    ? [
        'http://macgamingdb.local',
        'http://localhost:3000',
        'http://localhost:8081',
      ]
    : []),
]);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin',
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request);

    try {
      if (pathname.startsWith('/api/auth/')) {
        await authLimiter.consume(ip);
      }

      if (request.method === 'POST') {
        await mutationLimiter.consume(ip);

        const origin = request.headers.get('origin');
        if (origin && !TRUSTED_ORIGINS.has(origin)) {
          return new NextResponse('Forbidden', { status: 403 });
        }
      }

      await apiLimiter.consume(ip);
    } catch {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
