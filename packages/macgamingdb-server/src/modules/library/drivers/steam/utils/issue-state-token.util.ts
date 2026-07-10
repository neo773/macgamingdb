import { SignJWT } from 'jose';
import { STATE_TOKEN_ALGORITHM } from '../constants/state-token-algorithm.constant';
import { STATE_TOKEN_ISSUER } from '../constants/state-token-issuer.constant';
import { STATE_TOKEN_TTL } from '../constants/state-token-ttl.constant';
import { getStateTokenKey } from './get-state-token-key.util';

export const issueStateToken = ({
  userId,
}: {
  userId: string;
}): Promise<string> =>
  new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: STATE_TOKEN_ALGORITHM })
    .setIssuer(STATE_TOKEN_ISSUER)
    .setIssuedAt()
    .setExpirationTime(STATE_TOKEN_TTL)
    .sign(getStateTokenKey());
