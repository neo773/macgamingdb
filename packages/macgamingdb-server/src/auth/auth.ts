import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins/magic-link';
import { bearer } from 'better-auth/plugins/bearer';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { expo } from '@better-auth/expo';
import { Resend } from 'resend';
import { SignJWT, importPKCS8 } from 'jose';
import {
  MacGamingDBMagicLinkEmail,
  MacGamingDBMagicLinkEmailText,
} from 'macgamingdb-emails/magic-link';
import { type DrizzleDB } from '../database/drizzle';
import * as schema from '../drizzle/schema';
import { REVIEW_ACCOUNT_EMAIL, REVIEW_ACCOUNT_OTP } from './auth.const';

async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const privateKey = (process.env.APPLE_PRIVATE_KEY!).replace(/\\n/g, '\n');

  const key = await importPKCS8(privateKey, 'ES256');

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime('180d')
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(key);
}

export const BetterAuthClient = async (db: DrizzleDB): Promise<ReturnType<typeof betterAuth>> => {
  const appleConfigured = process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY;
  const appleClientSecret = appleConfigured ? await generateAppleClientSecret() : '';

  return betterAuth({
    baseURL:
      process.env.NODE_ENV === 'production'
        ? 'https://macgamingdb.app'
        : 'https://macgamingdb.local',
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    },
    onAPIError: {
      onError(error, ctx) {
        console.error('[better-auth] API error:', error);
        console.error('[better-auth] path:', (ctx as { path?: string })?.path);
      },
    },
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
      usePlural: true,
    }),
    ...(appleConfigured && {
      socialProviders: {
        apple: {
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID as string,
          clientSecret: appleClientSecret,
          // Native iOS Sign in with Apple produces idTokens with the app's
          // bundle id as audience — required for the idToken sign-in flow
          appBundleIdentifier: 'com.zefholdings.MacGamingDB',
        },
      },
    }),
    trustedOrigins: [
      'macgamingdb://',
      'exp://',
      'http://localhost:8081',
      'http://macgamingdb.local',
      'https://macgamingdb.local',
      'https://macgamingdb.app',
      'https://appleid.apple.com',
    ],
    emailAndPassword: {
      enabled: true,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      expo(),
      // Mobile session tokens: sign-in responses carry `set-auth-token`,
      // and getSession accepts `Authorization: Bearer <token>`
      bearer(),
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        generateOTP: ({ email }) =>
          email === REVIEW_ACCOUNT_EMAIL ? REVIEW_ACCOUNT_OTP : undefined,
        async sendVerificationOTP({ email, otp }) {
          console.log(`Sending OTP to ${email}: ${otp}`);

          if (email === REVIEW_ACCOUNT_EMAIL) {
            return;
          }

          if (process.env.NODE_ENV !== 'production') {
            return;
          }
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'MacGamingDB <hello@macgamingdb.app>',
            replyTo: 'support@macgamingdb.app',
            to: email,
            subject: `${otp} is your MacGamingDB verification code`,
            text: [
              `Your MacGamingDB verification code is: ${otp}`,
              '',
              'It expires in 10 minutes. If you did not request this, you can ignore this email.',
              '',
              `@macgamingdb.app #${otp}`,
            ].join('\n'),
          });
        },
      }),
      magicLink({
        sendMagicLink: async ({ email, token, url }) => {
          console.log(
            `Sending magic link to ${email} with token ${token} and url ${url}`,
          );

          if (process.env.NODE_ENV !== 'production') {
            return;
          }
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'MacGamingDB <hello@macgamingdb.app>',
            replyTo: 'support@macgamingdb.app',
            to: email,
            subject: 'Log in to MacGamingDB with this magic link',
            react: MacGamingDBMagicLinkEmail({ magicLink: url }),
            text: MacGamingDBMagicLinkEmailText({ magicLink: url }),
          });
        },
      }),
    ],
  });
};

export type BetterAuthClientType = Awaited<ReturnType<typeof BetterAuthClient>>;
