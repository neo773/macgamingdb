import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { magicLink } from "better-auth/plugins/magic-link";
import { Resend } from "resend";
import MacGamingDBMagicLinkEmail from "@/react-email-starter/emails/magic-link";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        console.log(`Sending magic link to ${email} with token ${token} and url ${url}`);

        if (process.env.NODE_ENV !== "production") {
          return;
        }
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "MacGamingDB <hello@macgamingdb.com>",
          to: email,
          subject: "Log in to MacGamingDB with this magic link",
          react: MacGamingDBMagicLinkEmail({ magicLink: url }),
        });
      },
    }),
  ],
});

export type Auth = typeof auth;
