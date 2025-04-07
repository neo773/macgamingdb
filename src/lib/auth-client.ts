'use client';

import { createAuthClient } from "better-auth/react"

import { magicLinkClient, passkeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [
    magicLinkClient(),
  ],
});
