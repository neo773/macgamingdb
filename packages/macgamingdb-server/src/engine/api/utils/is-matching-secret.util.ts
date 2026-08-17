import { timingSafeEqual } from 'node:crypto';

export const isMatchingSecret = ({
  provided,
  expected,
}: {
  provided: string;
  expected: string;
}): boolean => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};
