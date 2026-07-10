import { z } from 'zod';
import { MacSpecificationSchema } from './mac-specification.dto';

export const MacConfigSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  label: z.string(),
  metadata: MacSpecificationSchema,
});
