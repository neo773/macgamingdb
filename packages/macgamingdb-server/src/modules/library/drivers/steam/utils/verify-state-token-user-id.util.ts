import { jwtVerify } from 'jose';
import { STATE_TOKEN_ALGORITHM } from '../constants/state-token-algorithm.constant';
import { STATE_TOKEN_ISSUER } from '../constants/state-token-issuer.constant';
import { getStateTokenKey } from './get-state-token-key.util';

export const verifyStateTokenUserId = async ({
  token,
}: {
  token: string;
}): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, getStateTokenKey(), {
      issuer: STATE_TOKEN_ISSUER,
      algorithms: [STATE_TOKEN_ALGORITHM],
    });
    return typeof payload.uid === 'string' ? payload.uid : null;
  } catch {
    return null;
  }
};
