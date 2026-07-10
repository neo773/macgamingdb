export const getStateTokenKey = (): Uint8Array => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required to sign state tokens');
  }
  return new TextEncoder().encode(secret);
};
