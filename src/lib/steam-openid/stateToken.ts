import { SignJWT, jwtVerify } from 'jose';

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

export async function verifyStateToken(
  token: string,
  expectedUserId: string,
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      issuer: ISSUER,
      algorithms: [ALG],
    });
    return payload.uid === expectedUserId;
  } catch {
    return false;
  }
}
