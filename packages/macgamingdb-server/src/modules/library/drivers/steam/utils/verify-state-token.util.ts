import { verifyStateTokenUserId } from './verify-state-token-user-id.util';

export const verifyStateToken = async ({
  token,
  expectedUserId,
}: {
  token: string;
  expectedUserId: string;
}): Promise<boolean> =>
  (await verifyStateTokenUserId({ token })) === expectedUserId;
