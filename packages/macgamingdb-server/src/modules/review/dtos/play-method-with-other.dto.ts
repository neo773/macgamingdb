import { z } from 'zod';
import { PlayMethodEnum } from '../../../schema';

// DB rows may contain legacy 'OTHER' play methods not accepted by review inputs
export const PlayMethodWithOtherEnum = z.enum([
  ...PlayMethodEnum.options,
  'OTHER',
]);
