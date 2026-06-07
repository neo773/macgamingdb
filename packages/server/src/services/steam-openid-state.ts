import { SignJWT, jwtVerify } from 'jose';

// Signed state token for the Steam OpenID link flow. Self-contained (carries
// the user id), so cookie-less clients — the iOS app — can complete the flow:
// the app mints it over an authenticated API call, Steam round-trips it via
// return_to, and the callback recovers the user from the token alone.

const ALG = 'HS256';
const ISSUER = 'macgamingdb:steam-link';
const TTL = '10m';

function getKey(): Uint8Array {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required to sign state tokens');
  }
  return new TextEncoder().encode(secret);
}

export async function issueStateToken(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(getKey());
}

/** Returns the user id embedded in a valid state token, or null. */
export async function verifyStateTokenUserId(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      issuer: ISSUER,
      algorithms: [ALG],
    });
    return typeof payload.uid === 'string' ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function verifyStateToken(
  token: string,
  expectedUserId: string,
): Promise<boolean> {
  return (await verifyStateTokenUserId(token)) === expectedUserId;
}

export function getAppOrigin(): string {
  if (process.env.STEAM_OPENID_REALM) return process.env.STEAM_OPENID_REALM;
  return process.env.NODE_ENV === 'production'
    ? 'https://macgamingdb.app'
    : 'https://macgamingdb.local';
}
