"use client";

import { createAuthClient } from "better-auth/react";

import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000",
  plugins: [magicLinkClient()],
});
